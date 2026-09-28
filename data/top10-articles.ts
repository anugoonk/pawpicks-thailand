import type { Top10Article } from "@/lib/types";

/**
 * Central source of truth for PawPicks "Top 10" articles. One shared landing
 * page (`/top-10`) and one shared article template (`/top-10/[slug]`) read
 * from this list — no per-article pages.
 *
 * Every article defaults to `coming_soon` with `items: []`. Do not add
 * product names, prices, ratings, reviews, or test results here unless they
 * are real and verified — set `status: "published"`, fill all 10 `items`,
 * and set `verifiedAt` only then (`top10ArticleSchema` in lib/types.ts
 * rejects anything else at parse time, which fails the build).
 */
export const TOP10_ARTICLES: Top10Article[] = [
  {
    slug: "automatic-cat-feeders",
    title: "10 อันดับเครื่องให้อาหารแมวอัตโนมัติ",
    category: "อาหารและน้ำ",
    excerpt:
      "เปรียบเทียบเครื่องให้อาหารแมวอัตโนมัติ พร้อมฟังก์ชันตั้งเวลา ความจุ และรูปแบบที่เหมาะกับแต่ละบ้าน",
    status: "coming_soon",
    items: [],
  },
  {
    slug: "easy-clean-cat-water-fountains",
    title: "10 อันดับน้ำพุแมวที่ทำความสะอาดง่าย",
    category: "อาหารและน้ำ",
    excerpt:
      "รวมน้ำพุแมวที่ออกแบบมาให้ถอดล้างง่าย พร้อมเปรียบเทียบระบบกรอง ความจุ และระดับเสียง",
    status: "coming_soon",
    items: [],
  },
  {
    slug: "automatic-litter-boxes",
    title: "10 อันดับกระบะทรายแมวอัตโนมัติ",
    category: "ห้องน้ำและความสะอาด",
    excerpt:
      "เปรียบเทียบกระบะทรายอัตโนมัติด้านความปลอดภัย การควบคุมกลิ่น ขนาด และการดูแลรักษา",
    status: "coming_soon",
    items: [],
  },
  {
    slug: "odor-control-cat-litter",
    title: "10 อันดับทรายแมวเก็บกลิ่นดี",
    category: "ห้องน้ำและความสะอาด",
    excerpt:
      "เปรียบเทียบทรายแมวแต่ละประเภทในด้านการจับตัว การควบคุมกลิ่น ฝุ่น และความสะดวกในการทำความสะอาด",
    status: "coming_soon",
    items: [],
  },
  {
    slug: "cat-food-by-life-stage",
    title: "10 อันดับอาหารแมวตามช่วงวัย",
    category: "อาหารและน้ำ",
    excerpt:
      "แนวทางเลือกอาหารให้เหมาะกับลูกแมว แมวโต และแมวสูงวัย พร้อมข้อมูลที่เจ้าของควรพิจารณา",
    status: "coming_soon",
    items: [],
  },
  {
    slug: "indoor-cat-food",
    title: "10 อันดับอาหารแมวสำหรับแมวเลี้ยงในบ้าน",
    category: "อาหารและน้ำ",
    excerpt:
      "เปรียบเทียบอาหารสำหรับแมวเลี้ยงในบ้าน โดยพิจารณาส่วนประกอบ ช่วงวัย และลักษณะการใช้ชีวิต",
    status: "coming_soon",
    items: [],
  },
  {
    slug: "interactive-cat-toys",
    title: "10 อันดับของเล่นแมวแก้เบื่อ",
    category: "ของเล่นและกิจกรรม",
    excerpt:
      "รวมของเล่นที่ช่วยเพิ่มกิจกรรม กระตุ้นสัญชาตญาณ และลดความเบื่อของแมวที่อยู่ในบ้าน",
    status: "coming_soon",
    items: [],
  },
  {
    slug: "cat-trees-small-spaces",
    title: "10 อันดับคอนโดแมวสำหรับพื้นที่จำกัด",
    category: "บ้านและพื้นที่แมว",
    excerpt:
      "เปรียบเทียบคอนโดแมวขนาดกะทัดรัดสำหรับคอนโด ห้องพัก และบ้านที่มีพื้นที่จำกัด",
    status: "coming_soon",
    items: [],
  },
  {
    slug: "cat-cameras",
    title: "10 อันดับกล้องดูแมวผ่านมือถือ",
    category: "Pet Tech",
    excerpt:
      "เปรียบเทียบกล้องดูแมวด้านคุณภาพภาพ การแจ้งเตือน การพูดคุย และการควบคุมผ่านมือถือ",
    status: "coming_soon",
    items: [],
  },
  {
    slug: "vacuum-cleaners-for-cat-homes",
    title: "10 อันดับเครื่องดูดฝุ่นสำหรับบ้านที่เลี้ยงแมว",
    category: "บ้านและความสะอาด",
    excerpt:
      "เปรียบเทียบเครื่องดูดฝุ่นสำหรับจัดการขนแมวตามพื้น พรม โซฟา และบริเวณที่ทำความสะอาดยาก",
    status: "coming_soon",
    items: [],
  },
  {
    slug: "cat-grooming-brushes",
    title: "10 อันดับแปรงกำจัดขนแมว",
    category: "ดูแลขนและเล็บ",
    excerpt:
      "รวมแปรงสำหรับขนสั้น ขนยาว และช่วงผลัดขน พร้อมคำแนะนำการเลือกให้เหมาะกับแมว",
    status: "coming_soon",
    items: [],
  },
  {
    slug: "air-purifiers-for-cat-homes",
    title: "10 อันดับเครื่องฟอกอากาศสำหรับบ้านที่มีแมว",
    category: "บ้านและความสะอาด",
    excerpt:
      "เปรียบเทียบเครื่องฟอกอากาศด้านระบบกรอง พื้นที่ใช้งาน ระดับเสียง และการดูแลไส้กรอง",
    status: "coming_soon",
    items: [],
  },
  {
    slug: "cat-carriers-and-strollers",
    title: "10 อันดับกระเป๋าและรถเข็นแมว",
    category: "เดินทางกับแมว",
    excerpt:
      "เปรียบเทียบกระเป๋าและรถเข็นสำหรับพาแมวเดินทาง โดยพิจารณาความปลอดภัย พื้นที่ และการระบายอากาศ",
    status: "coming_soon",
    items: [],
  },
  {
    slug: "cooling-cat-beds",
    title: "10 อันดับที่นอนแมวสำหรับอากาศร้อน",
    category: "บ้านและพื้นที่แมว",
    excerpt:
      "รวมที่นอนและเบาะแมวที่เหมาะกับอากาศร้อน เน้นวัสดุ ระบายอากาศ และทำความสะอาด",
    status: "coming_soon",
    items: [],
  },
  // TODO: เพิ่มหัวข้อ 15-20 — ยังไม่มีข้อมูล title/category/excerpt ที่ยืนยันแล้ว
];
