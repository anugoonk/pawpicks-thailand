# ระบบเนื้อหา PawPicks (คู่มือเพิ่มข้อมูล)

หลักการ: **ไม่ใส่ข้อมูลที่ไม่จริง** ช่องที่ไม่มีข้อมูลจะถูกซ่อน ไม่แสดง placeholder

| อยากเพิ่ม | ไปที่ | หมายเหตุ |
|---|---|---|
| ช่องทางติดต่อ / social | env: `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_FACEBOOK_URL`, `…_LINE_URL`, `…_INSTAGRAM_URL`, `…_TIKTOK_URL`, `…_YOUTUBE_URL` (ดู `.env.example`) | ตั้งใน Vercel แล้ว redeploy; หน้า /contact แสดงเองเมื่อมีค่า |
| Analytics | `lib/analytics.ts` → `registerAnalyticsProvider()` + `NEXT_PUBLIC_ANALYTICS_ENABLED=true` | ยังไม่มี provider; ห้ามใส่ ID ปลอม; ต้องอัปเดตหน้า privacy |
| สินค้า | `lib/data.ts` (หรือตาราง `products` ใน Supabase) | ฟิลด์ใหม่เป็น optional ทั้งหมด (ดู `productSchema` ใน `lib/types.ts`) |
| คู่มือ/บทความ | `data/guides.ts` | ว่างอยู่; `/guides` จะ 404 จนกว่าจะมีบทความ `status: "published"` |
| Ranking / Top 10 | `data/top10-articles.ts` | เผยแพร่ได้เมื่อมี 3–10 รายการที่ตรวจสอบแล้ว + `verifiedAt` |
| หมวดหมู่ | `data/categories.ts` | หน้าหมวดเปิดเมื่อมีสินค้า/คู่มือในหมวดนั้นเท่านั้น (ตรงกับ keyword ของหมวด) |
| เปรียบเทียบสินค้า | ลิงก์ `/compare?items=slug-a,slug-b` (2–4 ชิ้น) | noindex; ใช้ข้อมูลจริงเท่านั้น ช่องไหนไม่มีแสดง "ไม่มีข้อมูล" |

## ข้อมูลสินค้าที่ส่งผลต่อหน้าเว็บ
- `shopeeUrl` / `affiliateUrl`: ถ้าเป็นลิงก์ค้นหา (`/search`) จะ**ไม่แสดงราคา**และขึ้น "เช็กราคาล่าสุด" ใส่ลิงก์สินค้าจริงแล้วราคาจะแสดงเอง
- `rating` แสดงเมื่อมี `reviewCount` เท่านั้น; `soldCount`, `compareAtPriceThb` (ราคาปกติ → คำนวณส่วนลด) แสดงเมื่อมีค่า
- `pros`, `cons`, `bestFor`, `notIdealFor`, `specifications`, `editorNote`, `lastPriceCheck`, `lastDataCheck` → หน้าสินค้าแสดงเป็นส่วนๆ เมื่อมีข้อมูล
- `contentStatus`: `draft`/`archived` = ไม่แสดงบนเว็บ (ว่าง = เผยแพร่); แยกจาก `status` ของระบบร้านค้า
- ค่าคอมมิชชัน: **ไม่อยู่ใน `Product`** (เพราะ Product ถูกส่งไปเบราว์เซอร์) ใช้ `productInternalSchema` ฝั่งเซิร์ฟเวอร์/แอดมินเท่านั้น

## Affiliate
ลิงก์ทุกจุดใช้ `components/affiliate-link.tsx` (`AffiliateLink` / `AffiliateButton`): เปิดแท็บใหม่, `rel="noopener noreferrer sponsored"`, ไม่แสดงปุ่มถ้า URL ไม่ใช่ https, และยิงอีเวนต์ `affiliate_click`
(`product_id, product_name, merchant, placement, page_type, page_path, campaign` — ไม่มีข้อมูลส่วนบุคคล, path ไม่รวม query)
