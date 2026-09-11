"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-context";

/** Header button that opens the cart, with a live item-count badge. */
export function CartButton() {
  const { count, setCartOpen } = useCart();
  // Avoid a hydration mismatch: the count comes from localStorage, which is
  // only read after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      className="icon-button cart-button"
      aria-label={
        mounted && count > 0
          ? `เปิดตะกร้า มีสินค้า ${count} ชิ้น`
          : "เปิดตะกร้าสินค้า"
      }
      onClick={() => setCartOpen(true)}
    >
      <span aria-hidden="true">🛒</span>
      {mounted && count > 0 ? (
        <span className="cart-badge">{count > 99 ? "99+" : count}</span>
      ) : null}
    </button>
  );
}
