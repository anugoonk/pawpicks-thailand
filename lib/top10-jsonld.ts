import { top10ArticleRoute } from "@/lib/top10";
import type { Top10Article } from "@/lib/types";

/**
 * Structured data for a PUBLISHED article only: Article + BreadcrumbList +
 * ItemList. Deliberately no Review/aggregateRating/Product price — we hold no
 * first-party reviews, and prices live in free-text notes, not feeds.
 */
export function top10JsonLd(article: Top10Article, base: string) {
  const url = `${base}${top10ArticleRoute(article.slug)}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.excerpt,
      mainEntityOfPage: url,
      datePublished: article.publishedAt ?? article.updatedAt,
      dateModified: article.updatedAt,
      ...(article.coverImage ? { image: [article.coverImage] } : {}),
      ...(article.editor ? { author: { "@type": "Person", name: article.editor } } : {}),
      publisher: { "@type": "Organization", name: "PawPicks Thailand" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${base}/` },
        { "@type": "ListItem", position: 2, name: "Top 10", item: `${base}/top-10` },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: article.items.map((i) => ({
        "@type": "ListItem",
        position: i.rank,
        name: i.productName,
      })),
    },
  ];
}
