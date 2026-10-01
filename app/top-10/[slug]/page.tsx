import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CartPanel } from "@/components/cart-panel";
import { CartProvider } from "@/components/cart-context";
import { STORE_ENABLED } from "@/lib/store";
import { SearchProvider } from "@/components/search-context";
import { PromoBar, SiteFooter } from "@/components/sections";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl, serverEnv } from "@/lib/env";
import { getProducts } from "@/lib/products";
import {
  getTop10ArticleBySlug,
  getTop10Articles,
  getTop10StaticSlugs,
  top10ArticleRoute,
} from "@/lib/top10";
import { Top10ArticleView } from "@/components/top10-article-view";
import { top10JsonLd } from "@/lib/top10-jsonld";

type Top10ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  return getTop10StaticSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: Top10ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getTop10ArticleBySlug(slug);
  if (!article) return {};

  const isPublished = article.status === "published";
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: top10ArticleRoute(article.slug) },
    robots: isPublished ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      url: top10ArticleRoute(article.slug),
      ...(article.coverImage ? { images: [article.coverImage] } : {}),
    },
  };
}

export default async function Top10ArticlePage({ params }: Top10ArticlePageProps) {
  const { slug } = await params;
  // null = missing OR not viewable here (draft/coming_soon in production, archived) → 404.
  const article = getTop10ArticleBySlug(slug);
  if (!article) notFound();

  const products = await getProducts();
  const { SHIPPING_FLAT_RATE, FREE_SHIPPING_THRESHOLD } = serverEnv();
  const related = getTop10Articles()
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, 4);
  const base = getSiteUrl();

  return (
    <CartProvider
      products={products}
      shippingFlatRate={SHIPPING_FLAT_RATE}
      freeShippingThreshold={FREE_SHIPPING_THRESHOLD}
    >
      <SearchProvider>
        <PromoBar />
        <SiteHeader />
        <main id="top">
          {/* Structured data only for published articles — never on coming-soon pages. */}
          {article.status === "published" ? (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(top10JsonLd(article, base)).replace(/</g, "\\u003c"),
              }}
            />
          ) : null}
          <Top10ArticleView
            article={article}
            related={related}
            products={products}
            preview={article.status !== "published"}
          />
        </main>
        <SiteFooter />
        {STORE_ENABLED ? <CartPanel /> : null}
      </SearchProvider>
    </CartProvider>
  );
}
