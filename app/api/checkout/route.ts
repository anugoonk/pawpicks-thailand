import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getSiteUrl, hasStripe, hasSupabase, serverEnv } from "@/lib/env";
import { getProductsByIds } from "@/lib/products";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getStripe, assertTestModeOutsideProduction } from "@/lib/stripe";
import { checkoutRequestSchema } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Unauthenticated endpoint that hits the Stripe API — cap requests per IP.
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

/**
 * Create a Stripe Checkout Session.
 *
 * Prices are ALWAYS resolved on the server from our own product data — the
 * client only sends product ids + quantities. We never trust a
 * client-supplied amount.
 */
export async function POST(request: Request) {
  if (!hasStripe()) {
    return NextResponse.json(
      { error: "payments_unavailable" },
      { status: 503 },
    );
  }
  assertTestModeOutsideProduction();

  const limit = rateLimit(
    `checkout:${clientIp(request)}`,
    RATE_LIMIT,
    RATE_WINDOW_MS,
  );
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { items } = parsed.data;

  let products;
  try {
    products = await getProductsByIds(items.map((i) => i.productId));
  } catch (err) {
    console.error("checkout: product price lookup failed —", err);
    return NextResponse.json({ error: "pricing_unavailable" }, { status: 503 });
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let subtotalThb = 0;

  for (const item of items) {
    const product = products.get(item.productId);
    if (!product || !product.active) {
      return NextResponse.json(
        { error: "unknown_product", productId: item.productId },
        { status: 422 },
      );
    }
    subtotalThb += product.priceThb * item.quantity;
    lineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: "thb",
        unit_amount: product.priceThb * 100, // satang
        product_data: {
          name: product.name,
          metadata: { product_id: product.id },
        },
      },
    });
  }

  const { SHIPPING_FLAT_RATE, FREE_SHIPPING_THRESHOLD } = serverEnv();
  const shippingThb =
    subtotalThb >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;

  const siteUrl = getSiteUrl();
  const stripe = getStripe();

  // Link the order to a signed-in customer when there is one. Best-effort:
  // guest checkout stays fully supported.
  const customer = await currentCustomer();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "promptpay"],
    line_items: lineItems,
    currency: "thb",
    locale: "th",
    ...(customer?.id ? { client_reference_id: customer.id } : {}),
    ...(customer?.email ? { customer_email: customer.email } : {}),
    shipping_options:
      shippingThb > 0
        ? [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                display_name: "จัดส่งแบบมาตรฐาน",
                fixed_amount: { amount: shippingThb * 100, currency: "thb" },
              },
            },
          ]
        : undefined,
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/cancelled`,
    metadata: {
      subtotal_thb: String(subtotalThb),
      shipping_thb: String(shippingThb),
      ...(customer?.id ? { user_id: customer.id } : {}),
    },
  });

  // NOTE: order rows are created/confirmed from the verified webhook
  // (app/api/stripe/webhook), never here — this response can be lost.
  return NextResponse.json({ id: session.id, url: session.url });
}

/** The signed-in Supabase user, or null (guest / Supabase not configured). */
async function currentCustomer(): Promise<{ id: string; email?: string } | null> {
  if (!hasSupabase()) return null;
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return { id: user.id, email: user.email ?? undefined };
  } catch {
    return null;
  }
}
