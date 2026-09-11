import type { Metadata } from "next";
import Link from "next/link";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import { isAdmin } from "@/lib/admin";
import { formatShippingAddress, formatThb } from "@/lib/format";
import { getMyOrders } from "@/lib/orders";
import { orderStatusSchema } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "แอดมิน · คำสั่งซื้อ",
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

export default async function AdminOrdersPage() {
  const admin = await isAdmin();

  if (!admin) {
    return (
      <main id="top">
        <section className="section" style={{ maxWidth: 460, textAlign: "center" }}>
          <p className="eyebrow" style={{ color: "var(--muted)" }}>
            403
          </p>
          <h1 style={{ fontSize: "clamp(1.5rem,3.5vw,2rem)", margin: "10px 0" }}>
            ไม่มีสิทธิ์เข้าถึงหน้านี้
          </h1>
          <p style={{ color: "var(--muted)" }}>
            หน้านี้สำหรับผู้ดูแลระบบเท่านั้น
          </p>
          <p style={{ marginTop: 22 }}>
            <Link href="/account" style={{ textDecoration: "underline", fontWeight: 700 }}>
              ← ไปที่บัญชีของฉัน
            </Link>
          </p>
        </section>
      </main>
    );
  }

  // Admins see every order — same query as the customer view, but RLS
  // ("orders: read own" -> user_id = auth.uid() OR is_admin()) widens it.
  const orders = await getMyOrders(200);

  return (
    <main id="top">
      <section className="section admin" style={{ maxWidth: 980 }}>
        <p className="eyebrow" style={{ color: "var(--muted)" }}>
          แอดมิน
        </p>
        <h1 className="account-title">คำสั่งซื้อทั้งหมด ({orders.length})</h1>

        {orders.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>ยังไม่มีคำสั่งซื้อ</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>เลขอ้างอิง</th>
                  <th>รายการ</th>
                  <th>จัดส่งไปที่</th>
                  <th>ยอดรวม</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{dateTh.format(new Date(o.createdAt))}</td>
                    <td>{o.id.slice(0, 8).toUpperCase()}</td>
                    <td>
                      {o.items.length === 0
                        ? "—"
                        : o.items.map((it) => `${it.name} ×${it.quantity}`).join(", ")}
                    </td>
                    <td>
                      {o.shippingAddress ? (
                        <>
                          {o.shippingAddress.name ?? "—"}
                          <br />
                          <span style={{ color: "var(--muted)", fontSize: ".82rem" }}>
                            {formatShippingAddress(o.shippingAddress) ?? "ไม่มีที่อยู่"}
                            {o.shippingAddress.phone ? ` · ${o.shippingAddress.phone}` : ""}
                          </span>
                        </>
                      ) : (
                        <span style={{ color: "var(--muted)" }}>ยังไม่มีที่อยู่</span>
                      )}
                    </td>
                    <td>{formatThb(o.amountTotalThb)}</td>
                    <td>
                      <form action={updateOrderStatus} className="admin-status-form">
                        <input type="hidden" name="orderId" value={o.id} />
                        <select
                          name="status"
                          defaultValue={o.status}
                          className={`order-status order-status-${o.status}`}
                        >
                          {orderStatusSchema.options.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_TH[s] ?? s}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="admin-status-save">
                          บันทึก
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
