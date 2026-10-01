"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart-context";
import { useSearch } from "@/components/search-context";
import { shopeeCtaLabel } from "@/lib/affiliate";
import { availableQuantity, canPurchase, stockLabel } from "@/lib/cart";
import { teamPathForCatId } from "@/data/team";
import { STORE_ENABLED } from "@/lib/store";
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
  const { query, setQuery, setActiveLabel } = useSearch();
  const { add, lines } = useCart();
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

  function clearFilter() {
    setQuery("");
    setActiveLabel(null);
  }

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
                <Link className="product-companion" href={teamPathForCatId(p.companionCatId)}>
                  <img
                    src={p.companionImage ?? ""}
                    alt={p.companionAlt ?? ""}
                    loading="lazy"
                  />
                  <span>{p.companionLabel}</span>
                </Link>
              ) : null}
              <small>{p.category}</small>
              <h3>
                <Link className="product-title-link" href={`/products/${p.slug}`}>
                  {p.name}
                </Link>
              </h3>
              <p>{p.description}</p>
              <div className="product-actions">
                {STORE_ENABLED ? (
                  <>
                    <p className="stock-status">{stockLabel(p)}</p>
                    {canPurchase(p) ? (
                      <button
                        className="add-to-cart"
                        onClick={() => addToCart(p.id)}
                        aria-label={`เพิ่ม ${p.name} ลงตะกร้า`}
                        disabled={(lines.find((line) => line.product.id === p.id)?.quantity ?? 0) >= availableQuantity(p)}
                      >
                        {added === p.id ? "เพิ่มแล้ว ✓" : `เพิ่มลงตะกร้า · ${formatThb(p.priceThb)}`}
                      </button>
                    ) : null}
                  </>
                ) : (
                  <p className="product-reference-price">
                    ราคาอ้างอิง {formatThb(p.priceThb)}
                  </p>
                )}
                {/* Marketplace links are a secondary option, never the main CTA. */}
                <a
                  href={p.shopeeUrl}
                  target="_blank"
                  rel="sponsored noopener"
                  className="shopee-link"
                >
                  {shopeeCtaLabel(p.shopeeUrl)}
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div
        className="empty-state"
        id="emptyState"
        style={{ display: shown ? "none" : "block" }}
      >
        <p>
          ยังไม่มีสินค้าที่ตรงกับ “{query.trim()}” ในขณะนี้ — เร็วๆ นี้จะทยอยเพิ่มสินค้า
        </p>
        <button type="button" className="link-button" onClick={clearFilter}>
          ดูสินค้าทั้งหมด
        </button>
      </div>
    </>
  );
}
