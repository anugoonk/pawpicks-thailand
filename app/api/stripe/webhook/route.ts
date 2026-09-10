import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { serverEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook. An order only becomes `paid` here, AFTER the signature is
 * verified against STRIPE_WEBHOOK_SECRET. Never trust an unsigned request.
 */
export async function POST(request: Request) {
  const { STRIPE_WEBHOOK_SECRET } = serverEnv();
  if (!STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    // Do not log the payload or signature.
    console.error(
      "Stripe webhook signature verification failed:",
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // For synchronous methods (card) this is already `paid`. For delayed
        // methods (PromptPay) the session completes while payment is still
        // processing — do NOT mark it paid until `payment_status` says so;
        // the real confirmation arrives as `async_payment_succeeded`.
        await writeOrder(session, session.payment_status === "paid" ? "paid" : "pending");
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await writeOrder(session, "paid");
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await markOrderFailed(session);
        break;
      }
      default:
        // Acknowledge unhandled event types so Stripe stops retrying.
        break;
    }
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err);
    // 500 → Stripe will retry with back-off.
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/**
 * Upsert the order row (idempotent on `stripe_session_id`) and replace its
 * line items from the verified Stripe session. `status` is "pending" while a
 * delayed payment settles, then "paid".
 */
async function writeOrder(
  session: Stripe.Checkout.Session,
  status: "pending" | "paid",
) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();

  const userId =
    session.client_reference_id ?? session.metadata?.user_id ?? null;

  const { data: order, error } = await supabase
    .from("orders")
    .upsert(
      {
        stripe_session_id: session.id,
        stripe_payment_intent: (session.payment_intent as string) ?? null,
        user_id: userId,
        status,
        email: session.customer_details?.email ?? null,
        amount_total_thb: Math.round((session.amount_total ?? 0) / 100),
        currency: session.currency ?? "thb",
        paid_at: status === "paid" ? new Date().toISOString() : null,
      },
      { onConflict: "stripe_session_id" },
    )
    .select("id")
    .single();
  if (error) throw error;

  await syncOrderItems(supabase, order.id, session.id);
}

/** Mirror the session's line items into `order_items` (delete + reinsert). */
async function syncOrderItems(
  supabase: SupabaseClient,
  orderId: string,
  stripeSessionId: string,
) {
  const lineItems = await getStripe().checkout.sessions.listLineItems(
    stripeSessionId,
    { limit: 100, expand: ["data.price.product"] },
  );

  const draft = lineItems.data.map((li) => {
    const product = li.price?.product as Stripe.Product | undefined;
    return {
      order_id: orderId,
      product_id: product?.metadata?.product_id ?? null,
      name: li.description ?? product?.name ?? "สินค้า",
      unit_price_thb: Math.round((li.price?.unit_amount ?? 0) / 100),
      quantity: li.quantity ?? 1,
    };
  });

  // Null out any product_id that no longer exists in the catalogue so the
  // FK insert can't fail (and wedge webhook retries). The name is kept.
  const ids = [...new Set(draft.map((r) => r.product_id).filter(Boolean))];
  const known = new Set<string>();
  if (ids.length > 0) {
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .in("id", ids as string[]);
    for (const p of existing ?? []) known.add(p.id as string);
  }
  const rows = draft.map((r) => ({
    ...r,
    product_id: r.product_id && known.has(r.product_id) ? r.product_id : null,
  }));

  const { error: delError } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", orderId);
  if (delError) throw delError;

  if (rows.length > 0) {
    const { error: insError } = await supabase.from("order_items").insert(rows);
    if (insError) throw insError;
  }
}

async function markOrderFailed(session: Stripe.Checkout.Session) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  // Only touch a row that actually exists — an expired session that never
  // reached `completed` has no order to cancel.
  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("stripe_session_id", session.id);
  if (error) throw error;
}
