"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { formatThb } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductDetailActions({ product }: { product: Product }) {
  const { add, setCartOpen } = useCart();
  const [added, setAdded] = useState(false);

  function addToCart() {
    add(product.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="product-detail-actions">
      <button className="add-to-cart product-detail-cart" onClick={addToCart}>
        {added ? "เพิ่มแล้ว ✓" : `เพิ่มลงตะกร้า · ${formatThb(product.priceThb)}`}
      </button>
      <button className="link-button" onClick={() => setCartOpen(true)}>
        ดูตะกร้า
      </button>
      <a
        className="shopee-link"
        href={product.shopeeUrl}
        target="_blank"
        rel="sponsored noopener"
      >
        ดูบน Shopee
      </a>
    </div>
  );
}
