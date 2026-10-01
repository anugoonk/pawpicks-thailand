import { TOP10_ARTICLES } from "@/data/top10-articles";
import { isProductionDeploy } from "@/lib/env";
import { top10ArticleSchema, type Top10Article } from "@/lib/types";

/**
 * Parsed once at module load: a `published` article that fails validation
 * (missing items / verifiedAt — see `top10ArticleSchema`) throws here, which
 * fails the build rather than shipping bad content.
 */
const ARTICLES: Top10Article[] = TOP10_ARTICLES.map((article) =>
  top10ArticleSchema.parse(article),
);

/** The route for a Top 10 article, derived from its slug. */
export function top10ArticleRoute(slug: string): string {
  return `/top-10/${slug}`;
}

/**
 * Articles shown as cards on /top-10: published + coming_soon. Draft and
 * archived are never listed publicly. Display order = data-file order.
 */
export function getTop10Articles(): Top10Article[] {
  return ARTICLES.filter((a) => a.status === "published" || a.status === "coming_soon");
}

/** Every article regardless of status (tests / admin tooling only). */
export function getAllTop10Articles(): Top10Article[] {
  return ARTICLES;
}

/**
 * Whether an article's own page may be served. published → always.
 * coming_soon/draft → only outside production (template review, noindex).
 * archived → never.
 */
export function isTop10PageViewable(
  status: Top10Article["status"],
  production: boolean = isProductionDeploy(),
): boolean {
  if (status === "published") return true;
  if (status === "archived") return false;
  return !production;
}

/** Slugs to prerender: published always, plus others only outside production. */
export function getTop10StaticSlugs(): string[] {
  return ARTICLES.filter((a) => isTop10PageViewable(a.status)).map((a) => a.slug);
}

/** A single viewable article by slug, or null (missing / not viewable → 404). */
export function getTop10ArticleBySlug(slug: string): Top10Article | null {
  const article = ARTICLES.find((a) => a.slug === slug);
  return article && isTop10PageViewable(article.status) ? article : null;
}

/** Articles ready to be indexed — only `published` ones belong in the sitemap. */
export function getPublishedTop10Articles(): Top10Article[] {
  return ARTICLES.filter((a) => a.status === "published");
}

/** Distinct categories in display order, for the landing page filter. */
export function getTop10Categories(): string[] {
  return [...new Set(getTop10Articles().map((a) => a.category))];
}
