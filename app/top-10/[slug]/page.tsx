import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CartPanel } from "@/components/cart-panel";
import { CartProvider } from "@/components/cart-context";
import { SearchProvider } from "@/components/search-context";
import { PromoBar, SiteFooter } from "@/components/sections";
import { SiteHeader } from "@/components/site-header";
import { serverEnv } from "@/lib/env";
import { getProducts } from "@/lib/products";
import { getTop10ArticleBySlug, getTop10Articles } from "@/lib/top10";

type Top10ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  return getTop10Articles().map((article) => ({ slug: article.slug }));
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
    robots: isPublished ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
    },
  };
}

export default async function Top10ArticlePage({ params }: Top10ArticlePageProps) {
  const { slug } = await params;
  const article = getTop10ArticleBySlug(slug);
  if (!article) notFound();

  const products = await getProducts();
  const { SHIPPING_FLAT_RATE, FREE_SHIPPING_THRESHOLD } = serverEnv();

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
          <section className="section top10-article">
            <Link className="back-link" href="/top-10">
              กลับไปดูทุกอันดับ
            </Link>
            <p className="eyebrow">{article.category}</p>
            <h1>{article.title}</h1>
            <p className="top10-article-excerpt">{article.excerpt}</p>

            {article.status === "published" ? (
              <ol className="top10-item-list">
                {article.items.map((item) => (
                  <li key={item.rank} className="top10-item">
                    <span className="top10-item-rank">{item.rank}</span>
                    <div>
                      <h3>{item.productName}</h3>
                      <p>{item.summary}</p>
                      {item.shopeeUrl ? (
                        <a href={item.shopeeUrl} target="_blank" rel="noopener noreferrer nofollow">
                          ดูบน Shopee →
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="top10-coming-soon">
                <p>กำลังจัดทำบทความนี้ — เร็วๆ นี้</p>
              </div>
            )}
          </section>
        </main>
        <SiteFooter />
        <CartPanel />
      </SearchProvider>
    </CartProvider>
  );
}
