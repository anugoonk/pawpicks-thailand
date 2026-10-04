/**
 * Trust/legal pages and the contact channels they quote.
 *
 * PawPicks is a content + product-recommendation + affiliate site: it does not
 * take orders, payments or ship goods. Nothing here is invented — every
 * contact channel must be a real one the owner has supplied.
 */

export type ContactChannel = {
  /** e.g. "Facebook Page", "อีเมล" */
  label: string;
  /** Text shown to the visitor, e.g. the email address or page name. */
  text: string;
  /** Link target, e.g. "mailto:…" or "https://facebook.com/…". */
  href: string;
};

/**
 * Real contact channels, shown on /contact. Empty until the owner supplies
 * some — the page then hides the section instead of showing a placeholder.
 * To add one:
 *   { label: "Facebook Page", text: "PawPicks Thailand", href: "https://facebook.com/…" }
 *   { label: "อีเมล", text: "hello@example.com", href: "mailto:hello@example.com" }
 */
export const CONTACT_CHANNELS: readonly ContactChannel[] = [];

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
