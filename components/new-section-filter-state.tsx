"use client";

import { useSearch } from "@/components/search-context";

/**
 * The "สินค้าแนะนำประจำสัปดาห์" heading, swapped for a filter-aware one once
 * a collection card or the search box narrows the grid below it — so picking
 * a category visibly changes the page instead of landing on what looks like
 * the same section every time.
 */
export function NewSectionFilterState() {
  const { query, activeLabel, setQuery, setActiveLabel } = useSearch();
  const filtered = query.trim().length > 0;

  function clear() {
    setQuery("");
    setActiveLabel(null);
  }

  if (!filtered) {
    return (
      <div className="section-heading">
        <div>
          <p className="eyebrow">CURATED THIS WEEK</p>
          <h2>สินค้าแนะนำประจำสัปดาห์</h2>
        </div>
        <a href="#collections">ดูทุกหมวด →</a>
      </div>
    );
  }

  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{activeLabel ? "หมวดสินค้า" : "ผลการค้นหา"}</p>
        <h2>{activeLabel ? activeLabel : `ค้นหา “${query.trim()}”`}</h2>
      </div>
      <button type="button" className="link-button" onClick={clear}>
        ดูสินค้าทั้งหมด ✕
      </button>
    </div>
  );
}
