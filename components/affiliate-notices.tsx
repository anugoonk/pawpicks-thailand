import Link from "next/link";
import { AFFILIATE_NOTE } from "@/lib/affiliate";
import { siteConfig } from "@/lib/site-config";

/** One-line disclosure to sit next to CTAs / product lists. */
export function AffiliateNotice({ className = "affiliate-note" }: { className?: string }) {
  if (!siteConfig.affiliate.disclosureEnabled) return null;
  return <p className={className}>{AFFILIATE_NOTE}</p>;
}

/** Fuller disclosure block for pages that recommend products (product, guide, ranking, category). */
export function AffiliateDisclosure() {
  if (!siteConfig.affiliate.disclosureEnabled) return null;
  return (
    <aside className="affiliate-disclosure-box" aria-label="การเปิดเผยข้อมูลพันธมิตร">
      <p>
        <strong>การเปิดเผยข้อมูลพันธมิตร:</strong> {AFFILIATE_NOTE}{" "}
        ค่าคอมมิชชันไม่ใช่ตัวกำหนดอันดับสินค้า —{" "}
        <Link href="/affiliate-disclosure">อ่านรายละเอียด</Link> ·{" "}
        <Link href="/how-we-choose">วิธีที่เราเลือกสินค้า</Link>
      </p>
      <p>ราคา สต็อก และเงื่อนไขร้านค้าอาจเปลี่ยนแปลง โปรดตรวจสอบกับร้านค้าก่อนซื้อ</p>
    </aside>
  );
}
