import type { MetadataRoute } from "next";
import { TEAM } from "@/data/team";
import { getSiteUrl } from "@/lib/env";
import { LEGAL_PAGES } from "@/lib/legal";
import { getProducts } from "@/lib/products";
import { getPopulatedCategories, categoryRoute } from "@/lib/categories";
import { getPublishedGuides, guideRoute } from "@/lib/guides";
import { getPublishedTop10Articles, top10ArticleRoute } from "@/lib/top10";

// Only indexable URLs: home, /top-10, product pages, team profiles, published
// articles and the trust/legal pages. Draft/coming_soon pages stay out.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const products = await getProducts();
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/top-10`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    // Only categories/guides that actually have content (no empty pages in the index).
    ...getPopulatedCategories(products).map((c) => ({
      url: `${base}${categoryRoute(c.slug)}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...getPublishedGuides().map((g) => ({
      url: `${base}${guideRoute(g.slug)}`,
      lastModified: new Date(g.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...TEAM.map((cat) => ({
      url: `${base}/team/${cat.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    ...getPublishedTop10Articles().map((article) => ({
      url: `${base}${top10ArticleRoute(article.slug)}`,
      lastModified: article.updatedAt ? new Date(article.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...LEGAL_PAGES.map((p) => ({
      url: `${base}${p.href}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
