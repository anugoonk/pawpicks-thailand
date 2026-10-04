import { GUIDES } from "@/data/guides";
import { isProductionDeploy } from "@/lib/env";
import { articleSchema, type Article, type ContentBlock } from "@/lib/guide-types";
import { getPublishedTop10Articles, top10ArticleRoute } from "@/lib/top10";

/** Parsed once: a published guide with no content/publishedAt fails the build. */
const ALL: Article[] = GUIDES.map((g) => articleSchema.parse(g));

export const guideRoute = (slug: string) => `/guides/${slug}`;

export function getPublishedGuides(): Article[] {
  return ALL.filter((g) => g.status === "published").sort((a, b) =>
    (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
  );
}

/** Published always; drafts only outside production (review, noindex). Archived never. */
export function isGuideViewable(status: Article["status"], production = isProductionDeploy()): boolean {
  if (status === "published") return true;
  if (status === "archived") return false;
  return !production;
}

export function getListedGuides(production = isProductionDeploy()): Article[] {
  return ALL.filter((g) => isGuideViewable(g.status, production));
}

export function getGuideBySlug(slug: string): Article | null {
  const g = ALL.find((x) => x.slug === slug);
  return g && isGuideViewable(g.status) ? g : null;
}

export function getGuideStaticSlugs(): string[] {
  return ALL.filter((g) => isGuideViewable(g.status)).map((g) => g.slug);
}

export function getRelatedGuides(article: Article, max = 3): Article[] {
  const byRef = article.relatedArticles.flatMap((s) => {
    const g = ALL.find((x) => x.slug === s && x.status === "published");
    return g ? [g] : [];
  });
  if (byRef.length > 0) return byRef.slice(0, max);
  return getPublishedGuides()
    .filter((g) => g.slug !== article.slug && article.category && g.category === article.category)
    .slice(0, max);
}

export type GuideLink = { title: string; href: string; kind: "guide" | "ranking" };

/** Published guides and Top 10 rankings that mention a product, for "related guides" blocks. */
export function getGuideLinksForProduct(productSlug: string): GuideLink[] {
  return [
    ...getPublishedGuides()
      .filter((g) => g.products.includes(productSlug))
      .map((g) => ({ title: g.title, href: guideRoute(g.slug), kind: "guide" as const })),
    ...getPublishedTop10Articles()
      .filter((a) => a.items.some((i) => i.productSlug === productSlug))
      .map((a) => ({ title: a.title, href: top10ArticleRoute(a.slug), kind: "ranking" as const })),
  ];
}

export type TocEntry = { id: string; text: string; level: 2 | 3 };

/** Stable index-based ids (Thai headings don't slugify well). */
export function headingId(index: number): string {
  return `section-${index}`;
}

export function buildToc(content: ContentBlock[]): TocEntry[] {
  return content.flatMap((b, i) =>
    b.type === "h2" || b.type === "h3"
      ? [{ id: headingId(i), text: b.text, level: b.type === "h2" ? (2 as const) : (3 as const) }]
      : [],
  );
}
