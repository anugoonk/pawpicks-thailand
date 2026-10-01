import type { MetadataRoute } from "next";
import { TEAM } from "@/data/team";
import { getSiteUrl } from "@/lib/env";
import { LEGAL_PAGES, isLegalPageIndexable } from "@/lib/legal";
import { getProducts } from "@/lib/products";
import { getPublishedTop10Articles, top10ArticleRoute } from "@/lib/top10";

// Only indexable URLs: home, /top-10, product pages, published articles and
// legal pages that are ready. Draft/coming_soon/placeholder pages stay out.
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
    ...LEGAL_PAGES.filter((p) => isLegalPageIndexable(p.href)).map((p) => ({
      url: `${base}${p.href}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
