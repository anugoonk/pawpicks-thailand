import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isSafeAffiliateUrl, shopeeCtaLabel } from "@/lib/affiliate";
import { FALLBACK_PRODUCTS } from "@/lib/data";
import { LEGAL_PAGES } from "@/lib/legal";
import { getContactChannels, siteConfig } from "@/lib/site-config";
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
      ["/affiliate-disclosure", "/contact", "/how-we-choose", "/privacy", "/returns", "/shipping", "/terms"],
    );
    for (const { href } of LEGAL_PAGES) {
      expect(existsSync(join(process.cwd(), "app", href, "page.tsx"))).toBe(true);
    }
  });

  it("no page ships a developer placeholder or claims PawPicks sells/ships", () => {
    for (const { href } of LEGAL_PAGES) {
      const src = readFileSync(join(process.cwd(), "app", href, "page.tsx"), "utf8");
      expect(src, href).not.toMatch(/รอเจ้าของ|รอที่ปรึกษา|className="placeholder"|TODO|TBD/);
      expect(src, href).not.toMatch(/Stripe|คำสั่งซื้อของคุณ|เลขพัสดุในหน้าบัญชี/);
    }
  });

  it("contact channels are real links (or empty), never placeholders", () => {
    for (const c of getContactChannels()) {
      expect(c.href).toMatch(/^(https:\/\/|mailto:)/);
      expect(c.text.trim()).not.toBe("");
    }
  });
});

describe("affiliate links", () => {
  it("only https URLs can become affiliate buttons", () => {
    expect(isSafeAffiliateUrl("https://shopee.co.th/product/1")).toBe(true);
    for (const bad of ["#", "javascript:void(0)", "http://x.test", "", null, undefined, "not a url"]) {
      expect(isSafeAffiliateUrl(bad)).toBe(false);
    }
  });

  it("every catalogue product has a safe affiliate URL", () => {
    for (const p of FALLBACK_PRODUCTS) expect(isSafeAffiliateUrl(p.shopeeUrl), p.slug).toBe(true);
  });

  it("CTA copy never implies PawPicks sells the item", () => {
    expect(shopeeCtaLabel("https://shopee.co.th/search?keyword=x")).toContain("ค้นหา");
    expect(shopeeCtaLabel("https://shopee.co.th/item-i.1.2")).toContain("Shopee");
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
