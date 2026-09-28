"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { top10ArticleRoute } from "@/lib/top10";
import type { Top10Article } from "@/lib/types";

const STATUS_LABEL: Record<Top10Article["status"], string> = {
  published: "พร้อมอ่าน",
  coming_soon: "เร็วๆ นี้",
  draft: "เร็วๆ นี้",
};

const ALL_CATEGORY = "ทั้งหมด";

export function Top10Filter({
  articles,
  categories,
}: {
  articles: Top10Article[];
  categories: string[];
}) {
  const [category, setCategory] = useState(ALL_CATEGORY);

  const shown = useMemo(
    () =>
      category === ALL_CATEGORY
        ? articles
        : articles.filter((a) => a.category === category),
    [articles, category],
  );

  return (
    <div>
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

      <div className="top10-grid">
        {shown.map((article) => (
          <Link
            key={article.slug}
            href={top10ArticleRoute(article.slug)}
            className="top10-card"
          >
            <span
              className={
                article.status === "published"
                  ? "top10-badge top10-badge-live"
                  : "top10-badge"
              }
            >
              {STATUS_LABEL[article.status]}
            </span>
            <p className="eyebrow">{article.category}</p>
            <h3>{article.title}</h3>
            <p>{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
