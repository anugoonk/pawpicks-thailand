# ROLLBACK GUIDE — PawPicks Thailand

เป้าหมาย: กลับสู่เวอร์ชันก่อนหน้าที่ใช้งานได้ ให้เร็วที่สุด แล้วค่อยหาสาเหตุ

## 0. ตัดสินใจเร็ว ๆ

| อาการ | ทำอะไรก่อน |
| --- | --- |
| หน้าเว็บ down / error ทั้งเว็บ หลัง rollout | **App Hosting rollback** (ข้อ 1) |
| จ่ายเงินไม่ได้ / webhook พัง | ตรวจ Stripe + secret (ข้อ 3) ก่อน ถ้าไม่หายค่อย rollback |
| ข้อมูลผิดจาก migration | ระวัง — ดูข้อ 2 (อย่ารีบ rollback schema) |
| ค่าใช้จ่ายพุ่ง | ลด `maxInstances` ใน `apphosting.yaml` / ปิด backend ชั่วคราว |

บันทึกเวลาเริ่ม incident และคนที่ตัดสินใจไว้เสมอ

---

## 1. Rollback Firebase App Hosting (เร็วสุด ไม่แตะ schema)

### วิธี A — Console
1. Firebase Console > App Hosting > เลือก backend > **Rollouts**
2. หา rollout ล่าสุดที่สถานะ **Live** และรู้ว่าดี
3. เมนู ⋮ ของ rollout นั้น > **Roll back** (หรือ "Redeploy") → ยืนยัน
4. รอสถานะเป็น Live แล้วเช็ก `/api/health`

### วิธี B — ผ่าน git (ให้ `main` ชี้ commit ดีตัวเดิม)
```bash
git switch main
git pull origin main
git revert --no-edit <bad_merge_commit>      # แนะนำ: revert เพื่อคงประวัติ
# หรือกรณีจำเป็นจริง ๆ:  git reset --hard <good_commit> && git push --force-with-lease origin main
git push origin main
```
การ push `main` จะ trigger rollout ใหม่อัตโนมัติจากโค้ดที่ดี

> จด commit hash ของ production ที่ "ดี" ไว้ทุกครั้งหลัง deploy (ดู `PRODUCTION-CHECKLIST.md` ข้อ F)

---

## 2. Rollback Database (Supabase) — ระมัดระวัง

Schema rollback เสี่ยงข้อมูลหาย ทำเฉพาะเมื่อจำเป็น และควรมีขั้น "contract" แยก

- **ถ้า migration ใหม่แค่ *เพิ่ม* คอลัมน์/ตาราง (backward compatible):** ไม่ต้อง rollback schema — แค่ rollback โค้ด (ข้อ 1) พอ
- **ถ้า migration ใหม่ทำลาย/เปลี่ยนคอลัมน์:**
  1. หยุด traffic ที่เขียน DB ถ้าทำได้ (ปิด checkout ชั่วคราว)
  2. กู้จาก backup: Supabase Dashboard > Database > Backups > Point-in-time / daily → restore ไปเวลา ก่อน migration
     - PITR ใช้ได้เมื่อเปิดไว้ (แผน Pro); ไม่งั้นใช้ daily backup ล่าสุด
  3. เขียน migration ใหม่แบบ "down" ที่ปลอดภัย (`supabase migration new revert_xxx`) แล้ว push
  4. ตรวจ `orders` / `order_items` ว่าครบ — ห้ามทำ order ที่จ่ายเงินแล้วหาย
- บันทึก: restore ไปเวลาไหน, ข้อมูลช่วงไหนอาจหาย, ต้อง reconcile กับ Stripe อย่างไร

### Reconcile กับ Stripe หลังกู้ DB
- ดู payments ใน Stripe Dashboard ช่วงเวลาที่กระทบ
- สำหรับ `checkout.session.completed` ที่ order หายไป: resend event จาก Stripe (Developers > Events > Resend) → webhook จะ upsert order กลับ (idempotent ด้วย `stripe_session_id`)

---

## 3. Stripe / Secret ผิด (ไม่ต้อง rollback โค้ด)

- `/api/health` แสดง `stripeConfigured=false` → secret ไม่ถูก mount: ตรวจ `firebase apphosting:secrets:...` และ grant ให้ backend แล้ว redeploy
- webhook 400 `invalid_signature` → `STRIPE_WEBHOOK_SECRET` ไม่ตรงกับ endpoint prod: ตั้งใหม่จาก Stripe > Webhooks > endpoint > Signing secret
- webhook ไม่ถูกเรียก → ตรวจ URL endpoint, event types, และ Stripe > Webhooks > attempts/logs
- คีย์รั่ว → **roll คีย์ทันที** ที่ Stripe/Supabase, อัปเดต secret, redeploy, แล้วตรวจ log การใช้งานย้อนหลัง

---

## 4. หลัง Rollback

- [ ] `/api/health` = 200 และ checks ผ่าน
- [ ] ทดสอบ: หน้าแรก, ค้นหา, checkout, webhook → order `paid`
- [ ] `main` ชี้ commit ที่ดี และ CI เขียว
- [ ] เปิด issue / incident note: timeline, สาเหตุ, การแก้, งานติดตาม
- [ ] แก้จริงบน `fix/*` → PR เข้า `develop` → ตามรอบปกติกลับขึ้น `main`
- [ ] ถ้า revert ไว้ ให้ตามด้วยการ re-apply ที่แก้แล้ว อย่าปล่อยค้าง
