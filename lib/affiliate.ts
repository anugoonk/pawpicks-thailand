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

/** Only real https links may become affiliate buttons — never "#", javascript: or malformed URLs. */
export function isSafeAffiliateUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

/** Honest CTA label for a product's Shopee link (never implies PawPicks sells it). */
export function shopeeCtaLabel(url: string): string {
  return isGenericShopeeSearch(url) ? "ค้นหาสินค้านี้บน Shopee ↗" : "ดูราคาใน Shopee ↗";
}

/** CTA label for any merchant: Shopee-aware, otherwise a neutral "view details". */
export function affiliateCtaLabel(url: string): string {
  try {
    return new URL(url).hostname.includes("shopee") ? shopeeCtaLabel(url) : "ดูรายละเอียดสินค้า ↗";
  } catch {
    return "ดูรายละเอียดสินค้า ↗";
  }
}

/** Short disclosure shown next to affiliate CTAs. */
export const AFFILIATE_NOTE =
  "บางลิงก์เป็น Affiliate Link เราอาจได้รับค่าคอมมิชชันโดยไม่มีค่าใช้จ่ายเพิ่มสำหรับคุณ";
