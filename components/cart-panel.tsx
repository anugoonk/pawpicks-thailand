"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-context";
import { formatThb } from "@/lib/format";

const ERROR_MESSAGES: Record<number, string> = {
  429: "มีการสั่งซื้อบ่อยเกินไป กรุณาลองใหม่อีกครั้งในอีกสักครู่",
  503: "ระบบชำระเงินยังไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่ภายหลัง",
};

export function CartPanel() {
  const {
    lines,
    count,
    subtotalThb,
    shippingThb,
    totalThb,
    freeShippingThreshold,
    setQuantity,
    remove,
    cartOpen,
    setCartOpen,
    checkoutItems,
  } = useCart();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [cartOpen, setCartOpen]);

  // Clear a stale error when the cart is closed or its contents change.
  useEffect(() => {
    setError(null);
  }, [cartOpen, subtotalThb]);

  async function checkout() {
    if (checkoutItems.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: checkoutItems }),
      });
      if (!res.ok) {
        setError(
          ERROR_MESSAGES[res.status] ??
            "เกิดข้อผิดพลาดในการเริ่มการชำระเงิน กรุณาลองใหม่",
        );
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("ไม่สามารถเปิดหน้าชำระเงินได้ กรุณาลองใหม่");
      }
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่");
    } finally {
      setBusy(false);
    }
  }

  const remainingForFreeShipping =
    subtotalThb > 0 && subtotalThb < freeShippingThreshold
      ? freeShippingThreshold - subtotalThb
      : 0;

  return (
    <>
      <div
        className={`cart-overlay${cartOpen ? " open" : ""}`}
        onClick={() => setCartOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`cart-panel${cartOpen ? " open" : ""}`}
        aria-label="ตะกร้าสินค้า"
        aria-hidden={!cartOpen}
      >
        <div className="cart-head">
          <strong>ตะกร้าสินค้า{count > 0 ? ` (${count})` : ""}</strong>
          <button
            className="cart-close"
            onClick={() => setCartOpen(false)}
            aria-label="ปิดตะกร้า"
          >
            ✕
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="cart-empty">
            <p>ยังไม่มีสินค้าในตะกร้า</p>
            <button className="cart-continue" onClick={() => setCartOpen(false)}>
              เลือกสินค้าต่อ →
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-items">
              {lines.map(({ product, quantity }) => (
                <li key={product.id} className="cart-line">
                  <div className="cart-thumb">
                    <img src={product.image} alt={product.name} loading="lazy" />
                  </div>
                  <div className="cart-line-body">
                    <p className="cart-line-name">{product.name}</p>
                    <p className="cart-line-price">
                      {formatThb(product.priceThb)}
                    </p>
                    <div className="qty-stepper">
                      <button
                        onClick={() => setQuantity(product.id, quantity - 1)}
                        aria-label={`ลดจำนวน ${product.name}`}
                      >
                        −
                      </button>
                      <span aria-live="polite">{quantity}</span>
                      <button
                        onClick={() => setQuantity(product.id, quantity + 1)}
                        aria-label={`เพิ่มจำนวน ${product.name}`}
                      >
                        +
                      </button>
                      <button
                        className="cart-remove"
                        onClick={() => remove(product.id)}
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                  <div className="cart-line-total">
                    {formatThb(product.priceThb * quantity)}
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-foot">
              {remainingForFreeShipping > 0 ? (
                <p className="cart-hint">
                  ซื้อเพิ่มอีก {formatThb(remainingForFreeShipping)} รับส่งฟรี
                </p>
              ) : null}
              <div className="cart-summary-row">
                <span>ยอดรวมสินค้า</span>
                <span>{formatThb(subtotalThb)}</span>
              </div>
              <div className="cart-summary-row">
                <span>ค่าจัดส่ง</span>
                <span>{shippingThb === 0 ? "ฟรี" : formatThb(shippingThb)}</span>
              </div>
              <div className="cart-summary-row cart-summary-total">
                <span>ยอดชำระ</span>
                <span>{formatThb(totalThb)}</span>
              </div>

              {error ? (
                <p className="cart-error" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                className="cart-checkout"
                onClick={checkout}
                disabled={busy}
              >
                {busy ? "กำลังพาไปหน้าชำระเงิน…" : "ชำระเงินอย่างปลอดภัย"}
              </button>
              <p className="cart-secure">ชำระผ่าน Stripe · บัตรเครดิต / PromptPay</p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
