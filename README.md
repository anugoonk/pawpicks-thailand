# PawPicks Thailand

เว็บไซต์คัดของใช้แมวและ Pet Tech + ร้านค้าออนไลน์ สร้างด้วย **Next.js (App Router, TypeScript, React Server Components)** โดยคงดีไซน์เดิมของ PawPicks Thailand ไว้ทั้งหมด

| ชั้น | เทคโนโลยี |
| --- | --- |
| Frontend / Full-stack | Next.js (stable) · App Router · TypeScript · RSC · Server Actions / Route Handlers · Zod |
| Database / Auth / Storage | Supabase (PostgreSQL + Auth + Storage + RLS) |
| Payment | Stripe Checkout (Card + PromptPay) + Webhook |
| Hosting (Production) | Firebase App Hosting (deploy อัตโนมัติจาก `main`) |
| CI | GitHub Actions (lint / typecheck / test / build / audit) — ไม่ deploy |
| Source control | GitHub **Private** repo · `main` / `develop` / `feature/*` |

> ขอบเขตบริการถูกล็อกไว้ไม่ให้ซ้ำซ้อน: **Firebase = hosting เท่านั้น** (ไม่ใช้ Firestore / Firebase Auth / Firebase Storage), **Supabase = database + auth + storage**, ยังไม่ใช้ Cloudflare ใน Phase 1

---

## เริ่มต้นพัฒนา (Local)

ต้องมี: Node.js ≥ 20.9, npm, (ถ้าจะรัน DB ในเครื่อง) Docker + [Supabase CLI](https://supabase.com/docs/guides/cli)

```bash
npm install
cp .env.example .env.local        # แล้วเติมค่า (Supabase Dev project + Stripe TEST keys)
npm run dev                        # http://localhost:3021
```

ถ้ายังไม่ตั้งค่า Supabase เว็บจะใช้ข้อมูลสำรองใน `lib/data.ts` (สินค้า 4 ชิ้น, แมว 12 ตัว) — หน้าเว็บ render ได้เสมอ

### รัน Supabase ในเครื่อง (ไม่บังคับ)

```bash
npx supabase start                 # ยก Postgres + Studio + Auth ในเครื่อง
npx supabase db reset              # รัน migrations + seed.sql
```

คัดลอกค่า `API URL` / `anon key` / `service_role key` ที่ CLI พิมพ์ออกมา ใส่ใน `.env.local`

### Stripe แบบ Local

```bash
stripe login
stripe listen --forward-to localhost:3021/api/stripe/webhook
# เอา whsec_... ที่ได้ ใส่ STRIPE_WEBHOOK_SECRET ใน .env.local
```

---

## คำสั่งที่ใช้บ่อย

| คำสั่ง | ทำอะไร |
| --- | --- |
| `npm run dev` | dev server |
| `npm run build` | production build (ต้องผ่านก่อน merge เข้า `main`) |
| `npm run lint` | ESLint (`eslint-config-next`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run db:reset` | `supabase db reset` (migrations + seed) |
| `npm run db:diff` | สร้าง migration จากส่วนต่างของ schema |
| `npm run db:push` | push migrations ขึ้น Supabase ที่ link ไว้ |

---

## โครงสร้าง

```
app/
  layout.tsx            html/body + ฟอนต์ (next/font) + metadata
  page.tsx              หน้าแรก (RSC) — โหลดสินค้าแล้ว render sections
  globals.css           CSS เดิม (styles.css + cats.css) — คงไว้ทั้งหมด
  not-found.tsx
  api/
    health/route.ts     health check ให้ Firebase
    checkout/route.ts    สร้าง Stripe Checkout Session (คำนวณราคาฝั่ง server)
    stripe/webhook/route.ts   รับ webhook — ตรวจ signature ก่อนตั้ง order = paid
components/              header, product grid (filter), sections, query-link ...
lib/
  env.ts                อ่าน env ผ่าน Zod (public vs server แยกกัน)
  types.ts              Zod schemas
  data.ts               ข้อมูลสำรอง = ที่มาของ supabase/seed.sql
  products.ts            getProducts() — อ่าน Supabase, fallback เป็น data.ts
  supabase/{client,server,public,admin}.ts
  stripe.ts
supabase/
  config.toml
  migrations/            20260910120000_init.sql, 20260910120100_rls.sql
  seed.sql
apphosting.yaml          Firebase App Hosting build/runtime + secret refs
firebase.json
.github/workflows/ci.yml
legacy-static/            เว็บ static เดิม (เก็บไว้อ้างอิง ไม่ได้ใช้งาน)
```

---

## Environment / Branch / Deploy

- ตัวแปรทั้งหมดดูที่ [`.env.example`](.env.example)
- แยก environment: **local** (`.env.local`, Supabase Dev, Stripe test) · **development** (Supabase Dev, Stripe test) · **production** (Supabase Prod, Stripe live, deploy จาก `main`)
- ขั้นตอน deploy: [`DEPLOYMENT-GUIDE.md`](DEPLOYMENT-GUIDE.md)
- ก่อนขึ้น production: [`PRODUCTION-CHECKLIST.md`](PRODUCTION-CHECKLIST.md) และ [`SECURITY-CHECKLIST.md`](SECURITY-CHECKLIST.md)
- เมื่อ production มีปัญหา: [`ROLLBACK-GUIDE.md`](ROLLBACK-GUIDE.md)

## กฎความปลอดภัยหลัก

- ห้าม commit `.env*` (ยกเว้น `.env.example`), API key, secret — CI จะ fail ถ้าเจอ
- `SUPABASE_SERVICE_ROLE_KEY` และ `STRIPE_SECRET_KEY` ใช้ได้เฉพาะฝั่ง server (ไฟล์ที่ `import "server-only"`)
- order เปลี่ยนเป็น `paid` ได้จาก Stripe webhook ที่ผ่านการตรวจ signature เท่านั้น
- ทุกตารางเปิด RLS; anon key อ่านได้แค่ catalogue และ order ของตัวเอง
