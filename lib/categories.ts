import { CATEGORIES, type Category } from "@/data/categories";
import { isProductPublic } from "@/lib/product-view";
import { getPublishedGuides } from "@/lib/guides";
import type { Product } from "@/lib/types";
import type { Article } from "@/lib/guide-types";

export const categoryRoute = (slug: string) => `/category/${slug}`;

export function getCategories(): Category[] {
  return [...CATEGORIES].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategory(slug: string): Category | null {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

function haystack(p: Product): string {
  return [p.name, p.category, p.subCategory ?? "", (p.tags ?? []).join(" "), p.searchKeywords].join(" ").toLowerCase();
}

/** Public products that belong to a category (explicit sub-category/tag, or keyword match). */
export function productsForCategory(cat: Category, products: Product[]): Product[] {
  return products.filter((p) => {
    if (!isProductPublic(p)) return false;
    if (p.subCategory === cat.slug || p.tags?.includes(cat.slug)) return true;
    const h = haystack(p);
    return cat.keywords.some((k) => h.includes(k.toLowerCase()));
  });
}

export function guidesForCategory(cat: Category, guides: Article[] = getPublishedGuides()): Article[] {
  return guides.filter((g) => g.category === cat.slug);
}

/** A category is public only with something real in it — no empty/thin pages. */
export function isCategoryPopulated(cat: Category, products: Product[]): boolean {
  return productsForCategory(cat, products).length > 0 || guidesForCategory(cat).length > 0;
}

export function getPopulatedCategories(products: Product[]): Category[] {
  return getCategories().filter((c) => isCategoryPopulated(c, products));
}

/** First populated category a product belongs to (for breadcrumbs), preferring child categories. */
export function categoryForProduct(p: Product, products: Product[]): Category | null {
  const mine = getPopulatedCategories(products).filter((c) => productsForCategory(c, [p]).length > 0);
  return mine.find((c) => c.parent) ?? mine[0] ?? null;
}
