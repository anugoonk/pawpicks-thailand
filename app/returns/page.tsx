import type { Metadata } from "next";
import { Fact, StaticPage } from "@/components/static-page";
import { BUSINESS, isLegalPageIndexable } from "@/lib/legal";

export const metadata: Metadata = {
  title: "การคืนสินค้าและคืนเงิน",
  description: "เงื่อนไขการคืนสินค้าและคืนเงินของ PawPicks Thailand",
  alternates: { canonical: "/returns" },
  robots: isLegalPageIndexable("/returns") ? undefined : { index: false, follow: true },
};

export default function ReturnsPage() {
  return (
    <StaticPage title="การคืนสินค้าและคืนเงิน" intro="นโยบายนี้ใช้กับสินค้าที่ซื้อจาก PawPicks โดยตรงเท่านั้น สินค้าที่ซื้อผ่าน Shopee/Lazada เป็นไปตามเงื่อนไขของแพลตฟอร์มนั้น">
      <h2>เงื่อนไขการคืนสินค้า</h2>
      <p><Fact value={BUSINESS.returnWindow} /></p>
      <h2>การคืนเงิน</h2>
      <p>การคืนเงินดำเนินการผ่านช่องทางที่ใช้ชำระเงิน (Stripe) และเมื่อคืนเงินแล้ว สถานะคำสั่งซื้อจะแสดงเป็น “คืนเงินแล้ว” ในหน้าบัญชี</p>
      <p>ช่องทางแจ้งคืนสินค้า: ดูที่หน้า <a href="/contact">ติดต่อเรา</a></p>
    </StaticPage>
  );
}
