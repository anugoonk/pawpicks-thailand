import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { getPublishedTop10Articles, top10ArticleRoute } from "@/lib/top10";

// Single-page storefront: every section is an anchor on `/`, so the sitemap
// has just the one canonical entry, plus published Top 10 articles. Add
// other real routes here as they appear.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/top-10`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...getPublishedTop10Articles().map((article) => ({
      url: `${base}${top10ArticleRoute(article.slug)}`,
      lastModified: article.verifiedAt ? new Date(article.verifiedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
