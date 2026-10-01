import Link from "next/link";
import { LEGAL_PAGES } from "@/lib/legal";
import { NewSectionFilterState } from "@/components/new-section-filter-state";
import { QueryLink } from "@/components/query-link";
import { TeamCard } from "@/components/team-card";
import { TEAM, TEAM_LINES } from "@/data/team";
import { COLLECTIONS } from "@/lib/data";
import { getTop10Articles } from "@/lib/top10";

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
          <strong>คัดเลือกอย่างรอบด้าน</strong>
          <small>พิจารณาคุณสมบัติ ราคา ความปลอดภัย และการรับประกัน</small>
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
          <strong>กำลังเตรียมเปิดจำหน่ายผ่าน PawPicks</strong>
          <small>พร้อมข้อมูลสินค้าและบริการที่ชัดเจน</small>
        </div>
      </article>
    </section>
  );
}

export function NewSectionHeading() {
  return <NewSectionFilterState />;
}

export function Top10Promo() {
  const articleCount = getTop10Articles().length;
  return (
    <section className="section">
      <div className="top10-promo">
        <div>
          <p className="eyebrow">PAWPICKS TOP 10</p>
          <h2>บทความจัดอันดับของใช้แมว {articleCount} หัวข้อ</h2>
          <p>คัดเลือกจากคุณสมบัติ ราคา ความปลอดภัย การรับประกัน และความคิดเห็นจากผู้ซื้อที่ตรวจสอบได้ หัวข้อที่ยังไม่เผยแพร่จะระบุว่า “เร็วๆ นี้”</p>
        </div>
        <Link className="primary-button" href="/top-10">
          ดูทุกอันดับ <span>→</span>
        </Link>
      </div>
    </section>
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
          <QueryLink key={c.id} query={c.query} label={c.title}>
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
      {TEAM_LINES.map((line) => (
        <div className="team-line" key={line.id}>
          <h3>{line.title}</h3>
          <div className="cat-grid">
            {TEAM.filter((cat) => cat.line === line.id).map((cat) => (
              <TeamCard key={cat.id} cat={cat} />
            ))}
          </div>
        </div>
      ))}
      <p className="team-note">
        มาสคอตประจำ PawPicks • แมวแต่ละตัวมีหน้า profile ของตัวเอง
        ระบุด้วยสีและลาย ไม่มีชื่อเล่น
      </p>
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
      <nav className="footer-links" aria-label="ข้อมูลและนโยบาย">
        {LEGAL_PAGES.map((p) => (
          <Link key={p.href} href={p.href}>{p.label}</Link>
        ))}
      </nav>
      <small>
        บางลิงก์เป็นลิงก์ Affiliate
        เราอาจได้รับค่าคอมมิชชันโดยไม่มีค่าใช้จ่ายเพิ่มเติมสำหรับคุณ
      </small>
    </footer>
  );
}
