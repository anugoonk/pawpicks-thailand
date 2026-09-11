import { describe, expect, it } from "vitest";
import { mapOrderRow, type OrderRow } from "@/lib/orders";

function row(overrides: Partial<OrderRow> = {}): OrderRow {
  return {
    id: "order-1",
    status: "paid",
    amount_total_thb: 940,
    currency: "thb",
    created_at: "2026-09-11T00:00:00.000Z",
    shipping_address: null,
    order_items: [
      { name: "น้ำพุแมวอัตโนมัติ", quantity: 2, unit_price_thb: 890 },
    ],
    ...overrides,
  };
}

describe("mapOrderRow", () => {
  it("converts snake_case columns to the app's camelCase shape", () => {
    expect(mapOrderRow(row())).toEqual({
      id: "order-1",
      status: "paid",
      amountTotalThb: 940,
      currency: "thb",
      createdAt: "2026-09-11T00:00:00.000Z",
      shippingAddress: null,
      items: [{ name: "น้ำพุแมวอัตโนมัติ", quantity: 2, unitPriceThb: 890 }],
    });
  });

  it("passes a shipping address through unchanged", () => {
    const address = {
      name: "สมชาย ใจดี",
      phone: "0812345678",
      line1: "123 ถ.สุขุมวิท",
      line2: null,
      city: "กรุงเทพมหานคร",
      state: null,
      postalCode: "10110",
      country: "TH",
    };
    expect(mapOrderRow(row({ shipping_address: address })).shippingAddress).toEqual(
      address,
    );
  });

  it("defaults a null amount to 0 and null currency to thb", () => {
    const r = mapOrderRow(row({ amount_total_thb: null, currency: null }));
    expect(r.amountTotalThb).toBe(0);
    expect(r.currency).toBe("thb");
  });

  it("defaults null order_items to an empty array", () => {
    expect(mapOrderRow(row({ order_items: null })).items).toEqual([]);
  });

  it("maps multiple items in order", () => {
    const r = mapOrderRow(
      row({
        order_items: [
          { name: "a", quantity: 1, unit_price_thb: 100 },
          { name: "b", quantity: 3, unit_price_thb: 50 },
        ],
      }),
    );
    expect(r.items).toEqual([
      { name: "a", quantity: 1, unitPriceThb: 100 },
      { name: "b", quantity: 3, unitPriceThb: 50 },
    ]);
  });

  it("passes status and id through unchanged", () => {
    const r = mapOrderRow(row({ id: "abc", status: "pending" }));
    expect(r.id).toBe("abc");
    expect(r.status).toBe("pending");
  });
});
