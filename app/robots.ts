import type { MetadataRoute } from "next";
import { getSiteUrl, isProductionDeploy } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  if (!isProductionDeploy()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
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
