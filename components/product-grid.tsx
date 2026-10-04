"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/components/cart-context";
import { useSearch } from "@/components/search-context";
import { AffiliateNotice } from "@/components/affiliate-notices";
import { ProductCard } from "@/components/product-card";
import { availableQuantity, canPurchase, stockLabel } from "@/lib/cart";
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
    p.brand ?? "",
    (p.tags ?? []).join(" "),
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
          <ProductCard
            key={p.id}
            product={p}
            hidden={!matches[i]}
            actions={
              STORE_ENABLED ? (
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
              ) : undefined
            }
          />
        ))}
      </div>
      <AffiliateNotice />
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
