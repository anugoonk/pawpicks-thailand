import { TOP10_ARTICLES } from "@/data/top10-articles";
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

/** All Top 10 articles, in data-file order (landing page display order). */
export function getTop10Articles(): Top10Article[] {
  return ARTICLES;
}

/** A single article by slug, or null if it doesn't exist (→ 404). */
export function getTop10ArticleBySlug(slug: string): Top10Article | null {
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}

/** Articles ready to be indexed — only `published` ones belong in the sitemap. */
export function getPublishedTop10Articles(): Top10Article[] {
  return ARTICLES.filter((a) => a.status === "published");
}

/** Distinct categories in display order, for the landing page filter. */
export function getTop10Categories(): string[] {
  return [...new Set(ARTICLES.map((a) => a.category))];
}
