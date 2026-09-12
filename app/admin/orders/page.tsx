import { STATUS_TH } from "@/lib/shipping";
import type { Metadata } from "next";
import Link from "next/link";
import { ShipmentForm } from "@/components/shipment-form";
import { isAdmin } from "@/lib/admin";
import { formatShippingAddress, formatThb } from "@/lib/format";
import { getMyOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "แอดมิน · คำสั่งซื้อ",
  robots: { index: false, follow: false },
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
      <section className="section admin" style={{ maxWidth: 1280 }}>
        <p className="eyebrow" style={{ color: "var(--muted)" }}>
          แอดมิน
        </p>
        <h1 className="account-title">คำสั่งซื้อทั้งหมด ({orders.length})</h1>

        <nav className="admin-nav"><Link href="/admin/products">สินค้าและสต็อก</Link><Link href="/account">บัญชีของฉัน</Link></nav>
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
                      <p className={`order-status order-status-${o.status}`}>{STATUS_TH[o.status]}</p>
                      <ShipmentForm order={o} />
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
