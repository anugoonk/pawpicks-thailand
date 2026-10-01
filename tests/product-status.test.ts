import { describe, expect, it } from "vitest";
import { availableQuantity, canPurchase, productStatus } from "@/lib/cart";

describe("productStatus / canPurchase", () => {
  it("inactive products are archived and never purchasable", () => {
    const p = { active: false, stockQuantity: 10 };
    expect(productStatus(p)).toBe("archived");
    expect(canPurchase(p)).toBe(false);
  });

  it("unconfirmed stock (null) stays draft — no add-to-cart", () => {
    const p = { active: true, stockQuantity: null };
    expect(productStatus(p)).toBe("draft");
    expect(canPurchase(p)).toBe(false);
    expect(availableQuantity(p)).toBe(0);
  });

  it("stock 0 is out_of_stock", () => {
    const p = { active: true, stockQuantity: 0 };
    expect(productStatus(p)).toBe("out_of_stock");
    expect(canPurchase(p)).toBe(false);
  });

  it("active with stock > 0 is purchasable and capped at MAX_QTY", () => {
    const p = { active: true, stockQuantity: 500 };
    expect(productStatus(p)).toBe("active");
    expect(canPurchase(p)).toBe(true);
    expect(availableQuantity(p)).toBe(20);
  });
});
