# DEPLOYMENT GUIDE — PawPicks Thailand

## ภาพรวม

```
feature/* ──PR──▶ develop ──(UAT)──PR──▶ main ──▶ Firebase App Hosting (auto rollout)
     │              │                      │
   CI (PR)      CI (push)             Production Checklist
```

- **CI ไม่ deploy** — ทำแค่ lint / typecheck / test / build / audit / ตรวจ secret
- **Production deploy** เกิดอัตโนมัติเมื่อ merge เข้า `main` เท่านั้น (Firebase App Hosting ฟัง branch `main`)
- ห้าม deploy production จากเครื่อง dev ตรง ๆ ยกเว้นเหตุฉุกเฉินที่บันทึกเหตุผลไว้

Branch: `main` = production · `develop` = integration · `feature/*` งานฟีเจอร์ · `fix/*` แก้บั๊ก · `hotfix/*` แก้ production ด่วน

---

## ครั้งแรกสุด (One-time setup — งานเจ้าของระบบ)

### 1. GitHub

```bash
# ในโฟลเดอร์โปรเจกต์ (git init + commit ทำไว้แล้ว)
gh repo create pawpicks-thailand --private --source . --remote origin --push   # หรือสร้างผ่านเว็บ
git push -u origin main
git push -u origin develop
```

ตั้งค่า repo:
- Settings > Branches > protect `main` และ `develop`: require PR, require CI "verify" ให้ผ่าน
- Settings > Code security: เปิด secret scanning + push protection
- Settings > Secrets and variables > Actions: (ถ้ามี integration test ที่ต้องใช้) เพิ่ม secret — ปัจจุบัน CI ไม่ต้องใช้ secret ใด

### 2. Supabase

- สร้าง 2 projects: `pawpicks-dev`, `pawpicks-prod` (เลือก region Southeast Asia / Singapore)
- แต่ละ project:
  ```bash
  npx supabase link --project-ref <ref>
  npx supabase db push          # ใช้ migrations ใน supabase/migrations
  # seed catalogue:
  psql "<connection-string>" -f supabase/seed.sql
  ```
- สร้าง bucket `product-images` (public) — หรือปล่อยให้ config.toml สร้างตอน local
- Auth > URL configuration: ใส่ Site URL ของแต่ละ environment

### 3. Stripe

- Dev/Local: ใช้ TEST mode keys
- Prod: เปิด Live mode, เพิ่ม webhook endpoint `https://<domain>/api/stripe/webhook`
  (events: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`)

### 4. Firebase App Hosting

```bash
npm i -g firebase-tools
firebase login
firebase use --add                # เลือก/สร้าง project -> เขียน .firebaserc (git-ignored)
```

ใน Firebase Console > App Hosting:
- Create backend > เลือก region ใกล้ไทยสุดที่รองรับ (`asia-east1`)
- Connect GitHub repo `pawpicks-thailand`, live branch = `main`, root = `/`
- สร้าง secrets:
  ```bash
  firebase apphosting:secrets:set SUPABASE_SERVICE_ROLE_KEY
  firebase apphosting:secrets:set STRIPE_SECRET_KEY
  firebase apphosting:secrets:set STRIPE_WEBHOOK_SECRET
  firebase apphosting:secrets:set NEXT_PUBLIC_SUPABASE_ANON_KEY
  firebase apphosting:secrets:set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ```
  แล้ว grant ให้ backend เมื่อถูกถาม
- แก้ค่า non-secret ใน `apphosting.yaml` (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `ADMIN_EMAIL`, ฯลฯ) แล้ว commit
- ตั้ง Budget Alert ที่ Firebase + Google Cloud Billing

---

## Deploy Development

1. แตกงาน: `git switch -c feature/<ชื่อ>` จาก `develop`
2. พัฒนา + `npm run lint && npm run typecheck && npm test && npm run build` ให้ผ่านในเครื่อง
3. `git push -u origin feature/<ชื่อ>` แล้วเปิด PR เข้า `develop`
4. รอ GitHub Actions "verify" ผ่าน + review
5. Merge เข้า `develop` (squash) → ทดสอบ UAT

> ต้องการ preview จริง: สร้าง backend/branch เพิ่มใน App Hosting ที่ฟัง `develop` (ไม่บังคับ Phase 1) หรือรัน `npm run build && npm start` ในเครื่อง

---

## Deploy Production

1. เปิด PR `develop → main`
2. ทำ `PRODUCTION-CHECKLIST.md` ให้ครบ
3. CI ผ่าน + อนุมัติ PR
4. **Merge เข้า `main`**
5. Firebase App Hosting สร้าง rollout อัตโนมัติ (ดูสถานะใน Console > App Hosting > Rollouts)
6. เมื่อ rollout = Live:
   - เปิด `https://<domain>/api/health` → ต้อง `200`, `checks.*Configured = true`
   - ทดสอบ: หน้าแรก, ค้นหา, `POST /api/checkout`, จ่ายเงินทดสอบ → order `paid`
7. พบปัญหา → ทำตาม `ROLLBACK-GUIDE.md`

### Migration ตอน deploy production

- Migration ต้อง backward compatible (deploy โค้ดใหม่ + schema เก่ายังทำงาน)
- รัน `supabase db push` ชี้ prod **ก่อน** merge โค้ดที่ต้องใช้ schema ใหม่ (หรือทำเป็นขั้น expand → migrate → contract)
- บันทึกเวลาและ migration id ที่รันไว้

---

## Emergency deploy (hotfix)

1. `git switch -c hotfix/<ชื่อ>` จาก `main`
2. แก้ให้เล็กที่สุด + build ผ่าน
3. PR เข้า `main` (fast-track review) → merge → auto rollout
4. Cherry-pick / merge `main` กลับเข้า `develop`
5. บันทึกใน incident log: อะไรเสีย, แก้อะไร, ใครอนุมัติ, เวลา
