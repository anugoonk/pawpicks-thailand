import { describe, expect, it } from "vitest";
import { availableQuantity, stockLabel } from "@/lib/cart";
import { imageUrlSchema } from "@/lib/product-editor";
import { mapOrderRow } from "@/lib/orders";
import { shipmentSchema } from "@/lib/shipping";

describe("storefront stock", () => {
  it("disables purchasing unknown, empty and inactive inventory and caps each order", () => {
    expect(availableQuantity({ active: true, stockQuantity: null })).toBe(0);
    expect(availableQuantity({ active: true, stockQuantity: 0 })).toBe(0);
    expect(availableQuantity({ active: false, stockQuantity: 10 })).toBe(0);
    expect(availableQuantity({ active: true, stockQuantity: 2 })).toBe(2);
    expect(availableQuantity({ active: true, stockQuantity: 100 })).toBe(20);
    expect(stockLabel({ stockQuantity: null })).toBe("รอยืนยันสต็อก");
  });
});
describe("product image input", () => {
  it("accepts hosted and local product assets and rejects unsafe URL schemes", () => {
    for (const url of ["/assets/product-side.png", "https://example.test/item.jpg"]) expect(imageUrlSchema.safeParse(url).success).toBe(true);
    for (const url of ["javascript:alert(1)", "data:text/html,test", "//example.test/x", "http://example.test/x", "https://user:pass@example.test/x"]) expect(imageUrlSchema.safeParse(url).success).toBe(false);
  });
});
describe("shipment details", () => {
  it("validates the carrier, full order ID and tracking code", () => {
    const shipment = { orderId: "00000000-0000-0000-0000-000000000001", carrier: "Flash Express", trackingNumber: "TH123456789" };
    expect(shipmentSchema.safeParse(shipment).success).toBe(true);
    expect(shipmentSchema.safeParse({ ...shipment, trackingNumber: "<script>" }).success).toBe(false);
    expect(shipmentSchema.safeParse({ ...shipment, orderId: "00000000" }).success).toBe(false);
  });
  it("includes persisted delivery details in customer orders", () => {
    const order = mapOrderRow({ id: "o1", status: "fulfilled", amount_total_thb: 100, currency: "thb", created_at: "2026-09-12T00:00:00Z", order_items: [], shipping_address: null, shipping_carrier: "Flash Express", tracking_number: "TH123456789", shipped_at: "2026-09-12T01:00:00Z" });
    expect(order.shippingCarrier).toBe("Flash Express"); expect(order.trackingNumber).toBe("TH123456789"); expect(order.shippedAt).toBe("2026-09-12T01:00:00Z");
  });
});
