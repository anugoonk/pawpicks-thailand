import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ยกเลิกการชำระเงิน",
  robots: { index: false, follow: false },
};

export default function CheckoutCancelledPage() {
  return (
    <main id="top">
      <section className="section" style={{ textAlign: "center", maxWidth: 640 }}>
        <p className="eyebrow" style={{ color: "var(--muted)" }}>
          ยังไม่มีการชำระเงิน
        </p>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", margin: "12px 0" }}>
          ยกเลิกการชำระเงินแล้ว
        </h1>
        <p style={{ color: "var(--muted)" }}>
          รายการสั่งซื้อของคุณยังไม่ถูกตัดเงิน หากต้องการสั่งซื้ออีกครั้ง
          กลับไปที่หน้าสินค้าได้เลย
        </p>
        <p style={{ marginTop: 28 }}>
          <Link className="primary-button" href="/#new">
            เลือกสินค้าต่อ <span>→</span>
          </Link>
        </p>
      </section>
    </main>
  );
}
