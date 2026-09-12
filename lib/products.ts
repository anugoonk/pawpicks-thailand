import "server-only";

import { FALLBACK_PRODUCTS } from "@/lib/data";
import { hasSupabase } from "@/lib/env";
import { productSchema, type Product } from "@/lib/types";

/** Map a `products` table row (snake_case) to the app `Product` type. */
export function rowToProduct(row: Record<string, unknown>): Product {
  return productSchema.parse({
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description,
    priceThb: row.price_thb,
    image: row.image,
    imageCrop: row.image_crop ?? null,
    badge: row.badge ?? null,
    badgeDark: row.badge_dark ?? false,
    companionCatId: row.companion_cat_id ?? null,
    companionLabel: row.companion_label ?? null,
    companionImage: row.companion_image ?? null,
    companionAlt: row.companion_alt ?? null,
    shopeeUrl: row.shopee_url,
    searchKeywords: row.search_keywords ?? "",
    active: row.active ?? true,
    sortOrder: row.sort_order ?? 0,
    details: row.details ?? {},
    stockQuantity: row.stock_quantity ?? null,
    lowStockThreshold: row.low_stock_threshold ?? 5,
  });
}

/**
 * Active products for the storefront. Reads Supabase when configured, and
 * falls back to the static list (also used to seed the DB) otherwise or on
 * error — the marketing page must always render.
 */
export async function getProducts(): Promise<Product[]> {
  if (!hasSupabase()) return FALLBACK_PRODUCTS;

  try {
    const { createPublicClient } = await import("@/lib/supabase/public");
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return FALLBACK_PRODUCTS;
    return data.map(rowToProduct);
  } catch (err) {
    console.error("getProducts: falling back to static data —", err);
    return FALLBACK_PRODUCTS;
  }
}

/**
 * A single active product by slug, for the product detail page. Reuses
 * getProducts() (Supabase, falling back to the static list on error) and
 * finds by slug in memory — the catalogue is small enough that this is
 * simpler than a second query path. A missing product means a 404, not a
 * broken page.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

/**
 * Look up products by id for server-side price calculation at checkout.
 *
 * Unlike `getProducts`, this NEVER falls back to the static list when Supabase
 * is configured: charging a customer against a possibly-stale price is worse
 * than failing the checkout. Throws on a DB error so the caller returns 503.
 */
export async function getProductsByIds(
  ids: string[],
): Promise<Map<string, Product>> {
  const wanted = new Set(ids);

  if (!hasSupabase()) {
    return new Map(
      FALLBACK_PRODUCTS.filter((p) => wanted.has(p.id)).map((p) => [p.id, p]),
    );
  }

  const { createPublicClient } = await import("@/lib/supabase/public");
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("id", [...wanted]);
  if (error) throw error;

  return new Map(
    (data ?? [])
      .map(rowToProduct)
      .filter((p) => wanted.has(p.id))
      .map((p) => [p.id, p]),
  );
}
