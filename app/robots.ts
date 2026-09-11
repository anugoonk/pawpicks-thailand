import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing user-facing lives here; keep API + post-checkout pages out.
      disallow: ["/api/", "/checkout/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
