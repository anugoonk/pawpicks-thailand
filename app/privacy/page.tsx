import type { Metadata } from "next";
import { Fact, StaticPage } from "@/components/static-page";
import { BUSINESS, isLegalPageIndexable } from "@/lib/legal";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว",
  description: "วิธีที่ PawPicks Thailand เก็บและใช้ข้อมูลส่วนบุคคล",
  alternates: { canonical: "/privacy" },
  robots: isLegalPageIndexable("/privacy") ? undefined : { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <StaticPage title="นโยบายความเป็นส่วนตัว" intro="สรุปข้อมูลที่เว็บไซต์นี้เก็บจริงตามการทำงานของระบบ — ฉบับเต็มต้องผ่านการตรวจโดยผู้เชี่ยวชาญก่อนเปิดขายจริง">
      <h2>ข้อมูลที่เราเก็บ</h2>
      <ul>
        <li>อีเมล เมื่อคุณเข้าสู่ระบบด้วยลิงก์ทางอีเมล (ผ่าน Supabase Auth)</li>
        <li>ชื่อ ที่อยู่จัดส่ง เบอร์โทร และรายการสินค้า เมื่อคุณสั่งซื้อ</li>
        <li>คุกกี้ที่จำเป็นต่อการเข้าสู่ระบบ</li>
      </ul>
      <h2>ผู้ประมวลผลข้อมูล</h2>
      <ul>
        <li>Stripe — ประมวลผลการชำระเงิน เราไม่เก็บเลขบัตรของคุณ</li>
        <li>Supabase — จัดเก็บบัญชีและคำสั่งซื้อ</li>
        <li>Vercel — โฮสต์เว็บไซต์</li>
      </ul>
      <h2>สิทธิของคุณและการติดต่อ</h2>
      <p>ผู้ควบคุมข้อมูล: <Fact value={BUSINESS.legalName} /> · อีเมล: <Fact value={BUSINESS.email} /></p>
      <p><mark className="placeholder">[รอเจ้าของ/ที่ปรึกษากฎหมายตรวจสอบ: ระยะเวลาเก็บข้อมูล และขั้นตอนใช้สิทธิตาม PDPA]</mark></p>
    </StaticPage>
  );
}
