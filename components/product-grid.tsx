"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart-context";
import { useSearch } from "@/components/search-context";
import { formatThb } from "@/lib/format";
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
  const { add, setCartOpen } = useCart();
  const [added, setAdded] = useState<string | null>(null);
  const term = query.trim().toLowerCase();

  function addToCart(id: string) {
    add(id);
    setAdded(id);
    window.setTimeout(() => setAdded((cur) => (cur === id ? null : cur)), 1400);
  }

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
            <Link
              className={`product-image product-image-link ${p.imageCrop ?? ""}`.trim()}
              href={`/products/${p.slug}`}
              aria-label={`ดูรายละเอียด ${p.name}`}
            >
              {/* Plain <img>: the original design crops via CSS transform:scale. */}
              <img src={p.image} alt={p.name} />
              {p.badge ? (
                <span className={`badge${p.badgeDark ? " dark" : ""}`}>
                  {p.badge}
                </span>
              ) : null}
            </Link>
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
              <h3>
                <Link className="product-title-link" href={`/products/${p.slug}`}>
                  {p.name}
                </Link>
              </h3>
              <p>{p.description}</p>
              <div className="product-actions">
                <button
                  className="add-to-cart"
                  onClick={() => addToCart(p.id)}
                  aria-label={`เพิ่ม ${p.name} ลงตะกร้า`}
                >
                  {added === p.id
                    ? "เพิ่มแล้ว ✓"
                    : `เพิ่มลงตะกร้า · ${formatThb(p.priceThb)}`}
                </button>
                <div className="product-links">
                  <button
                    className="link-button"
                    onClick={() => setCartOpen(true)}
                  >
                    ดูตะกร้า
                  </button>
                  <a
                    href={p.shopeeUrl}
                    target="_blank"
                    rel="sponsored noopener"
                    className="shopee-link"
                  >
                    ดูบน Shopee ↗
                  </a>
                </div>
              </div>
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
