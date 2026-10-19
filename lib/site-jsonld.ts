import { siteConfig } from "@/lib/site-config";

/**
 * Homepage structured data: Organization + WebSite (with the on-site `?q=`
 * search). `sameAs` lists only social profiles the owner has actually
 * configured; nothing is invented.
 */
export function siteJsonLd(base: string = siteConfig.siteUrl) {
  const sameAs = Object.values(siteConfig.social).filter((u): u is string => !!u);
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.siteName,
      url: base,
      ...(sameAs.length ? { sameAs } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.siteName,
      url: base,
      inLanguage: siteConfig.language,
      potentialAction: {
        "@type": "SearchAction",
        target: `${base}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];
}
