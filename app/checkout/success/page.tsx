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
      .select("status, amount_total_thb")
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

  const paid = order?.status === "paid";
  const ref = sessionId ? sessionId.slice(-8).toUpperCase() : null;

  return (
    <main id="top">
      <section className="section" style={{ textAlign: "center", maxWidth: 640 }}>
        <p className="eyebrow" style={{ color: "var(--muted)" }}>
          {paid ? "ชำระเงินสำเร็จ" : "ได้รับคำสั่งซื้อแล้ว"}
        </p>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", margin: "12px 0" }}>
          {paid ? "ขอบคุณสำหรับคำสั่งซื้อ 🐾" : "ขอบคุณ! เรากำลังยืนยันการชำระเงิน"}
        </h1>
        <p style={{ color: "var(--muted)" }}>
          {paid
            ? "เราได้รับการชำระเงินของคุณเรียบร้อยแล้ว ทีมงานจะติดต่อกลับทางอีเมลเพื่อยืนยันการจัดส่ง"
            : "หากคุณชำระผ่าน PromptPay ระบบอาจใช้เวลาสักครู่ในการยืนยัน คุณจะได้รับอีเมลเมื่อการชำระเงินสมบูรณ์"}
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

        <p style={{ marginTop: 28 }}>
          <Link className="primary-button" href="/">
            กลับหน้าแรก <span>→</span>
          </Link>
        </p>
      </section>
    </main>
  );
}
