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

/**
 * ===== วิธีกรอก =====
 * แทนที่ `PENDING` ด้วยข้อความในเครื่องหมายคำพูด เช่น legalName: "ชื่อจริงของคุณ",
 * กรอกให้ครบทั้ง 8 ช่อง หน้ากฎหมายถึงจะเปิดให้ Google เห็น (ถ้าเว้นไว้แม้ช่องเดียว
 * หน้า contact/shipping/returns/privacy/terms จะยังเป็น noindex ต่อไป)
 *
 * ข้อมูลทุกช่องจะแสดงต่อสาธารณะ ใส่เฉพาะช่องทางที่ยินดีให้ลูกค้าเห็น
 * (ถ้าเป็นบุคคลธรรมดา ใช้ที่อยู่ติดต่อได้ ไม่จำเป็นต้องเป็นที่อยู่บ้าน)
 * ใช้ \n ไม่ได้ ต้องเขียนเป็นบรรทัดเดียว
 */
export const BUSINESS = {
  /** ชื่อผู้ประกอบการตามจดทะเบียน/บัตรประชาชน เช่น "บริษัท ตัวอย่าง จำกัด" หรือ "นาย/นางสาว ชื่อ นามสกุล"
   *  แสดงที่: /contact, /privacy (ผู้ควบคุมข้อมูล), /terms */
  legalName: PENDING,
  /** เลขทะเบียนนิติบุคคล 13 หลัก หรือเลขประจำตัวผู้เสียภาษี (ถ้ายังไม่จดทะเบียน ระบุว่า "ไม่ได้จดทะเบียนนิติบุคคล" ตามจริง)
   *  แสดงที่: /contact, /terms */
  registrationNo: PENDING,
  /** ที่อยู่ติดต่อ เรียงบ้านเลขที่ ถนน ตำบล/แขวง อำเภอ/เขต จังหวัด รหัสไปรษณีย์ แสดงที่: /contact */
  address: PENDING,
  /** เบอร์โทร เช่น "081-234-5678" แสดงที่: /contact */
  phone: PENDING,
  /** อีเมลติดต่อที่เช็กจริง (ใช้เป็นช่องทางใช้สิทธิ์ PDPA ด้วย) แสดงที่: /contact, /privacy */
  email: PENDING,
  /** เวลาทำการ และช่องทางอื่น เช่น "จันทร์–ศุกร์ 9:00–18:00 น. · LINE OA @xxxx" แสดงที่: /contact */
  contactHours: PENDING,
  /** ระยะเวลาและผู้ให้บริการขนส่ง เช่น "จัดส่งภายใน 1–3 วันทำการ ผ่าน Kerry/Flash"
   *  ตอนนี้เว็บเป็น affiliate ยังไม่ขายเอง: ถ้าสินค้าส่งโดย Shopee ให้ระบุตามจริง เช่น
   *  "จัดส่งโดยร้านค้าบน Shopee ตามเงื่อนไขของแต่ละร้าน" แสดงที่: /shipping */
  shippingLeadTime: "จัดส่งโดยร้านค้าบน Shopee ตามเงื่อนไขของแต่ละร้าน",
  /** เงื่อนไขคืนสินค้า/คืนเงิน (จำนวนวัน สภาพสินค้า ใครออกค่าส่ง)
   *  ตอนนี้เว็บเป็น affiliate: ถ้าการคืนเป็นไปตามนโยบายของ Shopee/ร้านค้า ให้ระบุตามจริง
   *  ไม่ควรเขียนว่าคืนได้ภายใน X วัน ถ้าคุณไม่ได้เป็นผู้ขาย แสดงที่: /returns */
  returnWindow: "เป็นไปตามนโยบายของ Shopee และร้านค้าที่คุณสั่งซื้อ PawPicks ไม่ได้เป็นผู้ขายสินค้า",
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
