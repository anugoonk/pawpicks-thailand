import { QueryLink } from "@/components/query-link";
import { CAT_TEAM, COLLECTIONS } from "@/lib/data";

/* All plain <img>: the original design relies on CSS object-fit / transform
   crops that next/image would override. */

export function PromoBar() {
  return (
    <div className="promo">
      ส่งต่อของดีที่ทาสควรรู้ • อัปเดตสินค้าใหม่ทุกสัปดาห์
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero">
      <img
        src="/assets/pawpicks-hero.png"
        alt="แมวสีน้ำตาลและแมวสีเทากับอุปกรณ์ Pet Tech"
      />
      <div className="hero-copy">
        <p className="eyebrow">FOR CATS. WITH LOVE.</p>
        <h1>
          ของดีสำหรับแมว
          <br />
          ที่คุณรัก
        </h1>
        <p>ของใช้แมวและ Pet Tech ในที่เดียว</p>
        <a className="primary-button" href="#new">
          ดูสินค้าแนะนำ <span>→</span>
        </a>
      </div>
    </section>
  );
}

export function TrustRow() {
  return (
    <section className="trust-row" aria-label="จุดเด่นของ PawPicks">
      <article>
        <span>✓</span>
        <div>
          <strong>คัดจากการใช้งาน</strong>
          <small>เน้นประโยชน์จริง ไม่ขายเกินจริง</small>
        </div>
      </article>
      <article>
        <span>♡</span>
        <div>
          <strong>คิดแทนคนเลี้ยงแมว</strong>
          <small>ดูทั้งความปลอดภัยและความคุ้มค่า</small>
        </div>
      </article>
      <article>
        <span>⌁</span>
        <div>
          <strong>ซื้อผ่านร้านที่คุณเลือก</strong>
          <small>กดดูราคาและรีวิวล่าสุดบน Shopee</small>
        </div>
      </article>
    </section>
  );
}

export function NewSectionHeading() {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">CURATED THIS WEEK</p>
        <h2>สินค้าแนะนำประจำสัปดาห์</h2>
      </div>
      <a href="#collections">ดูทุกหมวด →</a>
    </div>
  );
}

export function Collections() {
  return (
    <section className="section collections" id="collections">
      <div className="section-heading">
        <div>
          <p className="eyebrow">SHOP BY COLLECTION</p>
          <h2>เลือกตามสิ่งที่เจ้าเหมียวต้องการ</h2>
        </div>
      </div>
      <div className="collection-grid">
        {COLLECTIONS.map((c) => (
          <QueryLink key={c.id} query={c.query}>
            <span className="collection-cats">
              {c.catImages.map((img) => (
                <img key={img.src} src={img.src} alt={img.alt} loading="lazy" />
              ))}
            </span>
            <strong>{c.title}</strong>
            <small>{c.blurb}</small>
          </QueryLink>
        ))}
      </div>
    </section>
  );
}

export function About() {
  return (
    <section className="about" id="about">
      <div>
        <p className="eyebrow">WHY PAWPICKS</p>
        <h2>เราไม่ได้เลือกเพราะน่ารักอย่างเดียว</h2>
      </div>
      <p>
        PawPicks Thailand มองทั้งการใช้งาน ความปลอดภัย ความคุ้มค่า
        และความคิดเห็นจากผู้ซื้อ เพื่อช่วยให้คนเลี้ยงแมวเลือกได้ง่ายขึ้น
      </p>
    </section>
  );
}

export function CatTeam() {
  return (
    <section
      className="section cat-team"
      id="team"
      aria-labelledby="team-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">THE PAWPICKS FAMILY</p>
          <h2 id="team-title">รู้จักทีมแมว</h2>
        </div>
        <span>12 ตัว · ครอบครัวเดียวกัน</span>
      </div>
      <div className="cat-grid">
        {CAT_TEAM.map((cat) => (
          <QueryLink
            key={cat.id}
            id={cat.id}
            className="cat-card"
            query={cat.query}
            ariaLabel={cat.ariaLabel}
          >
            <img src={cat.image} alt={cat.name} loading="lazy" />
            <span>{cat.name}</span>
          </QueryLink>
        ))}
      </div>
      <p className="team-note">มาสคอตประจำ PawPicks • ใช้สีและลายแทนชื่อ</p>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="brand">
        <span className="brand-mark">🐾</span>
        <span>
          <strong>PawPicks</strong>
          <small>THAILAND</small>
        </span>
      </div>
      <p>คัดของดี เพื่อชีวิตที่ดีขึ้นของแมวและคนที่รักแมว</p>
      <small>
        บางลิงก์เป็นลิงก์ Affiliate
        เราอาจได้รับค่าคอมมิชชันโดยไม่มีค่าใช้จ่ายเพิ่มเติมสำหรับคุณ
      </small>
    </footer>
  );
}
