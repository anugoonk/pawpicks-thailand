import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import {
  nullUnknownProductIds,
  orderItemRowsFromLineItems,
  orderRowFromSession,
  referencedProductIds,
  resolveOrderOutcome,
} from "@/lib/checkout";
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
    if (isSessionEvent(event.type)) {
      const session = event.data.object as Stripe.Checkout.Session;
      const outcome = resolveOrderOutcome(event.type, session);
      if (outcome === "cancelled") {
        await markOrderFailed(session);
      } else if (outcome) {
        await writeOrder(session, outcome);
      }
    }
    // Any other event type is acknowledged so Stripe stops retrying.
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err);
    // 500 → Stripe will retry with back-off.
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function isSessionEvent(type: string): boolean {
  return type.startsWith("checkout.session.");
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

  const { data: order, error } = await supabase
    .from("orders")
    .upsert(orderRowFromSession(session, status), {
      onConflict: "stripe_session_id",
    })
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

  const draft = orderItemRowsFromLineItems(lineItems.data, orderId);

  const ids = referencedProductIds(draft);
  let knownIds: string[] = [];
  if (ids.length > 0) {
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .in("id", ids);
    knownIds = (existing ?? []).map((p) => p.id as string);
  }
  const rows = nullUnknownProductIds(draft, knownIds);

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
