import { describe, expect, it } from "vitest";
import {
  MAX_QTY,
  clampQty,
  computeTotals,
  sanitizeStoredItems,
  type CartLine,
} from "@/lib/cart";
import type { Product } from "@/lib/types";

function product(id: string, priceThb: number): Product {
  return {
    id,
    slug: id,
    name: id,
    category: "Test",
    description: "",
    priceThb,
    image: "/x.png",
    imageCrop: null,
    badge: null,
    badgeDark: false,
    companionCatId: null,
    companionLabel: null,
    companionImage: null,
    companionAlt: null,
    shopeeUrl: "https://shopee.co.th/x",
    searchKeywords: "",
    active: true,
    sortOrder: 0,
  };
}

const SHIPPING = { shippingFlatRate: 50, freeShippingThreshold: 1500 };

describe("clampQty", () => {
  it("keeps a normal quantity", () => {
    expect(clampQty(3)).toBe(3);
  });
  it("floors at 1 and rounds", () => {
    expect(clampQty(0)).toBe(1);
    expect(clampQty(-5)).toBe(1);
    expect(clampQty(2.4)).toBe(2);
  });
  it("caps at MAX_QTY", () => {
    expect(clampQty(999)).toBe(MAX_QTY);
  });
  it("falls back to 1 for non-finite input", () => {
    expect(clampQty(Number.NaN)).toBe(1);
    expect(clampQty(Number.POSITIVE_INFINITY)).toBe(1);
  });
});

describe("computeTotals", () => {
  const lines = (n: number, price = 300): CartLine[] => [
    { product: product("p1", price), quantity: n },
  ];

  it("is zero for an empty cart, with no shipping", () => {
    expect(computeTotals([], SHIPPING)).toEqual({
      count: 0,
      subtotalThb: 0,
      shippingThb: 0,
      totalThb: 0,
    });
  });

  it("adds flat shipping below the free threshold", () => {
    const t = computeTotals(lines(2), SHIPPING); // 600
    expect(t.subtotalThb).toBe(600);
    expect(t.shippingThb).toBe(50);
    expect(t.totalThb).toBe(650);
    expect(t.count).toBe(2);
  });

  it("gives free shipping exactly at the threshold", () => {
    const t = computeTotals(lines(5), SHIPPING); // 1500
    expect(t.subtotalThb).toBe(1500);
    expect(t.shippingThb).toBe(0);
    expect(t.totalThb).toBe(1500);
  });

  it("gives free shipping above the threshold", () => {
    const t = computeTotals(lines(6), SHIPPING); // 1800
    expect(t.shippingThb).toBe(0);
  });

  it("sums multiple products", () => {
    const t = computeTotals(
      [
        { product: product("a", 200), quantity: 2 },
        { product: product("b", 100), quantity: 1 },
      ],
      SHIPPING,
    );
    expect(t.subtotalThb).toBe(500);
    expect(t.count).toBe(3);
  });
});

describe("sanitizeStoredItems", () => {
  const known = (id: string) => id === "p1" || id === "p2";

  it("returns [] for non-array input", () => {
    expect(sanitizeStoredItems(null, known)).toEqual([]);
    expect(sanitizeStoredItems("nope", known)).toEqual([]);
  });

  it("drops unknown products and malformed rows", () => {
    const out = sanitizeStoredItems(
      [
        { productId: "p1", quantity: 2 },
        { productId: "gone", quantity: 1 },
        { productId: "p2" },
        { quantity: 3 },
        null,
      ],
      known,
    );
    expect(out).toEqual([{ productId: "p1", quantity: 2 }]);
  });

  it("clamps quantities and de-dupes", () => {
    const out = sanitizeStoredItems(
      [
        { productId: "p1", quantity: 999 },
        { productId: "p1", quantity: 1 },
        { productId: "p2", quantity: 0 },
      ],
      known,
    );
    expect(out).toEqual([
      { productId: "p1", quantity: MAX_QTY },
      { productId: "p2", quantity: 1 },
    ]);
  });
});
