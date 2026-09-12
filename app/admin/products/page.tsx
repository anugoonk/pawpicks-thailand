import type { Metadata } from "next";
import Link from "next/link";
import { ProductEditor } from "@/components/product-editor";
import { isAdmin } from "@/lib/admin";
import { rowToProduct } from "@/lib/products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "แอดมิน · สินค้าและสต็อก", robots: { index: false, follow: false } };

export default async function AdminProductsPage() {
  if (!(await isAdmin())) return <main className="section"><h1>ไม่มีสิทธิ์เข้าถึงหน้านี้</h1><Link href="/account">ไปที่บัญชีของฉัน</Link></main>;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*").order("sort_order");
  if (error) throw new Error("ไม่สามารถโหลดข้อมูลสินค้าได้");
  const products = (data ?? []).map((row) => ({ product: rowToProduct(row), updatedAt: String(row.updated_at) }));
  const lowStock = products.filter(({ product }) => product.stockQuantity !== null && product.stockQuantity <= product.lowStockThreshold);
  const unconfirmed = products.filter(({ product }) => product.stockQuantity === null);
  return <main className="section admin-products">
    <p className="eyebrow">แอดมิน</p><h1 className="account-title">สินค้าและสต็อก</h1>
    <nav className="admin-nav"><Link href="/admin/orders">คำสั่งซื้อและจัดส่ง</Link><Link href="/account">บัญชีของฉัน</Link><Link href="/">ดูหน้าร้าน</Link></nav>
    <div className="inventory-summary" role="status">
      <strong>สินค้าทั้งหมด {products.length} รายการ</strong>
      <span>ใกล้หมด / หมด {lowStock.length} รายการ</span><span>รอยืนยันสต็อก {unconfirmed.length} รายการ</span>
    </div>
    {lowStock.length ? <aside className="inventory-alert"><strong>ควรเติมสต็อก</strong><ul>{lowStock.map(({ product }) => <li key={product.id}>{product.name} · เหลือ {product.stockQuantity} ชิ้น</li>)}</ul></aside> : null}
    <div className="editor-list">{products.map(({ product, updatedAt }) => <ProductEditor key={product.id} product={product} updatedAt={updatedAt} />)}</div>
  </main>;
}
