import Link from "next/link";
import { TEAM_LINES, type CatLink, type TeamCat } from "@/data/team";

/** Profile body for /team/[slug]. `links` are already resolved to real pages. */
export function CatProfile({
  cat,
  links,
  prev,
  next,
}: {
  cat: TeamCat;
  links: CatLink[];
  prev: TeamCat;
  next: TeamCat;
}) {
  const line = TEAM_LINES.find((l) => l.id === cat.line);
  const hasProductLink = links.some((l) => l.href.startsWith("/products/"));

  return (
    <article className="cat-profile">
      <Link className="back-link" href="/#team">
        กลับไปรู้จักทีมแมว
      </Link>

      <div className="cat-profile-layout">
        <div className="cat-profile-photo">
          <img src={cat.image} alt={cat.color} />
        </div>

        <div className="cat-profile-copy">
          <p className="eyebrow">{line?.title ?? "THE PAWPICKS FAMILY"}</p>
          <h1>{cat.color}</h1>
          <p className="cat-profile-role">{cat.role}</p>

          {cat.quote ? (
            <blockquote className="cat-quote">“{cat.quote}”</blockquote>
          ) : null}

          <dl className="cat-facts">
            <div><dt>นิสัย</dt><dd>{cat.traits}</dd></div>
            <div><dt>หน้าที่ในเว็บ</dt><dd>{cat.duties}</dd></div>
            <div><dt>มุกประจำตัว</dt><dd>{cat.quirk}</dd></div>
          </dl>

          {links.length > 0 ? (
            <section aria-labelledby="cat-links-title">
              <h2 id="cat-links-title" className="cat-links-title">สินค้า/หมวดที่ดูแล</h2>
              <ul className="cat-links">
                {links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href}>{l.label} →</Link>
                  </li>
                ))}
              </ul>
              {hasProductLink ? (
                <p className="affiliate-disclosure">
                  บางลิงก์ในเว็บเป็นลิงก์ Affiliate
                  เราอาจได้รับค่าคอมมิชชันโดยไม่มีค่าใช้จ่ายเพิ่มเติมสำหรับคุณ
                </p>
              ) : null}
            </section>
          ) : null}

          <p className="cat-profile-note">
            ตำแหน่งนี้เป็นบทบาทเชิงเล่าเรื่องของมาสคอตประจำเว็บ
            ไม่ใช่ผลทดสอบหรือรีวิวจริงของแมว • แมวทุกตัวระบุด้วยสีและลาย ไม่มีชื่อเล่น
          </p>
        </div>
      </div>

      {/* A div, not <nav>: the global mobile `nav{display:none}` rule would hide it. */}
      <div className="cat-pager" role="navigation" aria-label="แมวตัวก่อนหน้าและถัดไป">
        <Link href={`/team/${prev.slug}`} rel="prev">
          <small>← ตัวก่อนหน้า</small>
          <strong>{prev.color}</strong>
        </Link>
        <Link href={`/team/${next.slug}`} rel="next">
          <small>ตัวถัดไป →</small>
          <strong>{next.color}</strong>
        </Link>
      </div>
    </article>
  );
}
