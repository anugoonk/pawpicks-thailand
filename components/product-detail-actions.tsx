"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { shopeeCtaLabel } from "@/lib/affiliate";
import { availableQuantity, canPurchase, stockLabel } from "@/lib/cart";
import { formatThb } from "@/lib/format";
import { STORE_ENABLED } from "@/lib/store";
import type { Product } from "@/lib/types";

/**
 * With the store flag off this is affiliate-only. With it on, the add-to-cart
 * button appears only for active products with confirmed stock > 0; the
 * marketplace link is always a secondary option.
 */
export function ProductDetailActions({ product }: { product: Product }) {
  const { add, setCartOpen, lines } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = lines.find((line) => line.product.id === product.id)?.quantity ?? 0;

  function addToCart() {
    add(product.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="product-detail-actions">
      {STORE_ENABLED ? (
        <>
          <p className="stock-status">{stockLabel(product)}</p>
          {canPurchase(product) ? (
            <>
              <button
                className="add-to-cart primary-button"
                onClick={addToCart}
                disabled={inCart >= availableQuantity(product)}
              >
                {added ? "เพิ่มแล้ว ✓" : `เพิ่มลงตะกร้า · ${formatThb(product.priceThb)}`}
              </button>
              <button className="link-button" onClick={() => setCartOpen(true)}>
                ดูตะกร้า
              </button>
            </>
          ) : null}
        </>
      ) : null}
      <a
        className="shopee-link"
        href={product.shopeeUrl}
        target="_blank"
        rel="sponsored noopener"
      >
        {shopeeCtaLabel(product.shopeeUrl)}
      </a>
    </div>
  );
}
