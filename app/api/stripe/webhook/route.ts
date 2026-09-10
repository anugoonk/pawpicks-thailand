import { NextResponse } from "next/server";
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
        await markOrderPaid(session);
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

async function markOrderPaid(session: Stripe.Checkout.Session) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();

  // Idempotent upsert keyed by the Stripe session id.
  const { error } = await supabase.from("orders").upsert(
    {
      stripe_session_id: session.id,
      stripe_payment_intent: (session.payment_intent as string) ?? null,
      status: "paid",
      email: session.customer_details?.email ?? null,
      amount_total_thb: Math.round((session.amount_total ?? 0) / 100),
      currency: session.currency ?? "thb",
      paid_at: new Date().toISOString(),
    },
    { onConflict: "stripe_session_id" },
  );
  if (error) throw error;
}

async function markOrderFailed(session: Stripe.Checkout.Session) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("stripe_session_id", session.id);
  if (error) throw error;
}
