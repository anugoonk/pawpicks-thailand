# PawPicks Thailand — Claude Code Handoff

โปรเจกต์นี้เป็นเว็บไซต์ Static HTML/CSS/JavaScript พร้อมแก้ไขต่อได้ทันที

## ไฟล์หลัก

- `index.html` — โครงสร้างและข้อความของหน้าเว็บ
- `styles.css` — ธีมและ Layout หลัก
- `cats.css` — ส่วนรูปแมว หมวดสินค้า และทีมแมว
- `app.js` — เมนู ค้นหา และ Interaction
- `assets/` — รูปภาพทั้งหมด

## เปิดดูบนเครื่อง

เปิด Terminal ในโฟลเดอร์นี้ แล้วรัน:

```powershell
python -m http.server 8000
```

จากนั้นเปิด `http://localhost:8000`

หากเครื่องไม่มี Python สามารถใช้ส่วนเสริม Live Server ของ VS Code เปิด `index.html` ได้

## เริ่มทำงานด้วย Claude Code

```powershell
cd D:\Claude\PawPicksThailand
claude
```

Prompt แนะนำ:

```text
ช่วยตรวจสอบโปรเจกต์ PawPicks Thailand นี้ก่อนแก้ไข
ไฟล์หลักคือ index.html, styles.css, cats.css และ app.js
ให้รักษาโครงสร้าง เนื้อหาภาษาไทย สีหลัก และแมวทั้ง 12 ตัวไว้
ก่อนแก้ทุกครั้งให้สรุปไฟล์ที่จะเปลี่ยน และหลังแก้ให้เปิด Preview ตรวจสอบทั้ง Desktop และ Mobile
```

## หมายเหตุ

เว็บไซต์ต้นฉบับใช้ฟอนต์ Google Fonts ดังนั้นตอน Preview ต้องเชื่อมต่ออินเทอร์เน็ตเพื่อให้ฟอนต์แสดงครบ
