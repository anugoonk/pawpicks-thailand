import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import {
  nullUnknownProductIds,
  orderItemRowsFromLineItems,
  orderRowFromSession,
  referencedProductIds,
  resolveOrderOutcome,
  shippingAddressFromSession,
  type OrderItemRow,
} from "@/lib/checkout";

function session(overrides: Partial<Stripe.Checkout.Session> = {}) {
  return {
    id: "cs_test_1",
    payment_intent: "pi_1",
    client_reference_id: null,
    metadata: {},
    customer_details: { email: "buyer@example.com" },
    amount_total: 94000, // satang
    currency: "thb",
    payment_status: "paid",
    ...overrides,
  } as unknown as Stripe.Checkout.Session;
}

function lineItem(overrides: Partial<Stripe.LineItem> = {}) {
  return {
    description: "น้ำพุแมวอัตโนมัติ",
    quantity: 2,
    price: {
      unit_amount: 89000,
      product: { name: "fallback", metadata: { product_id: "auto-water-fountain" } },
    },
    ...overrides,
  } as unknown as Stripe.LineItem;
}

describe("resolveOrderOutcome", () => {
  it("completed + payment_status paid -> paid", () => {
    expect(
      resolveOrderOutcome("checkout.session.completed", { payment_status: "paid" }),
    ).toBe("paid");
  });

  it("completed + unpaid (PromptPay in flight) -> pending", () => {
    expect(
      resolveOrderOutcome("checkout.session.completed", { payment_status: "unpaid" }),
    ).toBe("pending");
  });

  it("async_payment_succeeded -> paid", () => {
    expect(
      resolveOrderOutcome("checkout.session.async_payment_succeeded", {
        payment_status: "unpaid",
      }),
    ).toBe("paid");
  });

  it("expired / async_payment_failed -> cancelled", () => {
    expect(
      resolveOrderOutcome("checkout.session.expired", { payment_status: "unpaid" }),
    ).toBe("cancelled");
    expect(
      resolveOrderOutcome("checkout.session.async_payment_failed", {
        payment_status: "unpaid",
      }),
    ).toBe("cancelled");
  });

  it("unrelated event -> null", () => {
    expect(
      resolveOrderOutcome("payment_intent.created", { payment_status: "paid" }),
    ).toBeNull();
  });
});

describe("orderRowFromSession", () => {
  const now = new Date("2026-09-11T00:00:00.000Z");

  it("converts satang to baht and stamps paid_at when paid", () => {
    const row = orderRowFromSession(session(), "paid", now);
    expect(row.amount_total_thb).toBe(940);
    expect(row.paid_at).toBe(now.toISOString());
    expect(row.email).toBe("buyer@example.com");
    expect(row.stripe_session_id).toBe("cs_test_1");
  });

  it("leaves paid_at null for a pending order", () => {
    expect(orderRowFromSession(session(), "pending", now).paid_at).toBeNull();
  });

  it("prefers client_reference_id, then metadata.user_id, then null", () => {
    expect(
      orderRowFromSession(session({ client_reference_id: "u1" }), "paid", now).user_id,
    ).toBe("u1");
    expect(
      orderRowFromSession(
        session({ client_reference_id: null, metadata: { user_id: "u2" } }),
        "paid",
        now,
      ).user_id,
    ).toBe("u2");
    expect(orderRowFromSession(session(), "paid", now).user_id).toBeNull();
  });

  it("handles an expanded payment_intent object and missing amount", () => {
    const row = orderRowFromSession(
      session({
        payment_intent: { id: "pi_x" } as Stripe.PaymentIntent,
        amount_total: null,
      }),
      "pending",
      now,
    );
    expect(row.stripe_payment_intent).toBeNull();
    expect(row.amount_total_thb).toBe(0);
  });

  it("carries the shipping address Checkout collected", () => {
    const row = orderRowFromSession(
      session({
        shipping_details: {
          name: "สมชาย ใจดี",
          phone: "0812345678",
          address: {
            line1: "123 ถ.สุขุมวิท",
            line2: null,
            city: "กรุงเทพมหานคร",
            state: null,
            postal_code: "10110",
            country: "TH",
          },
        },
      } as Partial<Stripe.Checkout.Session>),
      "paid",
      now,
    );
    expect(row.shipping_address).toEqual({
      name: "สมชาย ใจดี",
      phone: "0812345678",
      line1: "123 ถ.สุขุมวิท",
      line2: null,
      city: "กรุงเทพมหานคร",
      state: null,
      postalCode: "10110",
      country: "TH",
    });
  });

  it("has no shipping address when Checkout didn't collect one", () => {
    expect(orderRowFromSession(session(), "paid", now).shipping_address).toBeNull();
  });
});

describe("shippingAddressFromSession", () => {
  it("returns null when there's no shipping_details at all", () => {
    expect(shippingAddressFromSession({ shipping_details: null })).toBeNull();
  });

  it("defaults missing sub-fields to null rather than undefined", () => {
    const result = shippingAddressFromSession({
      shipping_details: { name: undefined, phone: undefined, address: undefined },
    } as unknown as Pick<Stripe.Checkout.Session, "shipping_details">);
    expect(result).toEqual({
      name: null,
      phone: null,
      line1: null,
      line2: null,
      city: null,
      state: null,
      postalCode: null,
      country: null,
    });
  });
});

describe("orderItemRowsFromLineItems", () => {
  it("maps description, satang price and quantity", () => {
    const [row] = orderItemRowsFromLineItems([lineItem()], "order-1");
    expect(row).toEqual({
      order_id: "order-1",
      product_id: "auto-water-fountain",
      name: "น้ำพุแมวอัตโนมัติ",
      unit_price_thb: 890,
      quantity: 2,
    });
  });

  it("falls back to product name then a generic label, and quantity 1", () => {
    const [noDesc] = orderItemRowsFromLineItems(
      [lineItem({ description: null })],
      "o",
    );
    expect(noDesc.name).toBe("fallback");

    const [bare] = orderItemRowsFromLineItems(
      [{ price: { unit_amount: 100 } } as unknown as Stripe.LineItem],
      "o",
    );
    expect(bare.name).toBe("สินค้า");
    expect(bare.quantity).toBe(1);
    expect(bare.product_id).toBeNull();
  });
});

describe("referencedProductIds / nullUnknownProductIds", () => {
  const rows: OrderItemRow[] = [
    { order_id: "o", product_id: "known", name: "a", unit_price_thb: 1, quantity: 1 },
    { order_id: "o", product_id: "gone", name: "b", unit_price_thb: 1, quantity: 1 },
    { order_id: "o", product_id: null, name: "c", unit_price_thb: 1, quantity: 1 },
  ];

  it("lists distinct non-null ids", () => {
    expect(referencedProductIds(rows).sort()).toEqual(["gone", "known"]);
  });

  it("keeps known ids and nulls the rest, names untouched", () => {
    const out = nullUnknownProductIds(rows, ["known"]);
    expect(out.map((r) => r.product_id)).toEqual(["known", null, null]);
    expect(out.map((r) => r.name)).toEqual(["a", "b", "c"]);
  });
});
