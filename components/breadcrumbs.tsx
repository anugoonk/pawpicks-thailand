import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export type Crumb = { name: string; href?: string };

/** Visible breadcrumb trail + BreadcrumbList structured data. The last crumb is the current page. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ name: "หน้าแรก", href: "/" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.href ? { item: `${siteConfig.siteUrl}${c.href}` } : {}),
    })),
  };
  return (
    <nav aria-label="breadcrumb" className="breadcrumbs">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      {trail.map((c, i) => {
        const last = i === trail.length - 1;
        return (
          <span key={`${c.name}-${i}`}>
            {c.href && !last ? <Link href={c.href}>{c.name}</Link> : <span aria-current={last ? "page" : undefined}>{c.name}</span>}
            {last ? null : <span aria-hidden="true"> › </span>}
          </span>
        );
      })}
    </nav>
  );
}
