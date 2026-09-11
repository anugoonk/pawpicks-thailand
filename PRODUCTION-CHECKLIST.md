# PRODUCTION CHECKLIST — PawPicks Thailand

ตรวจให้ครบก่อนเปิด PR `develop → main` และก่อน merge (merge = deploy production อัตโนมัติ)

## A. ก่อนเปิด PR เข้า main

- [ ] CI บน `develop` ผ่านทั้งหมด (lint / typecheck / test / build / audit / secret-guard)
- [ ] ทดสอบ UAT บน `develop` แล้ว: หน้าแรก, ค้นหา/กรองสินค้า, ลิงก์แมว→สินค้า, responsive desktop + mobile
- [ ] ดีไซน์ยังตรงกับต้นฉบับ (เทียบกับ `legacy-static/index.html`)
- [ ] `CHANGELOG` / PR description ระบุสิ่งที่เปลี่ยนและผลกระทบ
- [ ] Database migration ใหม่ (ถ้ามี) ทดสอบด้วย `supabase db reset` บน Dev แล้ว และ **backward compatible**

## B. Supabase (Production project)

- [x] สร้าง Supabase **Production** project แยกจาก Development — `anqnryqdpcnlixjxobfq` (2026-09-11)
- [x] `supabase link --project-ref <prod-ref>` แล้ว `supabase db push` — 4/4 migrations synced (`supabase migration list --linked`), ล่าสุดรวม security-hardening migration จาก `db advisors`
- [x] ตรวจว่า RLS เปิดครบทุกตาราง — ผ่าน `supabase db advisors --type security`; เหลือแค่ warning ที่ยอมรับได้ 1 จุด (`is_admin()` ต้องเรียกได้โดย anon/authenticated เพราะ RLS ใช้งาน — ดู comment ใน `20260911000001_*.sql`)
- [x] seed เฉพาะข้อมูล catalogue (`seed.sql`) — รันแล้ว: 12 cats / 4 collections / 4 products
- [x] สร้าง bucket `product-images` (public read) — สร้างแล้ว; **ยังต้องอัปโหลดรูปสินค้าจริง** (ต้องมีไฟล์รูปจากคุณ)
- [ ] ตั้งบัญชี admin คนแรก: สมัครผ่าน Auth แล้ว `update public.profiles set role='admin' where email='<owner>'` — รอ deploy เสร็จ (ต้องมีเว็บให้สมัครก่อน)
- [ ] **Auth (magic link):** Studio > Authentication > URL Configuration → Site URL = โดเมนจริง; Redirect URLs allowlist ใส่ `https://<prod-domain>/auth/callback` — รอโดเมนจริงจาก Vercel (ตอนนี้ `supabase/config.toml` ยังชี้ localhost ตั้งใจไม่ push ทับจนกว่าจะมีโดเมน)
- [ ] **Auth email:** ตรวจ email template / rate limit; ถ้าส่งเยอะให้ตั้ง custom SMTP (built-in ของ Supabase จำกัดโควตา)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ของ prod เก็บใน Vercel Environment Variable (Production scope) เท่านั้น
- [ ] ตั้ง Supabase usage / spend monitoring + alert

## C. Stripe (Live mode)

- [ ] เปิดใช้ Live mode, ยืนยันตัวตนธุรกิจ, ผูกบัญชีรับเงินไทย
- [ ] เปิด payment methods: Card + PromptPay
- [ ] สร้าง webhook endpoint: `https://<prod-domain>/api/stripe/webhook`
      events: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`
- [ ] เก็บ `STRIPE_SECRET_KEY` (sk_live_…), `STRIPE_WEBHOOK_SECRET` (whsec_… ของ endpoint prod), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_…) เป็น Vercel Environment Variable (Production scope)
- [ ] ยิง test event จาก Stripe Dashboard → ตรวจว่า order ถูกสร้าง/อัปเดตใน Supabase
- [ ] ตั้ง Stripe webhook failure alert

## D. Vercel

- [x] Import repo `pawpicks-thailand` เข้า Vercel — `vercel link` เชื่อม GitHub อัตโนมัติ, project `anugoonk-s-projects/pawpicks-thailand` (2026-09-11)
- [x] ตั้ง Environment Variables (Production): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (legacy JWT anon key — ไม่ใช่ `sb_publishable_...`), `SUPABASE_SERVICE_ROLE_KEY` (legacy JWT — Secret type), `NEXT_PUBLIC_SITE_URL`
- [ ] ยังไม่ตั้ง: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (รอทำขั้น C ก่อน), `ADMIN_EMAIL` (ต้องตัดสินใจว่าใช้อีเมลไหน), `HEALTH_CHECK_TOKEN` (ถ้าจะใช้)
- [ ] `NEXT_PUBLIC_*` ใส่ใน **Preview** scope ด้วย (ค่า Supabase Dev — ยังไม่มีโปรเจกต์ Dev แยก ใช้ prod ไปก่อนได้ถ้ายอมรับความเสี่ยง)
- [x] deploy ครั้งแรกสำเร็จ, `/api/health` คืน `200` — https://pawpicks-thailand.vercel.app (2026-09-11)
- [ ] ตั้ง spend notification ที่ Vercel > Settings > Billing และตรวจประมาณการค่าใช้จ่าย

## E. โดเมน & SEO

- [ ] เชื่อม custom domain (เมื่อพร้อม) + HTTPS ทำงาน — ตอนนี้ใช้ `pawpicks-thailand.vercel.app` (HTTPS โดย default)
- [x] `NEXT_PUBLIC_SITE_URL` ตรงกับโดเมนจริง — ตั้งเป็น `https://pawpicks-thailand.vercel.app` แล้ว (ต้องเปลี่ยนอีกทีถ้าต่อ custom domain ทีหลัง)
- [x] `robots.txt` / `sitemap.xml` — ยืนยันแล้วว่าชี้โดเมนจริงบน production

## F. หลัง Deploy (smoke test บน production)

- [ ] หน้าแรกโหลด, ฟอนต์ Anuphan / DM Sans แสดงครบ
- [ ] ค้นหาสินค้า + ลิงก์หมวด/แมว ทำงาน
- [ ] `/api/health` = 200
- [ ] สร้าง Checkout Session ได้ (`POST /api/checkout`); ยิงซ้ำเกิน 10 ครั้ง/นาที ต่อ IP ต้องได้ `429`
- [ ] จ่ายเงินจริงจำนวนน้อย (หรือ Stripe test clock) → webhook ตั้ง order = `paid`, มีแถวใน `order_items`, redirect ไป `/checkout/success` (ไม่ 404)
- [ ] PromptPay: จ่ายแล้วทิ้ง → order = `pending` (ไม่ใช่ `paid`); จ่ายจริง → `async_payment_succeeded` เปลี่ยนเป็น `paid`
- [ ] ตรวจ log ไม่มี secret / PII
- [ ] เตรียมพร้อม `ROLLBACK-GUIDE.md` — รู้ว่า deployment ก่อนหน้าที่ดีคือ commit/deployment ไหน
