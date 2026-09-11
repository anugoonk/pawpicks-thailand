# SECURITY CHECKLIST — PawPicks Thailand

ตรวจก่อน push ขึ้น GitHub ครั้งแรก และก่อน merge เข้า `main` ทุกครั้ง

## 1. Secrets & Source control

- [ ] ไม่มี `.env`, `.env.local`, `.env.production` ฯลฯ ถูก track ใน git (`git ls-files | grep .env` เห็นแค่ `.env.example`)
- [ ] `.env.example` มีแต่ชื่อตัวแปรและค่าตัวอย่าง ไม่มีค่าจริง
- [ ] ไม่มี `sk_live_...`, `sk_test_...`, `service_role` JWT, `whsec_...` ในโค้ด/ประวัติ commit
- [ ] GitHub repo เป็น **Private** และไม่เคยถูกตั้งเป็น Public
- [ ] เปิด GitHub secret scanning + push protection (Settings > Code security)
- [ ] `.gitignore` ครอบ `.env*`, `.vercel`, `supabase/.temp`
- [ ] CI job "Guard against committed secrets" อยู่และผ่าน

## 2. ขอบเขต Client / Server

- [ ] `SUPABASE_SERVICE_ROLE_KEY` ใช้เฉพาะไฟล์ที่ `import "server-only"` (`lib/supabase/admin.ts`) — ไม่มี `NEXT_PUBLIC_` นำหน้า
- [ ] `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` อยู่ฝั่ง server เท่านั้น
- [ ] ไม่มี Client Component import `lib/supabase/admin.ts` / `lib/stripe.ts` (build จะ fail จาก `server-only` ถ้าเผลอ)
- [ ] เฉพาะ `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` เท่านั้นที่ขึ้นเป็น public

## 3. Supabase / ฐานข้อมูล

- [ ] ทุกตารางใน `public` เปิด `enable row level security`
- [ ] `products` / `collections` / `cats` — public อ่านได้เฉพาะแถว `active`
- [ ] `orders` / `order_items` — อ่านได้เฉพาะของเจ้าของ (`user_id = auth.uid()`) หรือ admin; ไม่มี policy ให้ client เขียน
- [ ] ไม่มี policy แบบ `using (true)` สำหรับ write; ไม่มี wildcard grant
- [ ] bucket `product-images`: อ่าน public, เขียน/ลบเฉพาะ admin
- [ ] `is_admin()` เป็น `security definer` และ `set search_path = public`
- [ ] เปลี่ยนรหัสผ่าน DB / rotate service_role key หลังทดสอบเสร็จ ก่อนเปิดจริง
- [ ] เปิด Supabase Auth: email confirmation, refresh-token rotation

## 4. Stripe

- [ ] ระหว่างพัฒนาใช้ TEST mode (`sk_test_` / `pk_test_`) เท่านั้น
- [ ] Webhook handler ตรวจ `stripe-signature` ด้วย `STRIPE_WEBHOOK_SECRET` ก่อนทำงานทุกครั้ง
- [ ] order ถูกตั้งเป็น `paid` จาก event ที่ผ่าน `constructEvent()` แล้วเท่านั้น (ไม่เชื่อ `success_url`)
- [ ] ราคาสินค้าคำนวณฝั่ง server จากตาราง `products` — ไม่รับจำนวนเงินจาก client
- [ ] endpoint `/api/checkout` ใช้ Zod ตรวจ body และ reject product id ที่ไม่รู้จัก
- [ ] ไม่เก็บ / ไม่ log เลขบัตร, CVV, ข้อมูลบัตรใด ๆ (Stripe Checkout รับฝั่ง Stripe)
- [ ] live key อยู่ใน production เท่านั้น (`assertTestModeOutsideProduction()`)

## 5. HTTP / App

- [ ] security headers เปิดใน `next.config.ts` (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`)
- [ ] `poweredByHeader: false`
- [ ] `next/image` `remotePatterns` จำกัดเฉพาะ host ของ Supabase Storage
- [ ] ไม่ส่งข้อมูลส่วนบุคคล / การชำระเงิน / secret ลง log (ดู webhook handler)
- [ ] จำกัดขนาด/ชนิดไฟล์อัปโหลด (`storage.file_size_limit = 5MiB`, `allowed_mime_types`)

## 6. Logging & Privacy

- [ ] error log ไม่มี PII / email / ที่อยู่จัดส่ง / เบอร์โทร / เลข payment intent เต็ม (webhook handler ไม่ log payload)
- [ ] ตั้ง log retention ที่ Vercel (Observability) ตามเหมาะสม
- [ ] ไม่มี table ที่เปิด public โดยไม่จำเป็น

## 7. Dependencies

- [ ] `npm audit --omit=dev --audit-level=high` ผ่าน (อยู่ใน CI)
- [ ] `package-lock.json` ถูก commit; deploy ใช้ `npm ci`
