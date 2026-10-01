import { describe, expect, it } from "vitest";
import { availableQuantity, canPurchase, productStatus, stockLabel } from "@/lib/cart";

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

describe("DB status is authoritative", () => {
  it("an owner-held draft with stock is not purchasable and shows the review label", () => {
    const p = { active: true, stockQuantity: 5, status: "draft" as const };
    expect(productStatus(p)).toBe("draft");
    expect(canPurchase(p)).toBe(false);
    expect(availableQuantity(p)).toBe(0);
    expect(stockLabel(p)).toBe("กำลังตรวจสอบข้อมูล");
  });

  it("status 'active' still needs stock > 0 to be purchasable", () => {
    expect(canPurchase({ active: true, stockQuantity: 0, status: "active" })).toBe(false);
    expect(canPurchase({ active: true, stockQuantity: 2, status: "active" })).toBe(true);
  });

  it("archived is never purchasable even with stock", () => {
    expect(canPurchase({ active: false, stockQuantity: 9, status: "archived" })).toBe(false);
  });
});
