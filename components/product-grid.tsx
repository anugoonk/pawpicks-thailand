"use client";

import { useMemo } from "react";
import { useSearch } from "@/components/search-context";
import type { Product } from "@/lib/types";

function haystack(p: Product): string {
  return [
    p.searchKeywords,
    p.name,
    p.category,
    p.description,
    p.companionLabel ?? "",
    p.badge ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

export function ProductGrid({ products }: { products: Product[] }) {
  const { query } = useSearch();
  const term = query.trim().toLowerCase();

  const matches = useMemo(
    () => products.map((p) => !term || haystack(p).includes(term)),
    [products, term],
  );
  const shown = matches.filter(Boolean).length;

  return (
    <>
      <div className="product-grid" id="productGrid">
        {products.map((p, i) => (
          <article
            key={p.id}
            className="product-card"
            data-search={p.searchKeywords}
            hidden={!matches[i]}
          >
            <div className={`product-image ${p.imageCrop ?? ""}`.trim()}>
              {/* Plain <img>: the original design crops via CSS transform:scale. */}
              <img src={p.image} alt={p.name} />
              {p.badge ? (
                <span className={`badge${p.badgeDark ? " dark" : ""}`}>
                  {p.badge}
                </span>
              ) : null}
            </div>
            <div className="product-info">
              {p.companionCatId ? (
                <a className="product-companion" href={`#${p.companionCatId}`}>
                  <img
                    src={p.companionImage ?? ""}
                    alt={p.companionAlt ?? ""}
                    loading="lazy"
                  />
                  <span>{p.companionLabel}</span>
                </a>
              ) : null}
              <small>{p.category}</small>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <a href={p.shopeeUrl} target="_blank" rel="sponsored noopener">
                ดูสินค้าบน Shopee →
              </a>
            </div>
          </article>
        ))}
      </div>
      <p
        className="empty-state"
        id="emptyState"
        style={{ display: shown ? "none" : "block" }}
      >
        ยังไม่พบสินค้าที่ค้นหา ลองใช้คำว่า “กล้อง”, “น้ำพุ” หรือ “อาหาร”
      </p>
    </>
  );
}
