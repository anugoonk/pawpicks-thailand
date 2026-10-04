import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ArticleView } from "@/components/article-view";
import { ProductCard } from "@/components/product-card";
import { ProductComparison } from "@/components/product-comparison";
import { ProductSections } from "@/components/product-sections";
import { CATEGORIES } from "@/data/categories";
import { registerAnalyticsProvider, trackAffiliateClick } from "@/lib/analytics";
import { buildComparison, parseCompareSlugs } from "@/lib/compare";
import { getCategory, guidesForCategory, isCategoryPopulated, productsForCategory } from "@/lib/categories";
import { FALLBACK_PRODUCTS } from "@/lib/data";
import { articleSchema } from "@/lib/guide-types";
import { buildToc, getGuideLinksForProduct, getPublishedGuides } from "@/lib/guides";
import { isProductPublic, merchantLabel, priceInfo, productAffiliateUrl, ratingInfo } from "@/lib/product-view";
import { getContactChannels, siteConfig } from "@/lib/site-config";
import type { Product } from "@/lib/types";

const SEARCH = "https://shopee.co.th/search?keyword=x";
const ITEM = "https://shopee.co.th/some-product-i.1.2";
const base = FALLBACK_PRODUCTS[0];
const make = (over: Partial<Product>): Product => ({ ...base, ...over }) as Product;

describe("site config", () => {
  it("never invents contact/social data", () => {
    expect(getContactChannels()).toEqual([]);
    expect(Object.values(siteConfig.social).every((v) => v === null)).toBe(true);
    expect(siteConfig.contact.email).toBeNull();
    expect(siteConfig.analytics.enabled).toBe(false);
  });

  it("builds channels only from real, https/mailto values", () => {
    const cfg = {
      ...siteConfig,
      contact: { email: "a@b.test" },
      social: { ...siteConfig.social, facebook: "https://facebook.com/x" },
    } as unknown as typeof siteConfig;
    expect(getContactChannels(cfg).map((c) => c.href)).toEqual(["mailto:a@b.test", "https://facebook.com/x"]);
  });
});

describe("product view rules", () => {
  it("hides price for a generic search link, shows it for a specific listing", () => {
    expect(priceInfo(make({ shopeeUrl: SEARCH, priceThb: 500 }))).toBeNull();
    expect(priceInfo(make({ shopeeUrl: ITEM, priceThb: 500 }))).toEqual({ price: 500 });
  });

  it("computes a discount only from two real numbers", () => {
    const info = priceInfo(make({ shopeeUrl: ITEM, priceThb: 750, compareAtPriceThb: 1000 }));
    expect(info).toEqual({ price: 750, originalPrice: 1000, discountPct: 25 });
    expect(priceInfo(make({ shopeeUrl: ITEM, priceThb: 750, compareAtPriceThb: 700 }))?.discountPct).toBeUndefined();
  });

  it("rating needs a review count; nothing is fabricated", () => {
    expect(ratingInfo(make({ rating: 4.5, reviewCount: undefined }))).toBeNull();
    expect(ratingInfo(make({ rating: 4.5, reviewCount: 0 }))).toBeNull();
    expect(ratingInfo(make({ rating: 4.5, reviewCount: 12 }))).toEqual({ rating: 4.5, reviewCount: 12 });
    expect(ratingInfo(base)).toBeNull();
  });

  it("labels a merchant only for an explicit merchant or a specific listing, not a keyword search", () => {
    expect(merchantLabel(make({ merchant: null, shopeeUrl: SEARCH }))).toBeNull();
    expect(merchantLabel(make({ merchant: null, shopeeUrl: ITEM }))).toBe("Shopee");
    expect(merchantLabel(make({ merchant: "ร้าน X", shopeeUrl: SEARCH }))).toBe("ร้าน X");
  });

  it("only safe URLs become affiliate links; draft/archived products are not public", () => {
    expect(productAffiliateUrl(make({ affiliateUrl: "https://s.shopee.co.th/abc", shopeeUrl: ITEM }))).toBe("https://s.shopee.co.th/abc");
    expect(productAffiliateUrl(make({ affiliateUrl: null, shopeeUrl: "http://insecure.test" }))).toBeNull();
    expect(isProductPublic({ contentStatus: undefined })).toBe(true);
    expect(isProductPublic({ contentStatus: "draft" })).toBe(false);
    expect(isProductPublic({ contentStatus: "archived" })).toBe(false);
  });
});

describe("ProductCard / ProductSections render only real data", () => {
  it("shows no rating, sold count, discount or highlights for a bare product", () => {
    const html = renderToStaticMarkup(createElement(ProductCard, { product: base }));
    expect(html).not.toMatch(/★|ขายแล้ว|-\d+%|product-highlights/);
    expect(html).toContain("เช็กราคาล่าสุดบน Shopee");
    expect(html).toContain('rel="noopener noreferrer sponsored"');
    expect(html).not.toMatch(/ซื้อจาก PawPicks/);
  });

  it("renders rating, sold count, discount, brand and highlights when present", () => {
    const p = make({
      shopeeUrl: ITEM, priceThb: 800, compareAtPriceThb: 1000, rating: 4.6, reviewCount: 120,
      soldCount: 300, brand: "BrandX", keyFeatures: ["ความจุ 4 ลิตร"],
    });
    const html = renderToStaticMarkup(createElement(ProductCard, { product: p }));
    expect(html).toContain("4.6");
    expect(html).toContain("120");
    expect(html).toContain("-20%");
    expect(html).toContain("BrandX");
    expect(html).toContain("ความจุ 4 ลิตร");
  });

  it("renders no CTA at all without a usable affiliate URL", () => {
    const html = renderToStaticMarkup(createElement(ProductCard, { product: make({ affiliateUrl: null, shopeeUrl: "#" }) }));
    expect(html).not.toContain("shopee-link");
  });

  it("product sections are empty-safe and never show 'กำลังตรวจสอบ' filler", () => {
    const html = renderToStaticMarkup(createElement(ProductSections, { product: base, guides: [] }));
    expect(html).not.toMatch(/กำลังตรวจสอบข้อมูล|รอเจ้าของ/);
    expect(html).not.toContain("ข้อดี");
  });

  it("product sections show pros/cons, specs and last-check dates when given", () => {
    const p = make({
      pros: ["เงียบ"], cons: ["ราคาสูง"], specifications: { ความจุ: "4 ลิตร" },
      bestFor: "บ้านที่มีแมว 1–2 ตัว", lastPriceCheck: "2026-10-01",
    });
    const html = renderToStaticMarkup(createElement(ProductSections, { product: p, guides: [] }));
    for (const t of ["เงียบ", "ราคาสูง", "4 ลิตร", "บ้านที่มีแมว 1–2 ตัว", "ตรวจราคาล่าสุด"]) expect(html).toContain(t);
  });
});

describe("comparison", () => {
  const a = make({ id: "a", slug: "a", name: "A", shopeeUrl: ITEM, priceThb: 100, pros: ["ดี"], specifications: { ความจุ: "2L" } });
  const b = make({ id: "b", slug: "b", name: "B", shopeeUrl: SEARCH, specifications: {} });

  it("emits a row only when some product has data, and null for missing cells", () => {
    const rows = buildComparison([a, b]);
    const byKey = Object.fromEntries(rows.map((r) => [r.key, r]));
    expect(byKey.price.cells[1]).toBeNull();
    expect(byKey["spec:ความจุ"].cells).toEqual(["2L", null]);
    expect(byKey.rating).toBeUndefined();
    expect(byKey.cons).toBeUndefined();
  });

  it("renders 'ไม่มีข้อมูล' for gaps and needs at least two products", () => {
    expect(renderToStaticMarkup(createElement(ProductComparison, { products: [a] }))).toBe("");
    expect(renderToStaticMarkup(createElement(ProductComparison, { products: [a, b] }))).toContain("ไม่มีข้อมูล");
  });

  it("parses ?items= into unique, capped slugs", () => {
    expect(parseCompareSlugs("a, b,a,,c,d,e")).toEqual(["a", "b", "c", "d"]);
    expect(parseCompareSlugs(undefined)).toEqual([]);
  });
});

describe("categories", () => {
  it("has unique slugs and valid parents", () => {
    const slugs = CATEGORIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    CATEGORIES.forEach((c) => c.parent && expect(slugs).toContain(c.parent));
  });

  it("places catalogue products by keyword and leaves empty categories unpublished", () => {
    expect(productsForCategory(getCategory("pet-cameras")!, FALLBACK_PRODUCTS).map((p) => p.slug)).toEqual(["wifi-pet-camera"]);
    expect(isCategoryPopulated(getCategory("litter-boxes")!, FALLBACK_PRODUCTS)).toBe(false);
    expect(isCategoryPopulated(getCategory("auto-feeders")!, FALLBACK_PRODUCTS)).toBe(true);
    expect(guidesForCategory(getCategory("toys")!)).toEqual([]);
  });
});

describe("guides", () => {
  const input = { id: "g", slug: "g", title: "T", excerpt: "E", updatedAt: "2026-10-01" };

  it("ships no fake guides", () => {
    expect(getPublishedGuides()).toEqual([]);
    expect(getGuideLinksForProduct("auto-feeder")).toEqual([]);
  });

  it("rejects a published guide without content or publishedAt", () => {
    expect(articleSchema.safeParse({ ...input, status: "published" }).success).toBe(false);
    expect(articleSchema.safeParse({ ...input, status: "published", content: [{ type: "p", text: "x" }] }).success).toBe(false);
    expect(
      articleSchema.safeParse({ ...input, status: "published", publishedAt: "2026-10-01", content: [{ type: "p", text: "x" }] }).success,
    ).toBe(true);
  });

  it("builds a table of contents and renders a minimal article without optional sections", () => {
    const article = articleSchema.parse({
      ...input,
      status: "published",
      publishedAt: "2026-10-01",
      content: [{ type: "h2", text: "หัวข้อ" }, { type: "p", text: "เนื้อหา" }, { type: "h3", text: "ย่อย" }],
    });
    expect(buildToc(article.content).map((t) => t.text)).toEqual(["หัวข้อ", "ย่อย"]);
    const html = renderToStaticMarkup(createElement(ArticleView, { article, products: [], related: [] }));
    expect(html).toContain("เนื้อหา");
    expect(html).toContain("PawPicks Editorial");
    expect(html).not.toMatch(/สินค้าที่แนะนำ|คำถามที่พบบ่อย|เปรียบเทียบสินค้า|บทความที่เกี่ยวข้อง/);
  });
});

describe("affiliate click tracking", () => {
  afterEach(() => vi.unstubAllGlobals());
  const event = { product_id: "p", product_name: "P", merchant: "Shopee", placement: "product_card", campaign: null };

  it("is a safe no-op without a browser, provider or analytics id", () => {
    expect(() => trackAffiliateClick(event)).not.toThrow();
  });

  it("sends only product/placement/page info to a registered provider and survives a broken one", () => {
    vi.stubGlobal("window", {
      location: { pathname: "/products/auto-feeder" },
      dispatchEvent: vi.fn(),
    });
    vi.stubGlobal("CustomEvent", class { constructor(public type: string, public init: unknown) {} });
    const seen: unknown[] = [];
    const off1 = registerAnalyticsProvider(() => { throw new Error("boom"); });
    const off2 = registerAnalyticsProvider((_n, p) => seen.push(p));
    trackAffiliateClick(event);
    off1();
    off2();
    expect(seen).toEqual([{ ...event, page_path: "/products/auto-feeder", page_type: "product" }]);
  });
});
