import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AffiliateDisclosure } from "@/components/affiliate-notices";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/product-card";
import { SiteShell } from "@/components/site-shell";
import { CATEGORIES } from "@/data/categories";
import {
  categoryRoute,
  getCategory,
  getPopulatedCategories,
  guidesForCategory,
  isCategoryPopulated,
  productsForCategory,
} from "@/lib/categories";
import { isProductionDeploy } from "@/lib/env";
import { guideRoute } from "@/lib/guides";
import { getProducts } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return {};
  const products = await getProducts();
  const populated = isCategoryPopulated(cat, products);
  return {
    title: cat.seoTitle ?? cat.name,
    description: cat.seoDescription ?? cat.description,
    alternates: { canonical: categoryRoute(cat.slug) },
    robots: populated ? undefined : { index: false, follow: false },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) notFound();

  const all = await getProducts();
  const populated = isCategoryPopulated(cat, all);
  // Empty categories are not public pages; they can be previewed outside production.
  if (!populated && isProductionDeploy()) notFound();

  const products = productsForCategory(cat, all);
  const guides = guidesForCategory(cat);
  const parent = cat.parent ? getCategory(cat.parent) : null;
  const related = getPopulatedCategories(all).filter((c) => c.slug !== cat.slug).slice(0, 4);

  return (
    <SiteShell>
      <section className="section category-page">
        <Breadcrumbs
          items={[
            ...(parent && isCategoryPopulated(parent, all)
              ? [{ name: parent.name, href: categoryRoute(parent.slug) }]
              : []),
            { name: cat.name },
          ]}
        />
        {!populated ? (
          <p className="guide-preview">โหมดตัวอย่าง — หมวดนี้ยังไม่มีสินค้าหรือบทความ ไม่เปิดให้ค้นหาบนเว็บจริง</p>
        ) : null}
        <header className="guide-header">
          <h1>
            {cat.icon ? <span aria-hidden="true">{cat.icon} </span> : null}
            {cat.name}
          </h1>
          <p className="guide-excerpt">{cat.description}</p>
        </header>

        {guides.length > 0 ? (
          <section className="guide-block" aria-labelledby="c-guides">
            <h2 id="c-guides">คู่มือและบทความ</h2>
            <ul>
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link href={guideRoute(g.slug)}>{g.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {products.length > 0 ? (
          <section className="guide-block" aria-labelledby="c-products">
            <h2 id="c-products">สินค้าแนะนำ</h2>
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} placement="category_product" />
              ))}
            </div>
          </section>
        ) : null}

        {cat.buyingGuide && cat.buyingGuide.length > 0 ? (
          <section className="guide-block" aria-labelledby="c-guide">
            <h2 id="c-guide">เลือกซื้ออย่างไร</h2>
            {cat.buyingGuide.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ) : null}

        {cat.faq && cat.faq.length > 0 ? (
          <section className="guide-block" aria-labelledby="c-faq">
            <h2 id="c-faq">คำถามที่พบบ่อย</h2>
            {cat.faq.map((f) => (
              <details key={f.question}>
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </section>
        ) : null}

        {related.length > 0 ? (
          <section className="guide-block" aria-labelledby="c-related">
            <h2 id="c-related">หมวดที่เกี่ยวข้อง</h2>
            <ul className="chip-list">
              {related.map((c) => (
                <li key={c.slug}>
                  <Link href={categoryRoute(c.slug)}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <AffiliateDisclosure />
      </section>
    </SiteShell>
  );
}
