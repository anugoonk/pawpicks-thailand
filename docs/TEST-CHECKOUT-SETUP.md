# ตั้งค่า Dev/Staging + Stripe Test Mode (ไม่แตะ Production)

Decision: ใช้ฟอร์มที่อยู่ของ Stripe Checkout ต่อ (เก็บลง `orders.shipping_address`).

## 1) Supabase Dev project (แยกจาก Production ref anqnryqdpcnlixjxobfq)
1. supabase.com → New project (ตั้งชื่อ pawpicks-dev, region Singapore). จดเป็นโปรเจกต์ DEV เท่านั้น
2. `npx supabase link --project-ref <DEV_REF>`  (ตรวจ ref ให้ไม่ใช่ anqnryqdpcnlixjxobfq ก่อนทุกครั้ง)
3. `npx supabase db push`  แล้ว `npx supabase db query --linked --file supabase/seed.sql`
4. Auth → URL Configuration: ใส่ URL ของ Vercel Preview + http://localhost:3021
5. ⚠️ จบแล้วให้ `npx supabase link --project-ref anqnryqdpcnlixjxobfq` คืน หรือ unlink เพื่อกันพลาด

## 2) Stripe Test Mode
1. Dashboard → สลับเป็น Test mode (ห้ามใช้ live keys)
2. Developers → API keys: เอา `sk_test_...` และ `pk_test_...`
3. Webhooks → Add endpoint: `<PREVIEW_URL>/api/stripe/webhook`
   events: checkout.session.completed, checkout.session.async_payment_succeeded,
   checkout.session.async_payment_failed, checkout.session.expired → เอา `whsec_...`

## 3) Vercel env — scope **Preview เท่านั้น** (ห้ามติ๊ก Production)
ชื่อตัวแปร (ใส่ค่าใน dashboard เอง ห้ามส่งในแชต/commit):
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (Sensitive),
STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET,
NEXT_PUBLIC_SITE_URL (= Preview URL), NEXT_PUBLIC_STORE_ENABLED=true

## 4) ข้อมูลสินค้า
กรอก `docs/product-data-template.csv` (ราคา/stock จริงเท่านั้น) แล้วส่งให้ นำเข้า Dev DB
บัตรทดสอบ Stripe: 4242 4242 4242 4242 (สำเร็จ), 4000 0000 0000 0002 (ปฏิเสธ)

## 5) Migrations ใหม่ (ยังไม่ถูกใช้กับ Production)
`20261001000000_order_status_values.sql` และ `20261001000100_product_catalog_fields.sql`
- เพิ่มคอลัมน์/สถานะเท่านั้น (ไม่ลบ/ไม่แก้ข้อมูลเดิม) ทดสอบด้วย Postgres จำลองใน `tests/product-migration.test.ts`
- ใช้ `npx supabase db push` กับ **Dev project เท่านั้น** ก่อน เช็ก ref ให้ไม่ใช่ anqnryqdpcnlixjxobfq
- ก่อนขึ้น Production: รีวิวไฟล์, สำรองข้อมูล, ขออนุมัติเจ้าของ
- ย้อนกลับ: ค่า enum ที่เพิ่มแล้วลบไม่ได้ง่าย (ปล่อยไว้ไม่มีผล); ส่วนสินค้า = `drop trigger products_sync_status`, drop คอลัมน์ใหม่ + `status`, และคืน `reserve_stock/apply_checkout_event/ship_order` จาก migration 20260912010000
- `active` ยังอยู่ แต่ถูกคำนวณจาก `status` (active = status <> 'archived'); draft = แสดงผลแต่ยังขายไม่ได้
- ค่าส่งยังคำนวณระดับ order บน server (ไม่ได้เพิ่ม shipping_fee รายสินค้า เพราะยังไม่มี logic ใช้)
