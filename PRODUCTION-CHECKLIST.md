# PRODUCTION CHECKLIST — PawPicks Thailand

ตรวจให้ครบก่อนเปิด PR `develop → main` และก่อน merge (merge = deploy production อัตโนมัติ)

## A. ก่อนเปิด PR เข้า main

- [ ] CI บน `develop` ผ่านทั้งหมด (lint / typecheck / test / build / audit / secret-guard)
- [ ] ทดสอบ UAT บน `develop` แล้ว: หน้าแรก, ค้นหา/กรองสินค้า, ลิงก์แมว→สินค้า, responsive desktop + mobile
- [ ] ดีไซน์ยังตรงกับต้นฉบับ (เทียบกับ `legacy-static/index.html`)
- [ ] `CHANGELOG` / PR description ระบุสิ่งที่เปลี่ยนและผลกระทบ
- [ ] Database migration ใหม่ (ถ้ามี) ทดสอบด้วย `supabase db reset` บน Dev แล้ว และ **backward compatible**

## B. Supabase (Production project)

- [ ] สร้าง Supabase **Production** project แยกจาก Development
- [ ] `supabase link --project-ref <prod-ref>` แล้ว `supabase db push` (หรือ deploy migration ผ่าน CI/manual ที่บันทึกไว้)
- [ ] ตรวจว่า RLS เปิดครบทุกตาราง (รันสคริปต์ตรวจ / ดูใน Studio > Authentication > Policies)
- [ ] seed เฉพาะข้อมูล catalogue (`seed.sql`) — ไม่ seed ข้อมูลทดสอบ order
- [ ] สร้าง bucket `product-images` (public read) และอัปโหลดรูปสินค้าจริง
- [ ] ตั้งบัญชี admin คนแรก: สมัครผ่าน Auth แล้ว `update public.profiles set role='admin' where email='<owner>'`
- [ ] **Auth (magic link):** Studio > Authentication > URL Configuration → Site URL = โดเมนจริง; Redirect URLs allowlist ใส่ `https://<prod-domain>/auth/callback`
- [ ] **Auth email:** ตรวจ email template / rate limit; ถ้าส่งเยอะให้ตั้ง custom SMTP (built-in ของ Supabase จำกัดโควตา)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ของ prod เก็บใน Firebase App Hosting Secret เท่านั้น
- [ ] ตั้ง Supabase usage / spend monitoring + alert

## C. Stripe (Live mode)

- [ ] เปิดใช้ Live mode, ยืนยันตัวตนธุรกิจ, ผูกบัญชีรับเงินไทย
- [ ] เปิด payment methods: Card + PromptPay
- [ ] สร้าง webhook endpoint: `https://<prod-domain>/api/stripe/webhook`
      events: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`
- [ ] เก็บ `STRIPE_SECRET_KEY` (sk_live_…), `STRIPE_WEBHOOK_SECRET` (whsec_… ของ endpoint prod), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_…) เป็น Firebase Secret
- [ ] ยิง test event จาก Stripe Dashboard → ตรวจว่า order ถูกสร้าง/อัปเดตใน Supabase
- [ ] ตั้ง Stripe webhook failure alert

## D. Firebase App Hosting

- [ ] สร้าง backend, เลือก region ใกล้ไทยสุดที่รองรับ (`asia-east1`) — **เปลี่ยนภายหลังไม่ได้**
- [ ] เชื่อม GitHub repo `pawpicks-thailand`, rollout branch = `main`
- [ ] สร้าง secrets ครบ (`firebase apphosting:secrets:set ...`) และ grant ให้ backend
- [ ] `apphosting.yaml`: `NEXT_PUBLIC_SITE_URL` = โดเมนจริง, ค่า public อื่นถูกต้อง
- [ ] deploy ครั้งแรกสำเร็จ, `/api/health` คืน `200`. (ถ้าตั้ง `HEALTH_CHECK_TOKEN` ไว้: `/api/health?token=<token>` ต้องมี `checks.supabaseConfigured / stripeConfigured = true` — ไม่ตั้ง token = health เผยแค่ status)
- [ ] ตั้ง Firebase + Google Cloud **Budget Alert** และตรวจประมาณการค่าใช้จ่าย
- [ ] `minInstances`, `maxInstances`, `concurrency` เหมาะกับงบ

## E. โดเมน & SEO

- [ ] เชื่อม custom domain (เมื่อพร้อม) + HTTPS ทำงาน
- [ ] `NEXT_PUBLIC_SITE_URL` ตรงกับโดเมนจริง (มีผลกับ metadata / OG / Stripe redirect / robots+sitemap — ทั้งคู่ gen ตอน build)
- [x] `robots.txt` / `sitemap.xml` — มีแล้ว (`app/robots.ts`, `app/sitemap.ts`); ตรวจว่า `/robots.txt` ชี้โดเมนจริงหลัง deploy

## F. หลัง Deploy (smoke test บน production)

- [ ] หน้าแรกโหลด, ฟอนต์ Anuphan / DM Sans แสดงครบ
- [ ] ค้นหาสินค้า + ลิงก์หมวด/แมว ทำงาน
- [ ] `/api/health` = 200
- [ ] สร้าง Checkout Session ได้ (`POST /api/checkout`); ยิงซ้ำเกิน 10 ครั้ง/นาที ต่อ IP ต้องได้ `429`
- [ ] จ่ายเงินจริงจำนวนน้อย (หรือ Stripe test clock) → webhook ตั้ง order = `paid`, มีแถวใน `order_items`, redirect ไป `/checkout/success` (ไม่ 404)
- [ ] PromptPay: จ่ายแล้วทิ้ง → order = `pending` (ไม่ใช่ `paid`); จ่ายจริง → `async_payment_succeeded` เปลี่ยนเป็น `paid`
- [ ] ตรวจ log ไม่มี secret / PII
- [ ] เตรียมพร้อม `ROLLBACK-GUIDE.md` — รู้ว่า rollout ก่อนหน้าคือ commit ไหน
