import { OrderTracking } from "@/components/order-tracking";
import type { Metadata } from "next";
import Link from "next/link";
import { hasSupabase } from "@/lib/env";
import { formatThb } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ยืนยันคำสั่งซื้อ",
  robots: { index: false, follow: false },
};

type OrderView = {
  status: string;
  shipping_carrier: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  amount_total_thb: number | null;
};

/**
 * The Stripe webhook confirms payment asynchronously, so at redirect time the
 * order may not exist yet (or be `pending` for PromptPay). Look it up
 * best-effort and always show a sensible message.
 */
async function lookupOrder(sessionId: string): Promise<OrderView | null> {
  if (!hasSupabase()) return null;
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("orders")
      .select("status, amount_total_thb, shipping_carrier, tracking_number, shipped_at")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();
    return (data as OrderView | null) ?? null;
  } catch {
    return null;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const order = sessionId ? await lookupOrder(sessionId) : null;

  const paid = order?.status === "paid" || order?.status === "fulfilled";
  const cancelled = order?.status === "cancelled" || order?.status === "refunded";
  const ref = sessionId ? sessionId.slice(-8).toUpperCase() : null;

  return (
    <main id="top">
      <section className="section" style={{ textAlign: "center", maxWidth: 640 }}>
        <p className="eyebrow" style={{ color: "var(--muted)" }}>
          {cancelled ? "คำสั่งซื้อสิ้นสุดแล้ว" : paid ? "ชำระเงินสำเร็จ" : "ได้รับคำสั่งซื้อแล้ว"}
        </p>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", margin: "12px 0" }}>
          {cancelled ? "คำสั่งซื้อนี้ถูกยกเลิกหรือคืนเงินแล้ว" : paid ? "ขอบคุณสำหรับคำสั่งซื้อ 🐾" : "ขอบคุณ! เรากำลังยืนยันการชำระเงิน"}
        </h1>
        <p style={{ color: "var(--muted)" }}>
          {cancelled ? "ติดต่อร้านหากต้องการสอบถามเพิ่มเติม" : paid
            ? "เราได้รับการชำระเงินของคุณเรียบร้อยแล้ว ติดตามการจัดส่งได้จากหน้านี้"
            : "หากคุณชำระผ่าน PromptPay ระบบอาจใช้เวลาสักครู่ในการยืนยัน กลับมาดูสถานะได้จากหน้านี้"}
        </p>

        {order?.amount_total_thb ? (
          <p style={{ marginTop: 18, fontWeight: 700 }}>
            ยอดรวม {formatThb(order.amount_total_thb)}
          </p>
        ) : null}

        {ref ? (
          <p style={{ marginTop: 6, color: "var(--muted)", fontSize: ".9rem" }}>
            เลขอ้างอิงคำสั่งซื้อ: <strong>{ref}</strong>
          </p>
        ) : null}

        {order ? <OrderTracking status={order.status} shippingCarrier={order.shipping_carrier} trackingNumber={order.tracking_number} shippedAt={order.shipped_at} /> : null}
        <p className="field-help">บันทึกลิงก์หน้านี้ไว้เพื่อติดตามคำสั่งซื้อของคุณ และอย่าแชร์ลิงก์นี้กับผู้อื่น</p>
        <p><Link href="/account">ดูคำสั่งซื้อในบัญชีของฉัน</Link></p>
        <p style={{ marginTop: 28 }}>
          <Link className="primary-button" href="/">
            กลับหน้าแรก <span>→</span>
          </Link>
        </p>
      </section>
    </main>
  );
}
