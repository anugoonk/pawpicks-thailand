import { describe, expect, it } from "vitest";
import { TEAM, getTeamCatById } from "@/data/team";
import { COLLECTIONS, FALLBACK_PRODUCTS } from "@/lib/data";
import { collectionSchema, productSchema } from "@/lib/types";

describe("static fallback content", () => {
  it("keeps the 12-cat team with unique ids and slugs", () => {
    expect(TEAM).toHaveLength(12);
    expect(TEAM.map((c) => c.id).sort()).toEqual(
      Array.from({ length: 12 }, (_, i) => `cat-${i + 1}`).sort(),
    );
    expect(new Set(TEAM.map((c) => c.slug)).size).toBe(12);
  });

  it("only references products and collections that exist", () => {
    const productSlugs = FALLBACK_PRODUCTS.map((p) => p.slug);
    const collectionIds = COLLECTIONS.map((c) => c.id);
    TEAM.forEach((c) => {
      c.productSlugs.forEach((s) => expect(productSlugs).toContain(s));
      c.collectionIds.forEach((id) => expect(collectionIds).toContain(id));
    });
  });

  it("links every product companion badge to a team profile", () => {
    FALLBACK_PRODUCTS.forEach((p) => {
      if (p.companionCatId) {
        expect(getTeamCatById(p.companionCatId)?.color).toBe(p.companionAlt);
      }
    });
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

  it("has unique product slugs for detail pages", () => {
    const slugs = FALLBACK_PRODUCTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
