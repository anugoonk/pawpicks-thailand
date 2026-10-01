import type { Metadata } from "next";
import { Fact, StaticPage } from "@/components/static-page";
import { BUSINESS, isLegalPageIndexable } from "@/lib/legal";

export const metadata: Metadata = {
  title: "ข้อกำหนดการใช้งาน",
  description: "ข้อกำหนดการใช้งานเว็บไซต์ PawPicks Thailand",
  alternates: { canonical: "/terms" },
  robots: isLegalPageIndexable("/terms") ? undefined : { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <StaticPage title="ข้อกำหนดการใช้งาน" intro="โปรดอ่านก่อนใช้งานเว็บไซต์หรือสั่งซื้อสินค้า">
      <h2>เนื้อหาและข้อมูลสินค้า</h2>
      <p>
        ข้อมูล ราคา และอันดับบนเว็บไซต์มีไว้เพื่อประกอบการตัดสินใจ อาจเปลี่ยนแปลงได้โดยไม่แจ้งล่วงหน้า
        เนื้อหาไม่ใช่คำแนะนำทางสัตวแพทย์ หากแมวมีอาการผิดปกติโปรดปรึกษาสัตวแพทย์
      </p>
      <h2>การสั่งซื้อและการชำระเงิน</h2>
      <p>คำสั่งซื้อถือว่าสมบูรณ์เมื่อระบบได้รับการยืนยันการชำระเงินจากผู้ให้บริการชำระเงินแล้วเท่านั้น</p>
      <h2>ลิงก์พันธมิตร</h2>
      <p>ดู <a href="/affiliate-disclosure">การเปิดเผยลิงก์พันธมิตร</a></p>
      <h2>ผู้ให้บริการ</h2>
      <p><Fact value={BUSINESS.legalName} /> · เลขทะเบียน <Fact value={BUSINESS.registrationNo} /></p>
      <p><mark className="placeholder">[รอที่ปรึกษากฎหมายตรวจสอบ: ข้อจำกัดความรับผิด กฎหมายที่ใช้บังคับ การระงับข้อพิพาท]</mark></p>
    </StaticPage>
  );
}
