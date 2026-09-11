import type Stripe from "stripe";

/** DB status an order should move to for a given verified webhook event. */
export type OrderOutcome = "paid" | "pending" | "cancelled";

/**
 * Map a verified Stripe event to the order status it implies, or null for
 * events we acknowledge but don't act on.
 *
 * `checkout.session.completed` is `paid` only when `payment_status` already
 * says so (card). Delayed methods (PromptPay) complete as `unpaid` and are
 * confirmed later by `async_payment_succeeded`.
 */
export function resolveOrderOutcome(
  eventType: string,
  session: Pick<Stripe.Checkout.Session, "payment_status">,
): OrderOutcome | null {
  switch (eventType) {
    case "checkout.session.completed":
      return session.payment_status === "paid" ? "paid" : "pending";
    case "checkout.session.async_payment_succeeded":
      return "paid";
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed":
      return "cancelled";
    default:
      return null;
  }
}

export type OrderRow = {
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  user_id: string | null;
  status: OrderOutcome;
  email: string | null;
  amount_total_thb: number;
  currency: string;
  paid_at: string | null;
};

/** Build the `orders` row from a verified session. `now` keeps it testable. */
export function orderRowFromSession(
  session: Stripe.Checkout.Session,
  status: OrderOutcome,
  now: Date = new Date(),
): OrderRow {
  return {
    stripe_session_id: session.id,
    stripe_payment_intent:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : null,
    user_id: session.client_reference_id ?? session.metadata?.user_id ?? null,
    status,
    email: session.customer_details?.email ?? null,
    amount_total_thb: Math.round((session.amount_total ?? 0) / 100),
    currency: session.currency ?? "thb",
    paid_at: status === "paid" ? now.toISOString() : null,
  };
}

export type OrderItemRow = {
  order_id: string;
  product_id: string | null;
  name: string;
  unit_price_thb: number;
  quantity: number;
};

/** Convert expanded Stripe line items into draft `order_items` rows. */
export function orderItemRowsFromLineItems(
  lineItems: Stripe.LineItem[],
  orderId: string,
): OrderItemRow[] {
  return lineItems.map((li) => {
    const product = li.price?.product as Stripe.Product | undefined;
    return {
      order_id: orderId,
      product_id: product?.metadata?.product_id ?? null,
      name: li.description ?? product?.name ?? "สินค้า",
      unit_price_thb: Math.round((li.price?.unit_amount ?? 0) / 100),
      quantity: li.quantity ?? 1,
    };
  });
}

/** Distinct, non-null product ids referenced by the given rows. */
export function referencedProductIds(rows: OrderItemRow[]): string[] {
  return [...new Set(rows.map((r) => r.product_id).filter((id): id is string => Boolean(id)))];
}

/**
 * Null out any product_id not present in `knownIds` so the FK insert can't
 * fail and wedge webhook retries. The product name is always kept.
 */
export function nullUnknownProductIds(
  rows: OrderItemRow[],
  knownIds: Iterable<string>,
): OrderItemRow[] {
  const known = new Set(knownIds);
  return rows.map((r) => ({
    ...r,
    product_id: r.product_id && known.has(r.product_id) ? r.product_id : null,
  }));
}
