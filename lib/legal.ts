/**
 * Trust/legal pages and the business facts they quote.
 *
 * NOTHING here is invented: every unknown fact is the PENDING placeholder, which
 * renders visibly on the page. While any placeholder remains, LEGAL_READY is
 * false and these pages are noindex + kept out of the sitemap, so unfinished
 * legal copy can never be mistaken for real policy. Fill the values in
 * docs/OWNER-TODO.md, replace them below, and the pages go live on their own.
 */
export const PENDING = "[รอเจ้าของกรอก]";

export const BUSINESS = {
  /** ชื่อนิติบุคคล / ชื่อผู้ประกอบการตามจดทะเบียน */
  legalName: PENDING,
  /** เลขทะเบียนนิติบุคคล / เลขประจำตัวผู้เสียภาษี */
  registrationNo: PENDING,
  address: PENDING,
  phone: PENDING,
  email: PENDING,
  /** เวลาทำการ / ช่องทางติดต่ออื่น (เช่น LINE OA) */
  contactHours: PENDING,
  /** ระยะเวลาจัดส่ง, ผู้ให้บริการขนส่ง */
  shippingLeadTime: PENDING,
  /** เงื่อนไขการคืนสินค้า/คืนเงิน (จำนวนวัน, เงื่อนไขสภาพสินค้า, ใครออกค่าส่ง) */
  returnWindow: PENDING,
} as const;

export const LEGAL_READY = !Object.values(BUSINESS).some((v) => v === PENDING);

export const LEGAL_PAGES = [
  { href: "/contact", label: "ติดต่อเรา" },
  { href: "/shipping", label: "การจัดส่ง" },
  { href: "/returns", label: "การคืนสินค้า" },
  { href: "/privacy", label: "นโยบายความเป็นส่วนตัว" },
  { href: "/terms", label: "ข้อกำหนดการใช้งาน" },
  { href: "/affiliate-disclosure", label: "การเปิดเผยลิงก์พันธมิตร" },
] as const;

/** Affiliate disclosure is factual and complete as-is, so it never waits on owner data. */
export function isLegalPageIndexable(href: string): boolean {
  return href === "/affiliate-disclosure" || LEGAL_READY;
}
