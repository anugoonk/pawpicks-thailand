/**
 * Product/guide categories. Names and one-line descriptions only — no product
 * data. A category page is public only when it has real products or published
 * guides (see lib/categories.ts); optional `buyingGuide` / `faq` render only
 * when filled with reviewed content.
 */
export type Category = {
  slug: string;
  name: string;
  description: string;
  /** Decorative emoji icon. */
  icon?: string;
  image?: string;
  parent?: string;
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
  sortOrder: number;
  /** Lower-case words matched against a product's name/category/tags/keywords to place it here. */
  keywords: string[];
  /** Reviewed buying-guide paragraphs (optional). */
  buyingGuide?: string[];
  faq?: { question: string; answer: string }[];
};

export const CATEGORIES: Category[] = [
  { slug: "pet-cameras", name: "กล้องดูแมว", description: "กล้องและอุปกรณ์สำหรับดูแมวผ่านมือถือเมื่อต้องออกจากบ้าน", icon: "📷", parent: "pet-tech", featured: true, sortOrder: 1, keywords: ["กล้อง", "pet camera"] },
  { slug: "auto-feeders", name: "เครื่องให้อาหารอัตโนมัติ", description: "เครื่องให้อาหารแบบตั้งเวลา สำหรับมื้ออาหารที่ตรงเวลา", icon: "🍽️", parent: "pet-tech", featured: true, sortOrder: 2, keywords: ["เครื่องให้อาหาร", "ให้อาหารแมว"] },
  { slug: "water-fountains", name: "น้ำพุแมว", description: "น้ำพุและอุปกรณ์น้ำดื่มที่ช่วยให้น้ำไหลเวียน", icon: "💧", parent: "pet-tech", featured: true, sortOrder: 3, keywords: ["น้ำพุ", "เครื่องให้น้ำ"] },
  { slug: "litter-boxes", name: "กระบะทราย", description: "กระบะทรายและห้องน้ำแมวทั้งแบบธรรมดาและอัตโนมัติ", icon: "🧺", sortOrder: 4, keywords: ["กระบะทราย", "ห้องน้ำแมว", "litter"] },
  { slug: "pet-tech", name: "Pet Tech", description: "อุปกรณ์อัจฉริยะสำหรับแมวและคนเลี้ยงแมว", icon: "🤖", featured: true, sortOrder: 5, keywords: ["pet tech"] },
  { slug: "toys", name: "ของเล่น", description: "ของเล่นและที่ลับเล็บสำหรับแก้เบื่อและออกกำลัง", icon: "🧶", sortOrder: 6, keywords: ["ของเล่น", "ลับเล็บ", "scratcher"] },
  { slug: "cat-care", name: "อุปกรณ์ดูแลแมว", description: "อุปกรณ์ดูแลขน เล็บ และสุขอนามัยของแมว", icon: "🪮", sortOrder: 7, keywords: ["ดูแลขน", "แปรงขน", "ตัดเล็บ"] },
  { slug: "accessories", name: "Accessories", description: "ของใช้และอุปกรณ์เสริมสำหรับแมว", icon: "🎀", sortOrder: 8, keywords: ["accessories", "อุปกรณ์เสริม"] },
];
