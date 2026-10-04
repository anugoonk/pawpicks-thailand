import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BUSINESS, LEGAL_PAGES, LEGAL_READY, PENDING, isLegalPageIndexable } from "@/lib/legal";
import { productJsonLd } from "@/lib/product-jsonld";
import { top10JsonLd } from "@/lib/top10-jsonld";
import { isProductionDeploy } from "@/lib/env";
import type { Product, Top10Article } from "@/lib/types";

const base = "https://example.test";
const product = {
  id: "p", slug: "p", name: "P", category: "c", description: "d", priceThb: 100,
  image: "/x.png", active: true, stockQuantity: 3,
} as Product;

describe("trust pages", () => {
  it("every footer legal link has a page", () => {
    expect(LEGAL_PAGES.map((p) => p.href).sort()).toEqual(
      ["/affiliate-disclosure", "/contact", "/privacy", "/returns", "/shipping", "/terms"],
    );
    for (const { href } of LEGAL_PAGES) {
      expect(existsSync(join(process.cwd(), "app", href, "page.tsx"))).toBe(true);
    }
  });

  it("placeholders are explicit and keep unfinished pages out of the index", () => {
    // Holds whether or not the owner has filled in the facts yet: any remaining
    // placeholder must keep the legal pages noindex; once all are filled they go live.
    const unfilled = Object.values(BUSINESS).some((v) => v === PENDING);
    expect(LEGAL_READY).toBe(!unfilled);
    expect(isLegalPageIndexable("/privacy")).toBe(!unfilled);
    // The disclosure is factual and never waits on owner data.
    expect(isLegalPageIndexable("/affiliate-disclosure")).toBe(true);
  });
});

type Offers = { offers?: Record<string, unknown> };
const productNode = (p: Product, storeEnabled: boolean) =>
  productJsonLd(p, base, storeEnabled)[0] as unknown as Offers;

describe("product structured data", () => {
  it("omits offers when the store is off", () => {
    const prod = productNode(product, false);
    expect(prod.offers).toBeUndefined();
  });

  it("omits offers when stock is unconfirmed or zero", () => {
    for (const stockQuantity of [null, 0]) {
      const prod = productNode({ ...product, stockQuantity }, true);
      expect(prod.offers).toBeUndefined();
    }
  });

  it("emits DB-matching price/availability only when purchasable", () => {
    const prod = productNode(product, true);
    expect(prod.offers?.price).toBe(100);
    expect(prod.offers?.availability).toBe("https://schema.org/InStock");
  });

  it("never emits review or rating data", () => {
    const json = JSON.stringify(productJsonLd(product, base, true));
    expect(json).not.toMatch(/aggregateRating|"Review"|reviewRating/);
  });
});

describe("article structured data", () => {
  it("has Article, BreadcrumbList and ItemList, without ratings", () => {
    const article = {
      slug: "a", title: "T", excerpt: "E", category: "C", status: "published", updatedAt: "2026-10-01",
      items: [{ rank: 1, productName: "X", summary: "s", pros: [], considerations: [] }],
      howToChoose: [], faq: [],
    } as unknown as Top10Article;
    const json = top10JsonLd(article, base);
    expect(json.map((j) => j["@type"])).toEqual(["Article", "BreadcrumbList", "ItemList"]);
    expect(JSON.stringify(json)).not.toMatch(/aggregateRating|reviewRating/);
  });
});

describe("environment indexing", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("Vercel preview is not production", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(isProductionDeploy()).toBe(false);
  });

  it("Vercel production is production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(isProductionDeploy()).toBe(true);
  });
});
