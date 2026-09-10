import type { Cat, Collection, Product } from "@/lib/types";

/**
 * Static fallback content, mirroring the original static site 1:1.
 *
 * This is the source of truth when Supabase is not configured (local first
 * run, CI build) and the seed for `supabase/seed.sql`. When Supabase IS
 * configured, `lib/products.ts` reads the `products` table instead and only
 * falls back here on error.
 */

const SHOPEE = (keyword: string) =>
  `https://shopee.co.th/search?keyword=${encodeURIComponent(keyword)}`;

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "auto-water-fountain",
    slug: "auto-water-fountain",
    name: "น้ำพุแมวอัตโนมัติ",
    category: "Pet Tech",
    description:
      "ช่วยให้น้ำไหลเวียน เหมาะกับบ้านที่อยากดูแลเรื่องการดื่มน้ำ",
    priceThb: 890,
    image: "/assets/pawpicks-hero.png",
    imageCrop: "crop-fountain",
    badge: "แมวควรมี",
    badgeDark: false,
    companionCatId: "cat-2",
    companionLabel: "เพื่อนมุมน้ำดื่ม",
    companionImage: "/assets/cat-2.png",
    companionAlt: "แมวขาวตาสองสี",
    shopeeUrl: SHOPEE("น้ำพุแมว"),
    searchKeywords: "น้ำพุแมว เครื่องให้น้ำ pet tech",
    active: true,
    sortOrder: 1,
  },
  {
    id: "auto-feeder",
    slug: "auto-feeder",
    name: "เครื่องให้อาหารอัตโนมัติ",
    category: "Pet Tech",
    description:
      "ตั้งเวลาอาหารได้ ช่วยให้มื้อของเจ้าเหมียวตรงเวลาแม้วันที่ยุ่ง",
    priceThb: 1290,
    image: "/assets/pawpicks-hero.png",
    imageCrop: "crop-feeder",
    badge: "ยอดนิยม",
    badgeDark: false,
    companionCatId: "cat-4",
    companionLabel: "เพื่อนมื้ออร่อย",
    companionImage: "/assets/cat-4.png",
    companionAlt: "แมวส้มลายเสือ",
    shopeeUrl: SHOPEE("เครื่องให้อาหารแมวอัตโนมัติ"),
    searchKeywords: "เครื่องให้อาหารแมว อัตโนมัติ pet tech",
    active: true,
    sortOrder: 2,
  },
  {
    id: "wifi-pet-camera",
    slug: "wifi-pet-camera",
    name: "กล้องดูแมวผ่านมือถือ",
    category: "Smart Home",
    description:
      "เช็กเจ้าเหมียวได้จากนอกบ้าน พร้อมเลือกรุ่นที่เหมาะกับพื้นที่จริง",
    priceThb: 1590,
    image: "/assets/pawpicks-hero.png",
    imageCrop: "crop-camera",
    badge: "สาย IT เลือก",
    badgeDark: true,
    companionCatId: "cat-3",
    companionLabel: "เพื่อนเฝ้าบ้าน",
    companionImage: "/assets/cat-3.png",
    companionAlt: "แมวดำ",
    shopeeUrl: SHOPEE("กล้องดูแมว"),
    searchKeywords: "กล้องดูแมว กล้อง pet camera wifi",
    active: true,
    sortOrder: 3,
  },
  {
    id: "ramp-scratcher",
    slug: "ramp-scratcher",
    name: "ที่ลับเล็บแบบทางลาด",
    category: "Cat Essentials",
    description:
      "มุมลับเล็บกำลังดี ช่วยดึงความสนใจออกจากโซฟาตัวโปรดของเรา",
    priceThb: 490,
    image: "/assets/pawpicks-hero.png",
    imageCrop: "crop-scratcher",
    badge: "บ้านน่าอยู่",
    badgeDark: false,
    companionCatId: "cat-10",
    companionLabel: "เพื่อนชวนเล่น",
    companionImage: "/assets/cat-10.png",
    companionAlt: "แมวแท็บบี้สีน้ำตาล",
    shopeeUrl: SHOPEE("ที่ลับเล็บแมว"),
    searchKeywords: "ที่ลับเล็บแมว ไม้ scratcher",
    active: true,
    sortOrder: 4,
  },
];

export const COLLECTIONS: Collection[] = [
  {
    id: "pet-tech",
    title: "Pet Tech",
    blurb: "ให้อาหาร ดูแล และเฝ้าดูจากมือถือ",
    query: "pet tech",
    catImages: [
      { src: "/assets/cat-1-collection.webp", alt: "แมวสีเทา" },
      { src: "/assets/cat-12-collection.webp", alt: "แมวแต้มเข้มตาฟ้า" },
    ],
    sortOrder: 1,
  },
  {
    id: "food-water",
    title: "กินดีตรงเวลา",
    blurb: "อุปกรณ์สำหรับมื้ออาหารและน้ำดื่ม",
    query: "อาหาร",
    catImages: [
      { src: "/assets/cat-8-collection.webp", alt: "แมวส้มขาว" },
      { src: "/assets/cat-11-collection.webp", alt: "แมวสีครีมส้ม" },
    ],
    sortOrder: 2,
  },
  {
    id: "play-time",
    title: "เล่นเพลิน",
    blurb: "ของเล่นและที่ลับเล็บแก้เบื่อ",
    query: "ลับเล็บ",
    catImages: [
      { src: "/assets/cat-5-collection.webp", alt: "แมวสามสี" },
      { src: "/assets/cat-7-collection.webp", alt: "แมวซิลเวอร์แท็บบี้" },
    ],
    sortOrder: 3,
  },
  {
    id: "safe-home",
    title: "บ้านอุ่นใจ",
    blurb: "อุปกรณ์ช่วยดูแลเมื่อต้องออกจากบ้าน",
    query: "กล้อง",
    catImages: [
      { src: "/assets/cat-6-collection.webp", alt: "แมวขาวดำ" },
      { src: "/assets/cat-9-collection.webp", alt: "แมวสีน้ำตาล" },
    ],
    sortOrder: 4,
  },
];

export const CAT_TEAM: Cat[] = [
  { id: "cat-1", name: "แมวสีเทา", image: "/assets/cat-1.png", ariaLabel: "แมวสีเทา พาชมสินค้า", query: "pet tech", sortOrder: 1 },
  { id: "cat-2", name: "แมวขาวตาสองสี", image: "/assets/cat-2.png", ariaLabel: "แมวขาวตาสองสี พาชมสินค้า", query: "น้ำพุ", sortOrder: 2 },
  { id: "cat-3", name: "แมวดำ", image: "/assets/cat-3.png", ariaLabel: "แมวดำ พาชมสินค้า", query: "กล้อง", sortOrder: 3 },
  { id: "cat-4", name: "แมวส้มลายเสือ", image: "/assets/cat-4.png", ariaLabel: "แมวส้มลายเสือ พาชมสินค้า", query: "อาหาร", sortOrder: 4 },
  { id: "cat-5", name: "แมวสามสี", image: "/assets/cat-5.png", ariaLabel: "แมวสามสี พาชมสินค้า", query: "ลับเล็บ", sortOrder: 5 },
  { id: "cat-6", name: "แมวขาวดำ", image: "/assets/cat-6.png", ariaLabel: "แมวขาวดำ พาชมสินค้า", query: "กล้อง", sortOrder: 6 },
  { id: "cat-7", name: "แมวซิลเวอร์แท็บบี้", image: "/assets/cat-7.png", ariaLabel: "แมวซิลเวอร์แท็บบี้ พาชมสินค้า", query: "ลับเล็บ", sortOrder: 7 },
  { id: "cat-8", name: "แมวส้มขาว", image: "/assets/cat-8.png", ariaLabel: "แมวส้มขาว พาชมสินค้า", query: "อาหาร", sortOrder: 8 },
  { id: "cat-9", name: "แมวสีน้ำตาล", image: "/assets/cat-9.png", ariaLabel: "แมวสีน้ำตาล พาชมสินค้า", query: "", sortOrder: 9 },
  { id: "cat-10", name: "แมวแท็บบี้สีน้ำตาล", image: "/assets/cat-10.png", ariaLabel: "แมวแท็บบี้สีน้ำตาล พาชมสินค้า", query: "ลับเล็บ", sortOrder: 10 },
  { id: "cat-11", name: "แมวสีครีมส้ม", image: "/assets/cat-11.png", ariaLabel: "แมวสีครีมส้ม พาชมสินค้า", query: "น้ำพุ", sortOrder: 11 },
  { id: "cat-12", name: "แมวแต้มเข้มตาฟ้า", image: "/assets/cat-12.png", ariaLabel: "แมวแต้มเข้มตาฟ้า พาชมสินค้า", query: "pet tech", sortOrder: 12 },
];
