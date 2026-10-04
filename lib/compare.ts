import { formatThb } from "@/lib/format";
import { priceInfo, ratingInfo } from "@/lib/product-view";
import type { Product } from "@/lib/types";

export const MAX_COMPARE = 4;
export const MIN_COMPARE = 2;

export type CompareRow = { key: string; label: string; cells: (string | null)[] };

/**
 * Builds the comparison matrix. A row is emitted only when at least one
 * product has real data for it; a product with no data gets `null` for that
 * cell (the UI says "ไม่มีข้อมูล") — nothing is ever filled in.
 */
export function buildComparison(products: Product[]): CompareRow[] {
  const rows: CompareRow[] = [];
  const add = (key: string, label: string, get: (p: Product) => string | null | undefined) => {
    const cells = products.map((p) => get(p) || null);
    if (cells.some(Boolean)) rows.push({ key, label, cells });
  };

  add("price", "ราคา", (p) => {
    const i = priceInfo(p);
    return i ? (i.originalPrice ? `${formatThb(i.price)} (ปกติ ${formatThb(i.originalPrice)})` : formatThb(i.price)) : null;
  });
  add("rating", "คะแนนจากผู้ซื้อ", (p) => {
    const r = ratingInfo(p);
    return r ? `${r.rating.toFixed(1)}/5 (${r.reviewCount.toLocaleString("th-TH")} รีวิว)` : null;
  });
  add("features", "คุณสมบัติเด่น", (p) => p.keyFeatures?.join(" · "));

  const specKeys = [...new Set(products.flatMap((p) => Object.keys(p.specifications ?? {})))];
  for (const k of specKeys) add(`spec:${k}`, k, (p) => p.specifications?.[k]);

  add("bestFor", "เหมาะกับ", (p) => p.bestFor);
  add("pros", "ข้อดี", (p) => p.pros?.join(" · "));
  add("cons", "ข้อควรพิจารณา", (p) => p.cons?.join(" · "));
  add("merchant", "ร้านค้า", (p) => p.merchant);
  add("checked", "ตรวจราคาล่าสุด", (p) => p.lastPriceCheck);
  return rows;
}

/** Parses `?items=a,b,c` into unique slugs, capped at MAX_COMPARE. */
export function parseCompareSlugs(raw: string | string[] | undefined): string[] {
  const text = Array.isArray(raw) ? raw.join(",") : raw ?? "";
  return [...new Set(text.split(",").map((s) => s.trim()).filter(Boolean))].slice(0, MAX_COMPARE);
}
