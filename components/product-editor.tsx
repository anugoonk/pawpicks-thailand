"use client";

import { useActionState } from "react";
import { saveInventory, saveProductDetails } from "@/app/admin/products/actions";
import { stockLabel } from "@/lib/cart";
import type { Product } from "@/lib/types";

export function ProductEditor({ product, updatedAt }: { product: Product; updatedAt: string }) {
  const [detailsState, detailsAction, detailsPending] = useActionState(saveProductDetails, {});
  const [stockState, stockAction, stockPending] = useActionState(saveInventory, {});
  const low = product.stockQuantity !== null && product.stockQuantity <= product.lowStockThreshold;
  return <article className="editor-card">
    <div className="editor-heading"><h2>{product.name}</h2><span className={`stock-pill${low ? " stock-low" : ""}`}>{stockLabel(product)}</span></div>
    <form key={updatedAt} action={stockAction} className="editor-form inventory-form">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="expectedUpdatedAt" value={updatedAt} />
      <label>จำนวนพร้อมขาย<input name="quantity" type="number" min="0" max="1000000" step="1" required defaultValue={product.stockQuantity ?? ""} /></label>
      <label>แจ้งเตือนเมื่อเหลือไม่เกิน<input name="threshold" type="number" min="0" max="1000000" step="1" required defaultValue={product.lowStockThreshold} /></label>
      <button className="primary-button" disabled={stockPending}>{stockPending ? "กำลังบันทึก…" : "บันทึกสต็อก"}</button>
      <p className="field-help">กรอกจำนวนที่พร้อมขาย ไม่รวมสินค้าที่กันไว้ให้คำสั่งซื้อแล้ว ใส่ 0 เมื่อสินค้าหมด</p>
      {stockState.error ? <p role="alert" className="form-error">{stockState.error}</p> : null}
      {stockState.success ? <p role="status" className="form-success">{stockState.success}</p> : null}
    </form>
    <details className="product-edit-details"><summary>แก้ไขรายละเอียดและรูปสินค้า</summary>
      <form action={detailsAction} className="editor-form">
        <input type="hidden" name="productId" value={product.id} />
        <label>ขนาด (ระบุหน่วย)<input name="dimensions" maxLength={300} defaultValue={product.details.dimensions} placeholder="เช่น กว้าง × ยาว × สูง (ซม.)" /></label>
        <label>วัสดุ<input name="material" maxLength={300} defaultValue={product.details.material} /></label>
        <label>เหมาะกับแมวแบบไหน<textarea name="suitableFor" maxLength={1000} rows={2} defaultValue={product.details.suitableFor} /></label>
        <label>วิธีใช้และการดูแล<textarea name="instructions" maxLength={4000} rows={5} defaultValue={product.details.instructions} /></label>
        <label>รูปเพิ่มเติม (สูงสุด 8 รูป)<textarea name="images" rows={4} maxLength={19000} defaultValue={product.details.images.map((image) => `${image.src} | ${image.alt}`).join("\n")} placeholder="https://example.com/product-side.jpg | สินค้าด้านข้าง" /></label>
        <p className="field-help">หนึ่งรูปต่อบรรทัด: URL รูป | คำอธิบายรูป ใช้รูปจริงจากคลังรูปของร้าน</p>
        <button className="primary-button" disabled={detailsPending}>{detailsPending ? "กำลังบันทึก…" : "บันทึกรายละเอียด"}</button>
        {detailsState.error ? <p role="alert" className="form-error">{detailsState.error}</p> : null}
        {detailsState.success ? <p role="status" className="form-success">{detailsState.success}</p> : null}
      </form>
    </details>
  </article>;
}
