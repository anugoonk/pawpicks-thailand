"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { formatThb } from "@/lib/format";
import type { Product } from "@/lib/types";
import { availableQuantity, stockLabel } from "@/lib/cart";

export function ProductDetailActions({ product }: { product: Product }) {
  const { add, setCartOpen, lines } = useCart();
  const maximum = availableQuantity(product);
  const quantity = lines.find((line) => line.product.id === product.id)?.quantity ?? 0;
  const [added, setAdded] = useState(false);

  function addToCart() {
    add(product.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="product-detail-actions">
      <button className="add-to-cart product-detail-cart" onClick={addToCart} disabled={quantity >= maximum}>
        {maximum === 0 ? stockLabel(product) : quantity >= maximum ? "ถึงจำนวนที่สั่งได้แล้ว" : added ? "เพิ่มแล้ว ✓" : `เพิ่มลงตะกร้า · ${formatThb(product.priceThb)}`}
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
