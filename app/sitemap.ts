import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

// Single-page storefront: every section is an anchor on `/`, so the sitemap
// has just the one canonical entry. Add real routes here as they appear.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
