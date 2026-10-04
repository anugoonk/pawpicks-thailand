import Image from "next/image";
import Link from "next/link";
import { AffiliateLink } from "@/components/affiliate-link";
import { formatThb } from "@/lib/format";
import { computePawPicksScore, SCORE_WEIGHTS } from "@/lib/top10-score";
import { top10ArticleRoute } from "@/lib/top10";
import type { Product, Top10Article } from "@/lib/types";

function thDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Reusable ranking-article template. Every block renders only from real data:
 * sections with nothing verified show an honest placeholder in preview and
 * are absent for published content (the schema forbids publishing without
 * items + scores). Never add fallback copy that implies testing or reviews.
 */
export function Top10ArticleView({
  article,
  related,
  products,
  preview,
}: {
  article: Top10Article;
  related: Top10Article[];
  products: Product[];
  /** True for non-published articles shown in preview environments. */
  preview: boolean;
}) {
  const ranked = article.items.map((item) => ({
    item,
    score: computePawPicksScore(item.scores),
    product: item.productSlug ? products.find((p) => p.slug === item.productSlug) : undefined,
  }));
  const linkedProducts = ranked.flatMap((r) => (r.product ? [r.product] : []));

  return (
    <article className="section top10-article">
      <nav aria-label="breadcrumb" className="top10-breadcrumb">
        <Link href="/">หน้าแรก</Link> <span aria-hidden="true">›</span>{" "}
        <Link href="/top-10">Top 10</Link> <span aria-hidden="true">›</span>{" "}
        <span aria-current="page">{article.title}</span>
      </nav>

      {preview ? (
        <p className="top10-preview-note" role="note">
          โหมดตัวอย่าง (ฉบับ{article.status === "draft" ? "ร่าง" : "กำลังจัดทำ"}) — ไม่เปิดให้ค้นหาและจะไม่แสดงบน production
        </p>
      ) : null}

      {article.coverImage ? (
        <div className="top10-article-cover">
          <Image src={article.coverImage} alt="" fill sizes="800px" priority />
        </div>
      ) : null}

      <p className="eyebrow">{article.category}</p>
      <h1>{article.title}</h1>
      <p className="top10-article-excerpt">{article.excerpt}</p>
      <p className="top10-meta">
        {article.editor ? <span>บรรณาธิการ: {article.editor}</span> : null}
        {article.publishedAt ? <span>เผยแพร่ {thDate(article.publishedAt)}</span> : null}
        <span>อัปเดตล่าสุด {thDate(article.updatedAt)}</span>
      </p>

      {article.quickSummary ? (
        <section className="top10-block" aria-labelledby="t10-summary">
          <h2 id="t10-summary">สรุปสั้นๆ</h2>
          <p>{article.quickSummary}</p>
        </section>
      ) : null}

      {article.howToChoose.length > 0 ? (
        <section className="top10-block" aria-labelledby="t10-choose">
          <h2 id="t10-choose">วิธีเลือกซื้อ</h2>
          <ul>
            {article.howToChoose.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {ranked.length === 0 ? (
        <div className="top10-coming-soon">
          <p>กำลังจัดทำบทความนี้ — ยังไม่มีข้อมูลสินค้าที่ตรวจสอบแล้ว จึงยังไม่แสดงอันดับ ราคา หรือคะแนน</p>
        </div>
      ) : (
        <>
          <section className="top10-block" aria-labelledby="t10-compare">
            <h2 id="t10-compare">ตารางเปรียบเทียบ</h2>
            <div className="top10-table-wrap">
              <table className="top10-table">
                <thead>
                  <tr>
                    <th scope="col">อันดับ</th>
                    <th scope="col">สินค้า</th>
                    <th scope="col">PawPicks Score</th>
                    <th scope="col">ราคาโดยประมาณ</th>
                    <th scope="col">รับประกัน</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map(({ item, score }) => (
                    <tr key={item.rank}>
                      <th scope="row">{item.rank}</th>
                      <td>{item.productName}</td>
                      <td>{score ?? "—"}</td>
                      <td>{item.priceNote ?? "—"}</td>
                      <td>{item.warranty ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <ol className="top10-item-list">
            {ranked.map(({ item, score, product }) => (
              <li key={item.rank} className="top10-item">
                <span className="top10-item-rank">{item.rank}</span>
                <div>
                  <h3>{item.productName}</h3>
                  {score !== null ? <p className="top10-score">PawPicks Score {score}/100</p> : null}
                  <p>{item.summary}</p>
                  {item.pros.length > 0 ? (
                    <>
                      <h4>จุดเด่น</h4>
                      <ul>{item.pros.map((x) => <li key={x}>{x}</li>)}</ul>
                    </>
                  ) : null}
                  {item.considerations.length > 0 ? (
                    <>
                      <h4>ข้อควรพิจารณา</h4>
                      <ul>{item.considerations.map((x) => <li key={x}>{x}</li>)}</ul>
                    </>
                  ) : null}
                  {item.suitableFor ? <p><strong>เหมาะกับ:</strong> {item.suitableFor}</p> : null}
                  {product ? (
                    <Link className="primary-button" href={`/products/${product.slug}`}>
                      ดูรายละเอียดสินค้า
                    </Link>
                  ) : null}
                  <AffiliateLink
                    href={item.shopeeUrl}
                    productName={item.productName}
                    productId={item.productSlug}
                    placement="ranking_item"
                    campaign={article.slug}
                  />
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      {linkedProducts.length > 0 ? (
        <section className="top10-block" aria-labelledby="t10-products">
          <h2 id="t10-products">สินค้าที่เกี่ยวข้องใน PawPicks</h2>
          <ul>
            {linkedProducts.map((p) => (
              <li key={p.id}>
                <Link href={`/products/${p.slug}`}>{p.name}</Link> — {formatThb(p.priceThb)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {article.faq.length > 0 ? (
        <section className="top10-block" aria-labelledby="t10-faq">
          <h2 id="t10-faq">คำถามที่พบบ่อย</h2>
          {article.faq.map((f) => (
            <details key={f.question}>
              <summary>{f.question}</summary>
              <p>{f.answer}</p>
            </details>
          ))}
        </section>
      ) : null}

      <section className="top10-block" aria-labelledby="t10-method">
        <h2 id="t10-method">วิธีจัดอันดับ (PawPicks Score)</h2>
        <p>
          คะแนนรวมคำนวณจากเกณฑ์ต่อไปนี้ โดยใช้ข้อมูลที่ตรวจสอบได้เท่านั้น
          และจะไม่อ้างว่าทดลองใช้งานจริง เว้นแต่มีหลักฐานระบุไว้ในรายการนั้น
        </p>
        <ul>
          {SCORE_WEIGHTS.map((w) => (
            <li key={w.key}>
              {w.label} {Math.round(w.weight * 100)}%
            </li>
          ))}
        </ul>
      </section>

      <section className="top10-block top10-disclaimer" aria-label="การเปิดเผยข้อมูล">
        <p>
          <strong>การเปิดเผยข้อมูลพันธมิตร:</strong> บางลิงก์เป็นลิงก์พันธมิตร
          PawPicks อาจได้รับค่าคอมมิชชันโดยที่คุณไม่ต้องจ่ายเพิ่ม —{" "}
          <Link href="/affiliate-disclosure">อ่านรายละเอียด</Link>
        </p>
        <p>
          <strong>ข้อจำกัดความรับผิดชอบ:</strong> ราคาและสต็อกอาจเปลี่ยนแปลง
          เนื้อหานี้ไม่ใช่คำแนะนำทางสัตวแพทย์ หากแมวมีอาการผิดปกติโปรดปรึกษาสัตวแพทย์
        </p>
      </section>

      {related.length > 0 ? (
        <section className="top10-block" aria-labelledby="t10-related">
          <h2 id="t10-related">อันดับที่เกี่ยวข้อง</h2>
          <ul>
            {related.map((r) => (
              <li key={r.slug}>
                {r.status === "published" ? (
                  <Link href={top10ArticleRoute(r.slug)}>{r.title}</Link>
                ) : (
                  <>{r.title} (กำลังจัดทำ)</>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

    </article>
  );
}
