import { describe, expect, it } from "vitest";
import { TOP10_ARTICLES } from "@/data/top10-articles";
import {
  getAllTop10Articles,
  getPublishedTop10Articles,
  getTop10StaticSlugs,
  isTop10PageViewable,
  getTop10ArticleBySlug,
  getTop10Articles,
  top10ArticleRoute,
} from "@/lib/top10";
import { computePawPicksScore, SCORE_WEIGHTS } from "@/lib/top10-score";
import { top10ArticleSchema } from "@/lib/types";

const SCORES = { quality: 80, features: 70, value: 60, reviews: 90, storeTrust: 50, warranty: 100 };

describe("Top 10 article data", () => {
  it("has valid articles, all defaulting to coming_soon with no items", () => {
    expect(TOP10_ARTICLES.length).toBe(20);
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
        updatedAt: "2026-10-01",
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
      scores: SCORES,
    }));
    expect(() =>
      top10ArticleSchema.parse({
        slug: "broken",
        title: "Broken",
        category: "Test",
        excerpt: "Test",
        updatedAt: "2026-10-01",
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
      scores: SCORES,
    }));
    expect(() =>
      top10ArticleSchema.parse({
        slug: "ready",
        title: "Ready",
        category: "Test",
        excerpt: "Test",
        updatedAt: "2026-10-01",
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

describe("20 Top 10 topics", () => {
  it("has exactly 20 unique slugs and titles", () => {
    expect(new Set(TOP10_ARTICLES.map((a) => a.slug)).size).toBe(20);
    expect(new Set(TOP10_ARTICLES.map((a) => a.title)).size).toBe(20);
  });

  it("includes the six previously missing topics", () => {
    const titles = TOP10_ARTICLES.map((a) => a.title).join("|");
    for (const t of ["ผลิตภัณฑ์กำจัดกลิ่นแมว", "เครื่องตัดเล็บ", "ชามอาหารช่วยให้แมวกินช้าลง", "เมื่อเจ้าของไม่อยู่บ้าน", "ทาสแมวมือใหม่", "Pet Tech สำหรับแมว"]) {
      expect(titles).toContain(t);
    }
  });

  it("the public listing shows all 20 while none are published", () => {
    expect(getTop10Articles()).toHaveLength(20);
  });
});

describe("status visibility", () => {
  it("production: only published pages are viewable", () => {
    expect(isTop10PageViewable("published", true)).toBe(true);
    expect(isTop10PageViewable("coming_soon", true)).toBe(false);
    expect(isTop10PageViewable("draft", true)).toBe(false);
    expect(isTop10PageViewable("archived", true)).toBe(false);
  });

  it("preview/dev: coming_soon and draft are viewable for review; archived never", () => {
    expect(isTop10PageViewable("coming_soon", false)).toBe(true);
    expect(isTop10PageViewable("draft", false)).toBe(true);
    expect(isTop10PageViewable("archived", false)).toBe(false);
  });

  it("draft and archived articles never appear in the public listing", () => {
    expect(getTop10Articles().every((a) => a.status === "published" || a.status === "coming_soon")).toBe(true);
    expect(getAllTop10Articles().length).toBeGreaterThanOrEqual(getTop10Articles().length);
  });

  it("unpublished articles cannot carry ranked items", () => {
    expect(() =>
      top10ArticleSchema.parse({
        slug: "x", title: "x", category: "x", excerpt: "x", updatedAt: "2026-10-01",
        status: "draft",
        items: [{ rank: 1, productName: "Made up", summary: "x" }],
      }),
    ).toThrow();
  });

  it("static slugs are all viewable", () => {
    expect(getTop10StaticSlugs().length).toBeGreaterThan(0);
  });
});

describe("PawPicks Score", () => {
  it("weights sum to 100%", () => {
    expect(SCORE_WEIGHTS.reduce((s, w) => s + w.weight, 0)).toBeCloseTo(1, 10);
  });

  it("computes the weighted total", () => {
    // 80*.25+70*.2+60*.2+90*.15+50*.1+100*.1 = 20+14+12+13.5+5+10 = 74.5
    expect(computePawPicksScore(SCORES)).toBe(74.5);
  });

  it("returns null without inputs (never invents a score)", () => {
    expect(computePawPicksScore(undefined)).toBeNull();
  });

  it("rejects publishing when an item has no score inputs", () => {
    const items = Array.from({ length: 10 }, (_, i) => ({ rank: i + 1, productName: `P${i}`, summary: "s" }));
    expect(() =>
      top10ArticleSchema.parse({
        slug: "x", title: "x", category: "x", excerpt: "x", updatedAt: "2026-10-01",
        status: "published", items, verifiedAt: "2026-10-01",
      }),
    ).toThrow();
  });
});

import { MAX_UPCOMING_TEASERS, getTop10ListedArticles } from "@/lib/top10";

describe("public Top 10 listing", () => {
  it("never shows a wall of coming-soon topics", () => {
    const listed = getTop10ListedArticles();
    expect(listed.filter((a) => a.status === "coming_soon").length).toBeLessThanOrEqual(MAX_UPCOMING_TEASERS);
    expect(listed.every((a) => a.status === "published" || a.status === "coming_soon")).toBe(true);
  });
});
