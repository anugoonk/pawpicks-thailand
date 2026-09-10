import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/sign-in-form";
import { hasSupabase } from "@/lib/env";
import { formatThb } from "@/lib/format";
import { getMyOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "บัญชีของฉัน",
  robots: { index: false, follow: false },
};

const STATUS_TH: Record<string, string> = {
  pending: "รอชำระเงิน",
  paid: "ชำระแล้ว",
  fulfilled: "จัดส่งแล้ว",
  cancelled: "ยกเลิก",
  refunded: "คืนเงินแล้ว",
};

const dateTh = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const user = await currentUser();

  if (!user) {
    return (
      <main id="top">
        <section className="section account" style={{ maxWidth: 460 }}>
          <p className="eyebrow" style={{ color: "var(--muted)" }}>
            บัญชีลูกค้า
          </p>
          <h1 className="account-title">เข้าสู่ระบบ</h1>
          <p style={{ color: "var(--muted)", marginBottom: 22 }}>
            เข้าสู่ระบบด้วยอีเมลเพื่อดูประวัติการสั่งซื้อของคุณ
          </p>
          <SignInForm hadError={error === "auth"} />
          <p style={{ marginTop: 22 }}>
            <Link href="/" style={{ color: "var(--muted)", textDecoration: "underline" }}>
              ← กลับหน้าแรก
            </Link>
          </p>
        </section>
      </main>
    );
  }

  const orders = await getMyOrders();

  return (
    <main id="top">
      <section className="section account" style={{ maxWidth: 760 }}>
        <div className="account-head">
          <div>
            <p className="eyebrow" style={{ color: "var(--muted)" }}>
              บัญชีของฉัน
            </p>
            <h1 className="account-title">{user.email}</h1>
          </div>
          <form action="/auth/signout" method="post">
            <button className="account-signout" type="submit">
              ออกจากระบบ
            </button>
          </form>
        </div>

        <h2 className="account-subtitle">ประวัติการสั่งซื้อ</h2>

        {orders.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>
            ยังไม่มีคำสั่งซื้อ —{" "}
            <Link href="/#new" style={{ textDecoration: "underline", fontWeight: 700 }}>
              เลือกสินค้า
            </Link>
          </p>
        ) : (
          <ul className="orders">
            {orders.map((o) => (
              <li key={o.id} className="order-card">
                <div className="order-card-head">
                  <span className="order-date">{dateTh.format(new Date(o.createdAt))}</span>
                  <span className={`order-status order-status-${o.status}`}>
                    {STATUS_TH[o.status] ?? o.status}
                  </span>
                </div>
                {o.items.length > 0 ? (
                  <ul className="order-items">
                    {o.items.map((it, i) => (
                      <li key={i}>
                        <span>
                          {it.name} × {it.quantity}
                        </span>
                        <span>{formatThb(it.unitPriceThb * it.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="order-total">
                  <span>ยอดรวม</span>
                  <span>{formatThb(o.amountTotalThb)}</span>
                </div>
                <p className="order-ref">เลขอ้างอิง: {o.id.slice(0, 8).toUpperCase()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

async function currentUser(): Promise<{ email?: string } | null> {
  if (!hasSupabase()) return null;
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ? { email: user.email ?? undefined } : null;
  } catch {
    return null;
  }
}
