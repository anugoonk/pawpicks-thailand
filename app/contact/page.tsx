import type { Metadata } from "next";
import { Fact, StaticPage } from "@/components/static-page";
import { BUSINESS, isLegalPageIndexable } from "@/lib/legal";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description: "ช่องทางติดต่อ PawPicks Thailand",
  alternates: { canonical: "/contact" },
  robots: isLegalPageIndexable("/contact") ? undefined : { index: false, follow: true },
};

export default function ContactPage() {
  return (
    <StaticPage title="ติดต่อเรา" intro="สอบถามข้อมูลสินค้า การสั่งซื้อ หรือแจ้งปัญหาการใช้งานเว็บไซต์ได้ตามช่องทางด้านล่าง">
      <dl className="static-facts">
        <div><dt>ชื่อผู้ประกอบการ</dt><dd><Fact value={BUSINESS.legalName} /></dd></div>
        <div><dt>เลขทะเบียน</dt><dd><Fact value={BUSINESS.registrationNo} /></dd></div>
        <div><dt>ที่อยู่</dt><dd><Fact value={BUSINESS.address} /></dd></div>
        <div><dt>โทรศัพท์</dt><dd><Fact value={BUSINESS.phone} /></dd></div>
        <div><dt>อีเมล</dt><dd><Fact value={BUSINESS.email} /></dd></div>
        <div><dt>เวลาทำการ</dt><dd><Fact value={BUSINESS.contactHours} /></dd></div>
      </dl>
    </StaticPage>
  );
}
