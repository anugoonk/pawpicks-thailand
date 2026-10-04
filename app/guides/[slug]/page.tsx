import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/article-view";
import { SiteShell } from "@/components/site-shell";
import { getGuideBySlug, getGuideStaticSlugs, getRelatedGuides, guideRoute } from "@/lib/guides";
import { isProductPublic } from "@/lib/product-view";
import { getProducts } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export function generateStaticParams() {
  return getGuideStaticSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuideBySlug(slug);
  if (!g) return {};
  const title = g.seoTitle ?? g.title;
  const description = g.seoDescription ?? g.excerpt;
  const image = g.ogImage ?? g.coverImage;
  return {
    title,
    description,
    alternates: { canonical: guideRoute(g.slug) },
    // Drafts (visible only outside production) never get indexed.
    robots: g.status === "published" ? undefined : { index: false, follow: false },
    openGraph: { title, description, type: "article", ...(image ? { images: [image] } : {}) },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const article = getGuideBySlug(slug);
  if (!article) notFound();

  const all = await getProducts();
  const products = article.products.flatMap((s) => {
    const p = all.find((x) => x.slug === s);
    return p && isProductPublic(p) ? [p] : [];
  });

  return (
    <SiteShell>
      <ArticleView
        article={article}
        products={products}
        related={getRelatedGuides(article)}
        preview={article.status !== "published"}
      />
    </SiteShell>
  );
}
