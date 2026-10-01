import type { Metadata } from "next";
import { Fact, StaticPage } from "@/components/static-page";
import { BUSINESS, isLegalPageIndexable } from "@/lib/legal";

export const metadata: Metadata = {
  title: "การจัดส่ง",
  description: "ข้อมูลการจัดส่งสินค้าของ PawPicks Thailand",
  alternates: { canonical: "/shipping" },
  robots: isLegalPageIndexable("/shipping") ? undefined : { index: false, follow: true },
};

export default function ShippingPage() {
  return (
    <StaticPage title="การจัดส่ง" intro="ขณะนี้ PawPicks กำลังเตรียมเปิดจำหน่ายสินค้าโดยตรง รายละเอียดด้านล่างจะยืนยันก่อนเปิดขาย">
      <h2>พื้นที่และเวลาจัดส่ง</h2>
      <p>จัดส่งภายในประเทศไทยเท่านั้น (ระบบชำระเงินรับเฉพาะที่อยู่ในประเทศไทย)</p>
      <p>ระยะเวลาและผู้ให้บริการขนส่ง: <Fact value={BUSINESS.shippingLeadTime} /></p>
      <h2>ค่าจัดส่ง</h2>
      <p>
        ค่าจัดส่งคำนวณโดยระบบและแสดงก่อนชำระเงินทุกครั้ง อัตราที่ใช้ในระบบทดสอบยังไม่ใช่อัตราที่ยืนยันแล้ว
        — <mark className="placeholder">[รอเจ้าของยืนยันอัตราค่าจัดส่งและเงื่อนไขส่งฟรี]</mark>
      </p>
      <h2>ติดตามพัสดุ</h2>
      <p>เมื่อจัดส่งแล้ว ผู้ซื้อที่เข้าสู่ระบบจะเห็นชื่อขนส่งและเลขพัสดุในหน้าบัญชีของตน</p>
    </StaticPage>
  );
}
