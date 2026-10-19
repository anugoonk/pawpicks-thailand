# ตั้งโดเมนของตัวเอง + Google Search Console

เอกสารนี้เขียนจากโค้ดและ config ปัจจุบัน (ตรวจเมื่อ 2026-10-19) ผู้ที่ต้องทำเองคือเจ้าของ เพราะเกี่ยวกับการจ่ายเงินและการยืนยันความเป็นเจ้าของ

## สถานะที่ตรวจแล้ว

- `sitemap.xml` ถูกต้อง: 33 URL (หน้าแรก, top-10, สินค้า 4, หมวด 5, ทีมแมว 12, หน้านโยบาย 7) ไม่มีหน้าว่างหรือหน้า noindex หลุดเข้ามา
- `robots.txt` ปิด `/api/`, `/checkout/`, `/account`, `/admin/` ถูกต้อง และชี้ไปที่ sitemap
- โดเมนของเว็บอ่านจาก env ตัวเดียวคือ `NEXT_PUBLIC_SITE_URL` (sitemap, robots, canonical, JSON-LD และ OG ใช้ค่านี้หมด) จึงเปลี่ยนโดเมนได้โดยไม่ต้องแก้โค้ด
- `NEXT_PUBLIC_*` ถูกฝังตอน build เพราะฉะนั้นเปลี่ยนค่าแล้วต้อง redeploy

## ส่วน A: Google Search Console (ทำได้ทันที ฟรี)

แนะนำให้ทำ**หลัง**ย้ายโดเมนเสร็จ (ส่วน B) เพื่อไม่ต้องยืนยันสองรอบ แต่ถ้าจะเริ่มก่อนก็ได้ ให้เลือก property แบบ URL prefix

**กรณีเริ่มก่อนย้ายโดเมน (URL prefix)**
1. เข้า https://search.google.com/search-console แล้วล็อกอิน Google
2. เลือก "URL prefix" ใส่ `https://pawpicks-thailand.vercel.app/`
3. เลือกวิธียืนยันแบบ HTML tag แล้วคัดลอกค่า `content` ของ meta tag ส่งให้ผม ผมจะเพิ่มผ่าน `metadata.verification.google` ใน `app/layout.tsx` (หรือแบบ HTML file ที่วางใน `public/`)
4. หลัง deploy กด Verify
5. ที่เมนู Sitemaps ใส่ `sitemap.xml` แล้วกด Submit
6. ที่ URL Inspection ใส่หน้าแรกแล้วกด "Request indexing" (ทำได้วันละไม่กี่หน้า)

**กรณีทำหลังย้ายโดเมน (แนะนำ)**
1. เลือก property แบบ "Domain" ใส่โดเมนที่ซื้อ เช่น `example.com`
2. Google ให้ค่า TXT record ไปเพิ่มที่ DNS ของผู้ให้บริการโดเมน แล้วกด Verify (วิธีนี้ครอบคลุมทุก subdomain และ http/https และไม่ต้องแก้โค้ด)
3. ส่ง `sitemap.xml` เหมือนด้านบน

**หลังยืนยันแล้ว ให้ดู**
- Pages > Indexing: หน้าไหนถูกจัดทำดัชนี หน้าไหนถูกตัดออกเพราะอะไร
- Performance: คำค้นและจำนวนคลิก (ข้อมูลเริ่มขึ้นหลัง 2 ถึง 3 วัน)
- Enhancements: ตรวจ Breadcrumbs และ Product ว่าไม่มี error
- ข้อมูลต้องใช้เวลา 1 ถึง 4 สัปดาห์กว่าจะเริ่มเห็นผลจริง เป็นเรื่องปกติ

## ส่วน B: ย้ายไปโดเมนของตัวเอง

**ก่อนซื้อ**
- เลือกชื่อให้ตรงแบรนด์ เช่น `.com` หรือ `.co.th` (`.co.th` ต้องมีเอกสารนิติบุคคล ถ้าเป็นบุคคลธรรมดาให้ใช้ `.com` หรือ `.in.th`)
- ซื้อจากผู้ให้บริการที่ให้จัดการ DNS record ได้เอง (เช่น Cloudflare Registrar, Namecheap, GoDaddy, หรือเจ้าไทยอย่าง Hostatom) และเปิด auto-renew กับ WHOIS privacy
- ตัดสินใจก่อนว่าจะใช้ apex (`example.com`) หรือ `www.example.com` เป็นโดเมนหลัก แนะนำ apex เป็นหลักแล้วให้ `www` redirect มา

**ขั้นตอน**
1. **เพิ่มโดเมนใน Vercel**: Project `pawpicks-thailand` > Settings > Domains > Add ใส่โดเมนหลัก แล้วเพิ่ม `www` อีกตัว Vercel จะบอกค่า DNS ที่ต้องตั้ง
2. **ตั้ง DNS ที่ผู้ให้บริการโดเมน** ตามที่ Vercel แสดง (ปกติ apex เป็น A record ชี้ `76.76.21.21` และ `www` เป็น CNAME ชี้ `cname.vercel-dns.com` ให้ยึดค่าที่หน้า Vercel แสดงเป็นหลักเพราะอาจเปลี่ยน) รอจนสถานะเป็น Valid Configuration (ปกติไม่เกินหลักนาที ถึงไม่กี่ชั่วโมง)
3. **ตั้งโดเมนหลัก (Primary)** ใน Vercel ให้โดเมนใหม่เป็นหลัก และให้ `www` กับ `pawpicks-thailand.vercel.app` redirect 301 มาที่โดเมนหลัก
4. **อัปเดต env**: เปลี่ยน `NEXT_PUBLIC_SITE_URL` (Production) เป็น `https://<โดเมนใหม่>` (ไม่มี `/` ท้าย) แล้ว **redeploy** ด้วย `npx vercel env rm NEXT_PUBLIC_SITE_URL production` + `npx vercel env add NEXT_PUBLIC_SITE_URL production --value "https://<โดเมนใหม่>" --yes` (ใช้ `--type config` ตามที่เคยทำไว้) แล้ว `npx vercel deploy --prod` หรือ push ขึ้น `main`
5. **ตรวจหลัง deploy** (ผมช่วยรันให้ได้): canonical, `sitemap.xml`, `robots.txt` (บรรทัด `Host:` และ `Sitemap:`), OG และ JSON-LD ต้องเป็นโดเมนใหม่ทั้งหมด และ `https://pawpicks-thailand.vercel.app/` ต้อง redirect มาโดเมนใหม่
6. **Supabase Auth** (เฉพาะถ้าจะเปิดระบบล็อกอินใช้งานอีก): Authentication > URL Configuration เปลี่ยน Site URL และ Redirect URLs เป็นโดเมนใหม่ (`https://<โดเมนใหม่>/auth/callback`) ตอนนี้ส่วนล็อกอินถูกซ่อนจากหน้าเว็บอยู่
7. **Stripe webhook** (เฉพาะถ้าจะเปิดร้านจริงอีก): เปลี่ยน endpoint เป็น `https://<โดเมนใหม่>/api/stripe/webhook` ตอนนี้ยังไม่ได้ใช้
8. **Search Console**: ถ้าเริ่มไว้ก่อนแล้ว ให้เพิ่ม property ใหม่ของโดเมนใหม่ (แนะนำแบบ Domain) แล้วส่ง sitemap ใหม่ (ถ้าต้องการใช้เครื่องมือ Change of Address ของ Google ให้ตรวจเงื่อนไขล่าสุดในหน้าช่วยเหลือของ Search Console ก่อน)
9. **อัปเดตลิงก์ภายนอก**: โปรไฟล์โซเชียล, LINE OA และข้อมูลใน Shopee Affiliate ถ้ามีการระบุเว็บไว้

**ข้อควรระวัง**
- อย่าลบโดเมน `vercel.app` ทิ้ง ปล่อยให้ redirect 301 ไว้ถาวร เพื่อไม่ให้ลิงก์เก่าและอันดับที่สะสมไว้หาย
- ทำย้ายโดเมนก่อนเว็บมีทราฟฟิกและลิงก์ย้อนกลับมากๆ ยิ่งเร็วยิ่งเสียน้อย
- ย้ายแล้วอย่าเปลี่ยนโครงสร้าง URL พร้อมกัน เพื่อให้ตรวจปัญหาได้ง่าย
- ถ้าทำ redirect ผิดจนเว็บเข้าไม่ได้ ให้ย้อน `NEXT_PUBLIC_SITE_URL` กลับเป็นค่าเดิมแล้ว redeploy (ดู `ROLLBACK-GUIDE.md`)

## สิ่งที่ผมช่วยทำให้ได้เมื่อเจ้าของพร้อม

- เพิ่ม meta verification tag ลง `app/layout.tsx` เมื่อได้ค่ามา
- รัน env และ deploy ตามขั้นตอน B4 (ต้องให้เจ้าของยืนยัน เพราะแตะ production)
- รัน audit หลังย้ายว่า canonical, sitemap, robots, redirect เป็นโดเมนใหม่ครบ
