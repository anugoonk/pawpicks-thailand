"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { top10ArticleRoute } from "@/lib/top10";
import type { Top10Article } from "@/lib/types";

const STATUS_LABEL: Record<Top10Article["status"], string> = {
  published: "พร้อมอ่าน",
  coming_soon: "กำลังจัดทำ",
  draft: "ฉบับร่าง",
  archived: "เก็บถาวร",
};

const ALL_CATEGORY = "ทั้งหมด";

/** Decorative mascot per category (transparent PNGs from the 12-cat team). */
const CATEGORY_CAT: Record<string, string> = {
  "อาหารและน้ำ": "/assets/cat-4.png",
  "ห้องน้ำและความสะอาด": "/assets/cat-2.png",
  "ของเล่นและกิจกรรม": "/assets/cat-5.png",
  "บ้านและพื้นที่แมว": "/assets/cat-9.png",
  "Pet Tech": "/assets/cat-3.png",
  "บ้านและความสะอาด": "/assets/cat-7.png",
  "ดูแลขนและเล็บ": "/assets/cat-11.png",
  "เดินทางกับแมว": "/assets/cat-8.png",
  "เริ่มต้นเลี้ยงแมว": "/assets/cat-1.png",
};

function formatUpdated(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function Cover({ article, large = false }: { article: Top10Article; large?: boolean }) {
  const cat = CATEGORY_CAT[article.category];
  return (
    <div className={large ? "top10-cover top10-cover-large" : "top10-cover"}>
      {article.coverImage ? (
        <Image
          src={article.coverImage}
          alt=""
          fill
          sizes={large ? "(max-width:900px) 100vw, 560px" : "(max-width:560px) 100vw, 280px"}
          className="top10-cover-img"
        />
      ) : null}
      {cat ? (
        <Image
          src={cat}
          alt=""
          width={large ? 64 : 44}
          height={large ? 120 : 84}
          className="top10-cover-cat"
        />
      ) : null}
    </div>
  );
}

function Card({ article, large = false }: { article: Top10Article; large?: boolean }) {
  const live = article.status === "published";
  const count = article.items.length;
  const body = (
    <>
      <Cover article={article} large={large} />
      <div className="top10-card-body">
        <span className={live ? "top10-badge top10-badge-live" : "top10-badge"}>
          {STATUS_LABEL[article.status]}
        </span>
        <p className="eyebrow">{article.category}</p>
        <h3>{article.title}</h3>
        <p>{article.excerpt}</p>
        <p className="top10-meta">
          <span>อัปเดต {formatUpdated(article.updatedAt)}</span>
          <span>{count > 0 ? `เปรียบเทียบ ${count} รายการ` : "กำลังรวบรวมข้อมูล"}</span>
        </p>
      </div>
    </>
  );
  const cls = `top10-card${large ? " top10-card-featured" : ""}`;
  // Only published articles have a page worth visiting; the rest are cards.
  return live ? (
    <Link href={top10ArticleRoute(article.slug)} className={cls}>
      {body}
    </Link>
  ) : (
    <article className={`${cls} top10-card-static`}>{body}</article>
  );
}

function Section({ title, articles }: { title: string; articles: Top10Article[] }) {
  if (articles.length === 0) return null;
  return (
    <section className="top10-section" aria-label={title}>
      <h2>{title}</h2>
      <div className="top10-grid">
        {articles.map((a) => (
          <Card key={a.slug} article={a} />
        ))}
      </div>
    </section>
  );
}

export function Top10Filter({
  articles,
  categories,
}: {
  articles: Top10Article[];
  categories: string[];
}) {
  const [category, setCategory] = useState(ALL_CATEGORY);
  const [query, setQuery] = useState("");
  const searchId = useId();

  const shown = useMemo(() => {
    const term = query.trim().toLowerCase();
    return articles.filter(
      (a) =>
        (category === ALL_CATEGORY || a.category === category) &&
        (!term || `${a.title} ${a.excerpt} ${a.category}`.toLowerCase().includes(term)),
    );
  }, [articles, category, query]);

  const published = shown
    .filter((a) => a.status === "published")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const inProgress = shown.filter((a) => a.status === "coming_soon");
  const featured = published[0] ?? null;
  const byCategory = categories
    // Published only: unpublished topics already appear once under "กำลังจัดทำ".
    .map((c) => ({ c, list: published.filter((a) => a.category === c) }))
    .filter((g) => g.list.length > 0);

  return (
    <div>
      <div className="top10-search">
        <label htmlFor={searchId}>ค้นหาอันดับ</label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="เช่น น้ำพุ กล้อง ทรายแมว"
        />
      </div>

      <div className="top10-filter-bar" role="group" aria-label="กรองตามหมวดหมู่">
        {[ALL_CATEGORY, ...categories].map((c) => (
          <button
            key={c}
            type="button"
            className={c === category ? "top10-filter-chip active" : "top10-filter-chip"}
            aria-pressed={c === category}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="top10-count" role="status">
        แสดง {shown.length} จาก {articles.length} หัวข้อ
      </p>

      {shown.length === 0 ? (
        <div className="empty-state" style={{ display: "block" }}>
          <p>ไม่พบหัวข้อที่ตรงกับ “{query.trim()}”</p>
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setQuery("");
              setCategory(ALL_CATEGORY);
            }}
          >
            ล้างตัวกรอง
          </button>
        </div>
      ) : (
        <>
          {featured ? (
            <section className="top10-section" aria-label="อันดับแนะนำ">
              <h2>อันดับแนะนำ</h2>
              <Card article={featured} large />
            </section>
          ) : null}
          <Section title="อันดับล่าสุด" articles={published} />
          {published.length === 0 ? (
            <p className="top10-none-yet">
              ยังไม่มีอันดับที่เผยแพร่ — เราจะเผยแพร่เมื่อข้อมูลสินค้าผ่านการตรวจสอบครบเท่านั้น
            </p>
          ) : null}
          {byCategory.length > 0 ? (
            <section className="top10-section" aria-label="เลือกตามหมวด">
              <h2>เลือกตามหมวด</h2>
              {byCategory.map(({ c, list }) => (
                <div key={c} className="top10-cat-group">
                  <h3 className="top10-cat-title">{c}</h3>
                  <div className="top10-grid">
                    {list.map((a) => (
                      <Card key={a.slug} article={a} />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ) : null}
          <Section title="กำลังจัดทำ" articles={inProgress} />
        </>
      )}
    </div>
  );
}
