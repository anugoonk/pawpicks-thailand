"use client";

import { useActionState } from "react";
import { saveShipment } from "@/app/admin/orders/actions";
import { CARRIERS } from "@/lib/shipping";
import type { MyOrder } from "@/lib/orders";

export function ShipmentForm({ order }: { order: MyOrder }) {
  const [state, action, pending] = useActionState(saveShipment, {});
  if (!["paid", "fulfilled"].includes(order.status)) return <span className="field-help">ยังไม่สามารถจัดส่งคำสั่งซื้อนี้ได้</span>;
  return <form action={action} className="editor-form shipment-form">
    <input type="hidden" name="orderId" value={order.id} />
    <label>บริษัทขนส่ง<select name="carrier" defaultValue={order.shippingCarrier ?? ""} required><option value="" disabled>เลือกบริษัทขนส่ง</option>{CARRIERS.map((carrier) => <option key={carrier}>{carrier}</option>)}</select></label>
    <label>เลขพัสดุ<input name="trackingNumber" minLength={5} maxLength={80} defaultValue={order.trackingNumber ?? ""} required /></label>
    <button className="admin-status-save" disabled={pending}>{pending ? "กำลังบันทึก…" : order.status === "fulfilled" ? "แก้ไขเลขพัสดุ" : "ยืนยันจัดส่ง"}</button>
    {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
    {state.success ? <p className="form-success" role="status">{state.success}</p> : null}
  </form>;
}
