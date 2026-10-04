import { isGenericShopeeSearch, isSafeAffiliateUrl } from "@/lib/affiliate";
import type { Product } from "@/lib/types";

/** The URL the affiliate CTA should use: dedicated affiliate URL first, then the legacy `shopeeUrl`. */
export function productAffiliateUrl(p: Pick<Product, "affiliateUrl" | "shopeeUrl">): string | null {
  const url = p.affiliateUrl ?? p.shopeeUrl;
  return isSafeAffiliateUrl(url) ? url : null;
}

export type PriceInfo = { price: number; originalPrice?: number; discountPct?: number };

/**
 * A price we can stand behind, or null. A price attached to a generic Shopee
 * keyword-search link isn't verifiable (it isn't tied to one listing), so it is
 * not shown. Discount is plain arithmetic on two real numbers, never invented.
 */
export function priceInfo(p: Product): PriceInfo | null {
  const url = productAffiliateUrl(p);
  if (!url || isGenericShopeeSearch(url)) return null;
  if (!(p.priceThb > 0)) return null;
  const original = p.compareAtPriceThb ?? undefined;
  if (original && original > p.priceThb) {
    return {
      price: p.priceThb,
      originalPrice: original,
      discountPct: Math.round((1 - p.priceThb / original) * 100),
    };
  }
  return { price: p.priceThb };
}

/** Rating is shown only with a review count — a bare number means nothing. */
export function ratingInfo(p: Product): { rating: number; reviewCount: number } | null {
  if (p.rating == null || !p.reviewCount) return null;
  return { rating: p.rating, reviewCount: p.reviewCount };
}

/** Product should appear on public pages (editorial status; unset = published). */
export function isProductPublic(p: Pick<Product, "contentStatus">): boolean {
  return !p.contentStatus || p.contentStatus === "published";
}

/** Up to `max` verified key features for card highlights. */
export function highlights(p: Product, max = 3): string[] {
  return (p.keyFeatures ?? []).filter(Boolean).slice(0, max);
}

/**
 * Merchant label from explicit data, else the host of a specific listing link.
 * A keyword-search link has no single seller, so it gets no label.
 */
export function merchantLabel(p: Product): string | null {
  if (p.merchant) return p.merchant;
  const url = productAffiliateUrl(p);
  if (!url || isGenericShopeeSearch(url)) return null;
  const host = new URL(url).hostname;
  if (host.includes("shopee")) return "Shopee";
  if (host.includes("lazada")) return "Lazada";
  return null;
}
