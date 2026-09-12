import type { Product } from "@/lib/types";

/** Max units of a single product per order — mirrors cartItemSchema. */
export const MAX_QTY = 20;

export function availableQuantity(product: Pick<Product, "active" | "stockQuantity">): number {
  return product.active ? Math.min(MAX_QTY, product.stockQuantity ?? 0) : 0;
}

export function stockLabel(product: Pick<Product, "stockQuantity">): string {
  if (product.stockQuantity === null) return "รอยืนยันสต็อก";
  if (product.stockQuantity === 0) return "สินค้าหมด";
  return `พร้อมส่ง ${product.stockQuantity} ชิ้น`;
}

export type StoredItem = { productId: string; quantity: number };
export type CartLine = { product: Product; quantity: number };

export type CartTotals = {
  count: number;
  subtotalThb: number;
  shippingThb: number;
  totalThb: number;
};

export type ShippingConfig = {
  shippingFlatRate: number;
  freeShippingThreshold: number;
};

/** Clamp a quantity to a whole number in [1, MAX_QTY]. */
export function clampQty(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(MAX_QTY, Math.round(n)));
}

/**
 * Drop anything that isn't a known product or a usable quantity, and clamp
 * what's left. Used when rehydrating the cart from localStorage.
 */
export function sanitizeStoredItems(
  raw: unknown,
  known: (id: string) => boolean,
): StoredItem[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: StoredItem[] = [];
  for (const it of raw) {
    if (
      !it ||
      typeof it !== "object" ||
      typeof (it as StoredItem).productId !== "string" ||
      !Number.isFinite((it as StoredItem).quantity)
    ) {
      continue;
    }
    const { productId, quantity } = it as StoredItem;
    if (seen.has(productId) || !known(productId)) continue;
    seen.add(productId);
    out.push({ productId, quantity: clampQty(quantity) });
  }
  return out;
}

/** Subtotal, shipping and total for a set of cart lines. */
export function computeTotals(
  lines: CartLine[],
  { shippingFlatRate, freeShippingThreshold }: ShippingConfig,
): CartTotals {
  const subtotalThb = lines.reduce(
    (sum, l) => sum + l.product.priceThb * l.quantity,
    0,
  );
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const shippingThb =
    subtotalThb === 0 || subtotalThb >= freeShippingThreshold
      ? 0
      : shippingFlatRate;
  return { count, subtotalThb, shippingThb, totalThb: subtotalThb + shippingThb };
}
