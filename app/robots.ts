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
      // Nothing user-facing lives here; keep API, post-checkout, account and admin pages out.
      disallow: ["/api/", "/checkout/", "/account", "/admin/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
