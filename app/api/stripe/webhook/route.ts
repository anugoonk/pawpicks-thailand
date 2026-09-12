import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type Stripe from "stripe";
import {
  orderItemRowsFromLineItems,
  orderRowFromSession,
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
      if (outcome) {
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

/** Apply order, items and stock together; SQL handles retries and event order. */
async function writeOrder(session: Stripe.Checkout.Session, status: "pending" | "paid" | "cancelled") {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const lineItems = status === "cancelled" ? [] : (await getStripe().checkout.sessions.listLineItems(
    session.id, { limit: 100, expand: ["data.price.product"] },
  )).data;
  const rows = orderItemRowsFromLineItems(lineItems, "");
  const { error } = await supabase.rpc("apply_checkout_event", {
    p_order: orderRowFromSession(session, status),
    p_items: rows,
    p_inventory_required: session.metadata?.inventory_required === "true",
  });
  if (error) throw error;
  revalidatePath("/"); revalidatePath("/products/[slug]", "page");
  revalidatePath("/admin/products"); revalidatePath("/admin/orders"); revalidatePath("/account");
}
