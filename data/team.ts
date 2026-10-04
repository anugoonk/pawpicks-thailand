/**
 * The 12 PawPicks mascot cats — single source of truth for the home-page team
 * section, the /team/[slug] profile pages, the product "companion" badges and
 * the sitemap.
 *
 * Cats are identified by colour/pattern, never by a nickname. Roles are
 * storytelling roles for the site's mascots; they are not real product tests
 * or reviews, and the copy must not claim otherwise.
 */

export type TeamLineId = "pet-tech" | "food-water" | "play-content" | "home-ops";

export type TeamLine = {
  id: TeamLineId;
  title: string;
};

export type CatLink = { label: string; href: string };

export type TeamCat = {
  /** Matches /assets/cat-N.png and `product.companionCatId`. */
  id: string;
  slug: string;
  /** Colour/pattern used instead of a name (also the image alt text). */
  color: string;
  image: string;
  line: TeamLineId;
  role: string;
  /** นิสัย */
  traits: string;
  /** หน้าที่ในเว็บ */
  duties: string;
  /** มุกประจำตัว */
  quirk: string;
  /** คำพูดประจำตัว (optional) */
  quote?: string;
  /** Product slugs this cat looks after; resolved against the live catalogue. */
  productSlugs: string[];
  /** Collection ids (see COLLECTIONS) this cat looks after. */
  collectionIds: string[];
  /** Other real pages this cat points to. */
  extraLinks?: CatLink[];
};

export const TEAM_LINES: TeamLine[] = [
  { id: "pet-tech", title: "สาย Pet Tech" },
  { id: "food-water", title: "สายอาหารและน้ำ" },
  { id: "play-content", title: "สายเล่นและคอนเทนต์" },
  { id: "home-ops", title: "สายบ้านอุ่นใจและปฏิบัติการ" },
];

/** Display order: grouped by line, as shown on the home page and in prev/next. */
export const TEAM: TeamCat[] = [
  // ---- สาย Pet Tech ----
  {
    id: "cat-1",
    slug: "gray",
    color: "แมวสีเทา",
    image: "/assets/cat-1.png",
    line: "pet-tech",
    role: "CEO และหัวหน้าสาย Pet Tech",
    traits: "นิ่ง ขรึม ตัดสินใจเด็ดขาด",
    duties: "กำหนดทิศทางของเว็บ และเกณฑ์ว่าสินค้าไหนคุ้มพอจะแนะนำ",
    quirk: "นั่งบนโต๊ะเสมอและไม่เคยรีบ",
    quote: "ถ้าไม่คุ้ม เราไม่แนะนำ",
    productSlugs: [],
    collectionIds: ["pet-tech"],
  },
  {
    id: "cat-12",
    slug: "colorpoint-blue-eyes",
    color: "แมวแต้มเข้มตาฟ้า",
    image: "/assets/cat-12.png",
    line: "pet-tech",
    role: "หัวหน้าฝ่ายความปลอดภัยและมาตรฐานสินค้า",
    traits: "สง่า เคร่งระเบียบ ละเอียด",
    duties: "ใส่ใจเรื่องวัสดุ ความปลอดภัย และคำเตือน ก่อนสินค้าขึ้นเว็บ",
    quirk: "เลิกคิ้วใส่สินค้า ถ้าไม่ผ่านจะหันหลังให้",
    productSlugs: [],
    collectionIds: ["pet-tech"],
  },
  {
    id: "cat-3",
    slug: "black",
    color: "แมวดำ",
    image: "/assets/cat-3.png",
    line: "pet-tech",
    role: "Smart Home และ Security (ดูแลกล้อง)",
    traits: "ลึกลับ เงียบ เห็นทุกอย่างในที่มืด",
    duties: "สนใจกล้อง เซ็นเซอร์ และอุปกรณ์เฝ้าบ้าน",
    quirk: "โผล่จากใต้โต๊ะตอนไม่มีใครคาดคิด",
    productSlugs: ["wifi-pet-camera"],
    collectionIds: ["safe-home"],
  },

  // ---- สายอาหารและน้ำ ----
  {
    id: "cat-8",
    slug: "orange-white",
    color: "แมวส้มขาว",
    image: "/assets/cat-8.png",
    line: "food-water",
    role: "หัวหน้าสายอาหารและมื้อตรงเวลา",
    traits: "ขี้อ้อน เป็นมิตร กินเก่ง",
    duties: "คัดชามอาหาร อุปกรณ์มื้ออาหาร และของกินที่ปลอดภัย",
    quirk: "ถูตัวขอชิมก่อนทุกครั้ง",
    productSlugs: [],
    collectionIds: ["food-water"],
  },
  {
    id: "cat-4",
    slug: "orange-tabby",
    color: "แมวส้มลายเสือ",
    image: "/assets/cat-4.png",
    line: "food-water",
    role: "ผู้ทดสอบเครื่องให้อาหารอัตโนมัติ",
    traits: "พลังเยอะ ลุยงาน ตื่นก่อนทุกคน",
    duties: "สนใจว่าเครื่องให้อาหารทำงานตรงเวลาและทนทานหรือไม่",
    quirk: "ยืนรอหน้าเครื่องก่อนเวลา 30 นาที",
    productSlugs: ["auto-feeder"],
    collectionIds: ["food-water"],
  },
  {
    id: "cat-2",
    slug: "white-odd-eyed",
    color: "แมวขาวตาสองสี",
    image: "/assets/cat-2.png",
    line: "food-water",
    role: "ผู้เชี่ยวชาญน้ำดื่มและวิเคราะห์ความคุ้มค่า",
    traits: "สายตาเฉียบ จับผิดตัวเลข",
    duties: "ดูแลเรื่องน้ำพุ และเทียบราคาระหว่างรุ่น",
    quirk: "จ้องตัวเลขแล้วปัดของตกโต๊ะ",
    productSlugs: ["auto-water-fountain"],
    collectionIds: ["food-water"],
  },
  {
    id: "cat-11",
    slug: "cream",
    color: "แมวสีครีมส้ม",
    image: "/assets/cat-11.png",
    line: "food-water",
    role: "ดูแลผู้อ่านและชุมชน (Community Care)",
    traits: "อ่อนโยน ใจดี ชอบงีบ",
    duties: "ตอบคำถามคนเลี้ยงแมว และรวบรวมความต้องการของผู้อ่าน",
    quirk: "หลับกลางประชุมแต่ตื่นมาตอบถูกทุกครั้ง",
    productSlugs: [],
    collectionIds: [],
    extraLinks: [{ label: "ติดต่อทีมงาน", href: "/contact" }],
  },

  // ---- สายเล่นและคอนเทนต์ ----
  {
    id: "cat-5",
    slug: "calico",
    color: "แมวสามสี",
    image: "/assets/cat-5.png",
    line: "play-content",
    role: "Creative Director และ Marketing",
    traits: "ไอเดียพุ่ง อารมณ์เปลี่ยนเร็ว",
    duties: "คิดคอนเทนต์ แคปชั่น และธีมสินค้าประจำสัปดาห์",
    quirk: "ไอเดียใหม่มาตอนตีสาม",
    productSlugs: [],
    collectionIds: ["play-time"],
  },
  {
    id: "cat-7",
    slug: "silver-tabby",
    color: "แมวซิลเวอร์แท็บบี้",
    image: "/assets/cat-7.png",
    line: "play-content",
    role: "บรรณาธิการ Top 10 และวิเคราะห์รีวิว",
    traits: "ละเอียด ต่อรองเก่ง เปรียบเทียบเก่ง",
    duties: "ดูแลการจัดอันดับในหน้า Top 10 และอ่านรีวิวผู้ซื้อ",
    quirk: "ถือแว่นขยายเทียบทีละข้อ",
    productSlugs: [],
    collectionIds: [],
    extraLinks: [{ label: "PawPicks Top 10", href: "/top-10" }],
  },
  {
    id: "cat-10",
    slug: "brown-tabby",
    color: "แมวแท็บบี้สีน้ำตาล",
    image: "/assets/cat-10.png",
    line: "play-content",
    role: "ผู้ทดสอบของเล่นและที่ลับเล็บ",
    traits: "ชอบสำรวจ ทดลองของใหม่",
    duties: "สนใจที่ลับเล็บ ของเล่น และอุปกรณ์แก้เบื่อ",
    quirk: "ทดสอบความทนด้วยการพังให้ดู",
    productSlugs: ["ramp-scratcher"],
    collectionIds: ["play-time"],
  },

  // ---- สายบ้านอุ่นใจและปฏิบัติการ ----
  {
    id: "cat-9",
    slug: "brown",
    color: "แมวสีน้ำตาล",
    image: "/assets/cat-9.png",
    line: "home-ops",
    role: "COO และหัวหน้าสายบ้านอุ่นใจ",
    traits: "ใจเย็น พึ่งพาได้ คุมภาพรวม",
    duties: "ประสานทุกสาย และดูแลอุปกรณ์ช่วยเมื่อต้องออกจากบ้าน",
    quirk: "เฝ้าทุกคนเงียบๆ จากมุมห้อง",
    productSlugs: [],
    collectionIds: ["safe-home"],
  },
  {
    id: "cat-6",
    slug: "tuxedo",
    color: "แมวขาวดำ",
    image: "/assets/cat-6.png",
    line: "home-ops",
    role: "ต้อนรับและดูแลลิงก์/สต็อก (Front Desk)",
    traits: "เนี้ยบเหมือนใส่สูท สุภาพ",
    duties: "ดูแลให้ลิงก์ Shopee และข้อมูลสินค้าบนเว็บเป็นปัจจุบัน",
    quirk: "โค้งต้อนรับผู้อ่านทุกคน",
    productSlugs: [],
    collectionIds: [],
    extraLinks: [{ label: "ดูสินค้าทั้งหมด", href: "/#new" }],
  },
];

export function getTeamCat(slug: string): TeamCat | undefined {
  return TEAM.find((c) => c.slug === slug);
}

export function getTeamCatById(id: string): TeamCat | undefined {
  return TEAM.find((c) => c.id === id);
}

/** Profile URL for a cat id (e.g. a product's `companionCatId`); falls back to the team section. */
export function teamPathForCatId(id: string | null | undefined): string {
  const cat = id ? getTeamCatById(id) : undefined;
  return cat ? `/team/${cat.slug}` : "/#team";
}

/** Previous/next cat in display order, wrapping around. */
export function getTeamNeighbours(slug: string): { prev: TeamCat; next: TeamCat } {
  const i = TEAM.findIndex((c) => c.slug === slug);
  return {
    prev: TEAM[(i - 1 + TEAM.length) % TEAM.length],
    next: TEAM[(i + 1) % TEAM.length],
  };
}
