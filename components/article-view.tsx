import Link from "next/link";
import { AffiliateDisclosure } from "@/components/affiliate-notices";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/product-card";
import { ProductComparison } from "@/components/product-comparison";
import { categoryRoute, getCategory } from "@/lib/categories";
import type { Article } from "@/lib/guide-types";
import { buildToc, guideRoute, headingId } from "@/lib/guides";
import { siteConfig } from "@/lib/site-config";
import type { Product } from "@/lib/types";

function thDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Reusable guide/article template. Every section renders only when it has
 * content, so a short article is still a complete page.
 */
export function ArticleView({
  article,
  products,
  related,
  preview,
}: {
  article: Article;
  /** Products referenced by `article.products`, already resolved and public. */
  products: Product[];
  related: Article[];
  preview?: boolean;
}) {
  const toc = buildToc(article.content);
  const category = article.category ? getCategory(article.category) : null;
  const crumbs = [
    { name: "คู่มือ", href: "/guides" },
    ...(category ? [{ name: category.name, href: categoryRoute(category.slug) }] : []),
    { name: article.title },
  ];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.seoDescription ?? article.excerpt,
      mainEntityOfPage: `${siteConfig.siteUrl}${guideRoute(article.slug)}`,
      datePublished: article.publishedAt ?? article.updatedAt,
      dateModified: article.updatedAt,
      author: {
        "@type": article.author ? "Person" : "Organization",
        name: article.author ?? "PawPicks Editorial",
      },
      ...(article.ogImage || article.coverImage ? { image: [article.ogImage ?? article.coverImage] } : {}),
    },
    ...(article.faq.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: article.faq.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          },
        ]
      : []),
  ];

  return (
    <article className="section guide-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Breadcrumbs items={crumbs} />
      {preview ? (
        <p className="guide-preview">โหมดตัวอย่าง (ฉบับร่าง) — ไม่เปิดให้ค้นหาและไม่แสดงบนเว็บจริง</p>
      ) : null}

      <header className="guide-header">
        {category ? <p className="eyebrow">{category.name}</p> : null}
        <h1>{article.title}</h1>
        <p className="guide-excerpt">{article.excerpt}</p>
        <p className="guide-byline">
          โดย {article.author ?? "PawPicks Editorial"} · อัปเดต {thDate(article.updatedAt)}
        </p>
      </header>

      <AffiliateDisclosure />

      {article.coverImage ? (
        <figure className="guide-cover">
          <img src={article.coverImage} alt={article.coverImageAlt ?? article.title} />
        </figure>
      ) : null}

      {toc.length > 1 ? (
        <nav className="guide-toc" aria-label="สารบัญ">
          <h2>สารบัญ</h2>
          <ol>
            {toc.map((t) => (
              <li key={t.id} className={t.level === 3 ? "guide-toc-sub" : undefined}>
                <a href={`#${t.id}`}>{t.text}</a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="guide-body">
        {article.content.map((b, i) => {
          switch (b.type) {
            case "h2":
              return <h2 key={i} id={headingId(i)}>{b.text}</h2>;
            case "h3":
              return <h3 key={i} id={headingId(i)}>{b.text}</h3>;
            case "p":
              return <p key={i}>{b.text}</p>;
            case "ul":
              return <ul key={i}>{b.items.map((x) => <li key={x}>{x}</li>)}</ul>;
            case "ol":
              return <ol key={i}>{b.items.map((x) => <li key={x}>{x}</li>)}</ol>;
            case "callout":
              return (
                <aside key={i} className="guide-callout">
                  {b.title ? <strong>{b.title}</strong> : null}
                  <p>{b.text}</p>
                </aside>
              );
            case "image":
              return (
                <figure key={i}>
                  <img src={b.src} alt={b.alt} loading="lazy" />
                  {b.caption ? <figcaption>{b.caption}</figcaption> : null}
                </figure>
              );
          }
        })}
      </div>

      {products.length > 0 ? (
        <section className="guide-block" id="recommended" aria-labelledby="g-products">
          <h2 id="g-products">สินค้าที่แนะนำ</h2>
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} placement="guide_product" />
            ))}
          </div>
        </section>
      ) : null}

      {products.length >= 2 ? (
        <section className="guide-block" aria-labelledby="g-compare">
          <h2 id="g-compare">เปรียบเทียบสินค้า</h2>
          <ProductComparison products={products} placement="guide_comparison" />
        </section>
      ) : null}

      {article.faq.length > 0 ? (
        <section className="guide-block" aria-labelledby="g-faq">
          <h2 id="g-faq">คำถามที่พบบ่อย</h2>
          {article.faq.map((f) => (
            <details key={f.question}>
              <summary>{f.question}</summary>
              <p>{f.answer}</p>
            </details>
          ))}
        </section>
      ) : null}

      {article.methodology.length > 0 || article.sources.length > 0 ? (
        <section className="guide-block" aria-labelledby="g-method">
          <h2 id="g-method">วิธีคัดเลือกและแหล่งข้อมูล</h2>
          {article.methodology.map((m) => (
            <p key={m}>{m}</p>
          ))}
          {article.sources.length > 0 ? (
            <ul>
              {article.sources.map((s) => (
                <li key={s.title}>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer nofollow">
                      {s.title}
                    </a>
                  ) : (
                    s.title
                  )}
                </li>
              ))}
            </ul>
          ) : null}
          <p>
            <Link href="/how-we-choose">วิธีที่เราเลือกสินค้า</Link>
          </p>
        </section>
      ) : null}

      {article.affiliateDisclosure ? <p className="affiliate-note">{article.affiliateDisclosure}</p> : null}

      {related.length > 0 ? (
        <section className="guide-block" aria-labelledby="g-related">
          <h2 id="g-related">บทความที่เกี่ยวข้อง</h2>
          <ul>
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={guideRoute(r.slug)}>{r.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {products.length > 0 ? (
        <p className="guide-final-cta">
          <a className="primary-button" href="#recommended">
            กลับไปดูสินค้าที่แนะนำ
          </a>
        </p>
      ) : null}
    </article>
  );
}
