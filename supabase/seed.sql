-- PawPicks Thailand — seed data
-- Mirrors lib/data.ts. Safe to re-run: every statement upserts.
-- Loaded automatically by `supabase db reset` and `supabase start`.

-- ---------------------------------------------------------------------------
-- cats  (mascot team of 12)
-- ---------------------------------------------------------------------------
insert into public.cats (id, name, image, aria_label, query, sort_order) values
  ('cat-1',  'แมวสีเทา',          '/assets/cat-1.png',  'แมวสีเทา พาชมสินค้า',          'pet tech', 1),
  ('cat-2',  'แมวขาวตาสองสี',     '/assets/cat-2.png',  'แมวขาวตาสองสี พาชมสินค้า',     'น้ำพุ',    2),
  ('cat-3',  'แมวดำ',             '/assets/cat-3.png',  'แมวดำ พาชมสินค้า',             'กล้อง',    3),
  ('cat-4',  'แมวส้มลายเสือ',      '/assets/cat-4.png',  'แมวส้มลายเสือ พาชมสินค้า',      'อาหาร',    4),
  ('cat-5',  'แมวสามสี',          '/assets/cat-5.png',  'แมวสามสี พาชมสินค้า',           'ลับเล็บ',  5),
  ('cat-6',  'แมวขาวดำ',          '/assets/cat-6.png',  'แมวขาวดำ พาชมสินค้า',           'กล้อง',    6),
  ('cat-7',  'แมวซิลเวอร์แท็บบี้', '/assets/cat-7.png',  'แมวซิลเวอร์แท็บบี้ พาชมสินค้า',  'ลับเล็บ',  7),
  ('cat-8',  'แมวส้มขาว',         '/assets/cat-8.png',  'แมวส้มขาว พาชมสินค้า',          'อาหาร',    8),
  ('cat-9',  'แมวสีน้ำตาล',       '/assets/cat-9.png',  'แมวสีน้ำตาล พาชมสินค้า',        '',         9),
  ('cat-10', 'แมวแท็บบี้สีน้ำตาล', '/assets/cat-10.png', 'แมวแท็บบี้สีน้ำตาล พาชมสินค้า', 'ลับเล็บ', 10),
  ('cat-11', 'แมวสีครีมส้ม',      '/assets/cat-11.png', 'แมวสีครีมส้ม พาชมสินค้า',       'น้ำพุ',   11),
  ('cat-12', 'แมวแต้มเข้มตาฟ้า',   '/assets/cat-12.png', 'แมวแต้มเข้มตาฟ้า พาชมสินค้า',   'pet tech', 12)
on conflict (id) do update set
  name = excluded.name, image = excluded.image, aria_label = excluded.aria_label,
  query = excluded.query, sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- collections  (4, display order fixed — CSS ::before styles by nth-child)
-- ---------------------------------------------------------------------------
insert into public.collections (id, title, blurb, query, cat_images, sort_order) values
  ('pet-tech', 'Pet Tech', 'ให้อาหาร ดูแล และเฝ้าดูจากมือถือ', 'pet tech',
   '[{"src":"/assets/cat-1-collection.webp","alt":"แมวสีเทา"},{"src":"/assets/cat-12-collection.webp","alt":"แมวแต้มเข้มตาฟ้า"}]'::jsonb, 1),
  ('food-water', 'กินดีตรงเวลา', 'อุปกรณ์สำหรับมื้ออาหารและน้ำดื่ม', 'อาหาร',
   '[{"src":"/assets/cat-8-collection.webp","alt":"แมวส้มขาว"},{"src":"/assets/cat-11-collection.webp","alt":"แมวสีครีมส้ม"}]'::jsonb, 2),
  ('play-time', 'เล่นเพลิน', 'ของเล่นและที่ลับเล็บแก้เบื่อ', 'ลับเล็บ',
   '[{"src":"/assets/cat-5-collection.webp","alt":"แมวสามสี"},{"src":"/assets/cat-7-collection.webp","alt":"แมวซิลเวอร์แท็บบี้"}]'::jsonb, 3),
  ('safe-home', 'บ้านอุ่นใจ', 'อุปกรณ์ช่วยดูแลเมื่อต้องออกจากบ้าน', 'กล้อง',
   '[{"src":"/assets/cat-6-collection.webp","alt":"แมวขาวดำ"},{"src":"/assets/cat-9-collection.webp","alt":"แมวสีน้ำตาล"}]'::jsonb, 4)
on conflict (id) do update set
  title = excluded.title, blurb = excluded.blurb, query = excluded.query,
  cat_images = excluded.cat_images, sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- products  (4 curated picks)
-- ---------------------------------------------------------------------------
insert into public.products (
  id, slug, name, category, description, price_thb, image, image_crop,
  badge, badge_dark, companion_cat_id, companion_label, companion_image,
  companion_alt, shopee_url, search_keywords, active, sort_order
) values
  ('auto-water-fountain', 'auto-water-fountain', 'น้ำพุแมวอัตโนมัติ', 'Pet Tech',
   'ช่วยให้น้ำไหลเวียน เหมาะกับบ้านที่อยากดูแลเรื่องการดื่มน้ำ', 890,
   '/assets/pawpicks-hero.png', 'crop-fountain', 'แมวควรมี', false,
   'cat-2', 'เพื่อนมุมน้ำดื่ม', '/assets/cat-2.png', 'แมวขาวตาสองสี',
   'https://shopee.co.th/search?keyword=%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%9E%E0%B8%B8%E0%B9%81%E0%B8%A1%E0%B8%A7',
   'น้ำพุแมว เครื่องให้น้ำ pet tech', true, 1),

  ('auto-feeder', 'auto-feeder', 'เครื่องให้อาหารอัตโนมัติ', 'Pet Tech',
   'ตั้งเวลาอาหารได้ ช่วยให้มื้อของเจ้าเหมียวตรงเวลาแม้วันที่ยุ่ง', 1290,
   '/assets/pawpicks-hero.png', 'crop-feeder', 'ยอดนิยม', false,
   'cat-4', 'เพื่อนมื้ออร่อย', '/assets/cat-4.png', 'แมวส้มลายเสือ',
   'https://shopee.co.th/search?keyword=%E0%B9%80%E0%B8%84%E0%B8%A3%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B9%83%E0%B8%AB%E0%B9%89%E0%B8%AD%E0%B8%B2%E0%B8%AB%E0%B8%B2%E0%B8%A3%E0%B9%81%E0%B8%A1%E0%B8%A7%E0%B8%AD%E0%B8%B1%E0%B8%95%E0%B9%82%E0%B8%99%E0%B8%A1%E0%B8%B1%E0%B8%95%E0%B8%B4',
   'เครื่องให้อาหารแมว อัตโนมัติ pet tech', true, 2),

  ('wifi-pet-camera', 'wifi-pet-camera', 'กล้องดูแมวผ่านมือถือ', 'Smart Home',
   'เช็กเจ้าเหมียวได้จากนอกบ้าน พร้อมเลือกรุ่นที่เหมาะกับพื้นที่จริง', 1590,
   '/assets/pawpicks-hero.png', 'crop-camera', 'สาย IT เลือก', true,
   'cat-3', 'เพื่อนเฝ้าบ้าน', '/assets/cat-3.png', 'แมวดำ',
   'https://shopee.co.th/search?keyword=%E0%B8%81%E0%B8%A5%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%94%E0%B8%B9%E0%B9%81%E0%B8%A1%E0%B8%A7',
   'กล้องดูแมว กล้อง pet camera wifi', true, 3),

  ('ramp-scratcher', 'ramp-scratcher', 'ที่ลับเล็บแบบทางลาด', 'Cat Essentials',
   'มุมลับเล็บกำลังดี ช่วยดึงความสนใจออกจากโซฟาตัวโปรดของเรา', 490,
   '/assets/pawpicks-hero.png', 'crop-scratcher', 'บ้านน่าอยู่', false,
   'cat-10', 'เพื่อนชวนเล่น', '/assets/cat-10.png', 'แมวแท็บบี้สีน้ำตาล',
   'https://shopee.co.th/search?keyword=%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%A5%E0%B8%B1%E0%B8%9A%E0%B9%80%E0%B8%A5%E0%B9%87%E0%B8%9A%E0%B9%81%E0%B8%A1%E0%B8%A7',
   'ที่ลับเล็บแมว ไม้ scratcher', true, 4)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, category = excluded.category,
  description = excluded.description, price_thb = excluded.price_thb,
  image = excluded.image, image_crop = excluded.image_crop, badge = excluded.badge,
  badge_dark = excluded.badge_dark, companion_cat_id = excluded.companion_cat_id,
  companion_label = excluded.companion_label, companion_image = excluded.companion_image,
  companion_alt = excluded.companion_alt, shopee_url = excluded.shopee_url,
  search_keywords = excluded.search_keywords, active = excluded.active,
  sort_order = excluded.sort_order;
