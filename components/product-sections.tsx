import Link from "next/link";
import { AffiliateDisclosure } from "@/components/affiliate-notices";
import type { GuideLink } from "@/lib/guides";
import { merchantLabel } from "@/lib/product-view";
import type { Product } from "@/lib/types";

function thDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

const AVAILABILITY: Record<NonNullable<Product["availability"]>, string> = {
  available: "มีจำหน่าย",
  limited: "จำนวนจำกัด",
  unavailable: "สินค้าหมดหรือไม่มีจำหน่าย",
};

/**
 * Master product-detail body (everything below the header/CTA). Each block
 * appears only when its data exists — a product with little data still gets a
 * clean page, never filler.
 */
export function ProductSections({ product: p, guides }: { product: Product; guides: GuideLink[] }) {
  const specs: [string, string][] = [
    ...Object.entries(p.specifications ?? {}),
    ...(p.details.dimensions ? ([["ขนาด", p.details.dimensions]] as [string, string][]) : []),
    ...(p.details.material ? ([["วัสดุ", p.details.material]] as [string, string][]) : []),
    ...(p.warranty ? ([["การรับประกัน (ตามที่ร้านระบุ)", p.warranty]] as [string, string][]) : []),
  ];
  const bestFor = p.bestFor || p.details.suitableFor;
  const merchant = merchantLabel(p);
  const priceFacts: [string, string][] = [
    ...(merchant ? ([["จำหน่ายโดย", merchant]] as [string, string][]) : []),
    ...(p.availability ? ([["สถานะ", AVAILABILITY[p.availability]]] as [string, string][]) : []),
    ...(p.lastPriceCheck ? ([["ตรวจราคาล่าสุด", thDate(p.lastPriceCheck)]] as [string, string][]) : []),
  ];

  return (
    <div className="product-sections">
      {p.editorNote ? (
        <section className="guide-block" aria-labelledby="ps-editor">
          <h2 id="ps-editor">ความเห็นจากบรรณาธิการ</h2>
          <p>{p.editorNote}</p>
        </section>
      ) : null}

      {bestFor || p.notIdealFor ? (
        <section className="guide-block ps-fit" aria-labelledby="ps-fit">
          <h2 id="ps-fit">ใครควรซื้อ / ใครควรข้าม</h2>
          {bestFor ? <p><strong>เหมาะกับ:</strong> {bestFor}</p> : null}
          {p.notIdealFor ? <p><strong>อาจไม่เหมาะกับ:</strong> {p.notIdealFor}</p> : null}
        </section>
      ) : null}

      {p.keyFeatures && p.keyFeatures.length > 0 ? (
        <section className="guide-block" aria-labelledby="ps-features">
          <h2 id="ps-features">จุดเด่น</h2>
          <ul>{p.keyFeatures.map((f) => <li key={f}>{f}</li>)}</ul>
        </section>
      ) : null}

      {specs.length > 0 ? (
        <section className="guide-block" aria-labelledby="ps-specs">
          <h2 id="ps-specs">ข้อมูลจำเพาะ</h2>
          <dl className="product-detail-notes">
            {specs.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </section>
      ) : null}

      {(p.pros && p.pros.length > 0) || (p.cons && p.cons.length > 0) ? (
        <section className="guide-block ps-proscons" aria-labelledby="ps-pc">
          <h2 id="ps-pc">ข้อดีและข้อควรพิจารณา</h2>
          <div className="ps-pc-grid">
            {p.pros && p.pros.length > 0 ? (
              <div><h3>ข้อดี</h3><ul>{p.pros.map((x) => <li key={x}>{x}</li>)}</ul></div>
            ) : null}
            {p.cons && p.cons.length > 0 ? (
              <div><h3>ข้อควรพิจารณา</h3><ul>{p.cons.map((x) => <li key={x}>{x}</li>)}</ul></div>
            ) : null}
          </div>
        </section>
      ) : null}

      {p.details.instructions ? (
        <section className="guide-block" aria-labelledby="ps-usage">
          <h2 id="ps-usage">วิธีใช้</h2>
          <p className="preserve-lines">{p.details.instructions}</p>
        </section>
      ) : null}

      {priceFacts.length > 0 ? (
        <section className="guide-block" aria-labelledby="ps-price">
          <h2 id="ps-price">ข้อมูลราคาและร้านค้า</h2>
          <dl className="product-detail-notes">
            {priceFacts.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </section>
      ) : null}

      {guides.length > 0 ? (
        <section className="guide-block" aria-labelledby="ps-guides">
          <h2 id="ps-guides">บทความที่เกี่ยวข้อง</h2>
          <ul>
            {guides.map((g) => (
              <li key={g.href}><Link href={g.href}>{g.title}</Link></li>
            ))}
          </ul>
        </section>
      ) : null}

      <AffiliateDisclosure />
      {p.lastDataCheck ? <p className="affiliate-note">ตรวจข้อมูลสินค้าล่าสุด {thDate(p.lastDataCheck)}</p> : null}
    </div>
  );
}
