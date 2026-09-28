import { describe, expect, it } from "vitest";
import { TOP10_ARTICLES } from "@/data/top10-articles";
import {
  getPublishedTop10Articles,
  getTop10ArticleBySlug,
  getTop10Articles,
  top10ArticleRoute,
} from "@/lib/top10";
import { top10ArticleSchema } from "@/lib/types";

describe("Top 10 article data", () => {
  it("has valid articles, all defaulting to coming_soon with no items", () => {
    expect(TOP10_ARTICLES.length).toBeGreaterThan(0);
    TOP10_ARTICLES.forEach((a) => {
      expect(() => top10ArticleSchema.parse(a)).not.toThrow();
      expect(a.status).not.toBe("published");
      expect(a.items).toEqual([]);
    });
  });

  it("has unique slugs", () => {
    const slugs = TOP10_ARTICLES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("rejects a published article without 10 verified items", () => {
    expect(() =>
      top10ArticleSchema.parse({
        slug: "broken",
        title: "Broken",
        category: "Test",
        excerpt: "Test",
        status: "published",
        items: [],
      }),
    ).toThrow();
  });

  it("rejects a published article without verifiedAt", () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      rank: i + 1,
      productName: `Product ${i + 1}`,
      summary: "Verified summary",
    }));
    expect(() =>
      top10ArticleSchema.parse({
        slug: "broken",
        title: "Broken",
        category: "Test",
        excerpt: "Test",
        status: "published",
        items,
      }),
    ).toThrow();
  });

  it("accepts a fully verified published article", () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      rank: i + 1,
      productName: `Product ${i + 1}`,
      summary: "Verified summary",
    }));
    expect(() =>
      top10ArticleSchema.parse({
        slug: "ready",
        title: "Ready",
        category: "Test",
        excerpt: "Test",
        status: "published",
        items,
        verifiedAt: "2026-09-28",
      }),
    ).not.toThrow();
  });
});

describe("lib/top10 helpers", () => {
  it("getTop10ArticleBySlug finds an existing article and returns null for unknown slugs", () => {
    const [first] = getTop10Articles();
    expect(getTop10ArticleBySlug(first.slug)).toEqual(first);
    expect(getTop10ArticleBySlug("does-not-exist")).toBeNull();
  });

  it("getPublishedTop10Articles only returns published articles", () => {
    expect(getPublishedTop10Articles().every((a) => a.status === "published")).toBe(true);
    // None of the seeded articles are published yet.
    expect(getPublishedTop10Articles()).toEqual([]);
  });

  it("top10ArticleRoute builds the shared article template route", () => {
    expect(top10ArticleRoute("automatic-cat-feeders")).toBe(
      "/top-10/automatic-cat-feeders",
    );
  });
});
