/**
 * A curated Shopee link points at a specific product page; anything else
 * (today, every `shopeeUrl` in the catalogue) is a generic `/search`
 * redirect. The CTA copy must say which one it is — never imply a specific
 * pick was verified when it's actually just a keyword search.
 */
export function isGenericShopeeSearch(url: string): boolean {
  try {
    return new URL(url).pathname.startsWith("/search");
  } catch {
    return true;
  }
}

/** Honest CTA label for a product's Shopee link. */
export function shopeeCtaLabel(url: string): string {
  return isGenericShopeeSearch(url) ? "ค้นหาสินค้านี้บน Shopee ↗" : "ดูสินค้านี้บน Shopee ↗";
}
