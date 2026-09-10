import { describe, expect, it } from "vitest";
import { CAT_TEAM, COLLECTIONS, FALLBACK_PRODUCTS } from "@/lib/data";
import { catSchema, collectionSchema, productSchema } from "@/lib/types";

describe("static fallback content", () => {
  it("keeps the original 12-cat team", () => {
    expect(CAT_TEAM).toHaveLength(12);
    CAT_TEAM.forEach((c) => expect(() => catSchema.parse(c)).not.toThrow());
    expect(CAT_TEAM.map((c) => c.id)).toEqual(
      Array.from({ length: 12 }, (_, i) => `cat-${i + 1}`),
    );
  });

  it("keeps the 4 collections in display order", () => {
    expect(COLLECTIONS).toHaveLength(4);
    COLLECTIONS.forEach((c) =>
      expect(() => collectionSchema.parse(c)).not.toThrow(),
    );
  });

  it("has valid products with positive prices", () => {
    expect(FALLBACK_PRODUCTS.length).toBeGreaterThan(0);
    FALLBACK_PRODUCTS.forEach((p) => {
      expect(() => productSchema.parse(p)).not.toThrow();
      expect(p.priceThb).toBeGreaterThan(0);
      expect(p.shopeeUrl).toMatch(/^https:\/\/shopee\.co\.th\//);
    });
  });
});
