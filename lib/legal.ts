/**
 * Trust/legal pages listed in the footer and sitemap.
 *
 * PawPicks is a content + product-recommendation + affiliate site: it does not
 * take orders, payments or ship goods. Contact details come from lib/site-config.ts.
 */

export const LEGAL_PAGES = [
  { href: "/how-we-choose", label: "วิธีที่เราเลือกสินค้า" },
  { href: "/affiliate-disclosure", label: "การเปิดเผยลิงก์พันธมิตร" },
  { href: "/contact", label: "ติดต่อเรา" },
  { href: "/shipping", label: "การสั่งซื้อและจัดส่ง" },
  { href: "/returns", label: "การคืนสินค้าและรับประกัน" },
  { href: "/privacy", label: "นโยบายความเป็นส่วนตัว" },
  { href: "/terms", label: "ข้อกำหนดการใช้งาน" },
] as const;

/** Date the policy copy was last reviewed against how the site actually works. */
export const POLICY_UPDATED = "4 ตุลาคม 2569";
