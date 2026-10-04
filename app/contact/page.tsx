import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";
import { getContactChannels } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description: "PawPicks Thailand เป็นเว็บไซต์แนะนำและคัดเลือกสินค้าเกี่ยวกับแมวและ Pet Tech — ข้อมูลช่องทางติดต่อและเรื่องที่ควรถามร้านค้าโดยตรง",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const channels = getContactChannels();
  return (
    <StaticPage
      title="ติดต่อเรา"
      intro="PawPicks Thailand เป็นเว็บไซต์แนะนำและคัดเลือกสินค้าเกี่ยวกับแมวและ Pet Tech"
    >
      {channels.length > 0 ? (
        <>
          <h2>ช่องทางติดต่อ PawPicks</h2>
          <dl className="static-facts">
            {channels.map((c) => (
              <div key={c.href}>
                <dt>{c.label}</dt>
                <dd><a href={c.href} target="_blank" rel="noopener noreferrer">{c.text}</a></dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}

      <h2>เรื่องที่ควรติดต่อร้านค้าโดยตรง</h2>
      <p>
        หากเป็นคำถามเกี่ยวกับคำสั่งซื้อ การชำระเงิน การจัดส่ง หรือการรับประกันของสินค้าที่ซื้อผ่าน Shopee
        โปรดติดต่อร้านค้าที่จำหน่ายสินค้านั้นโดยตรง หรือฝ่ายบริการของแพลตฟอร์ม
        เพราะ PawPicks ไม่ได้เป็นผู้ขายและไม่ได้เป็นผู้จัดส่งสินค้า
      </p>
      <p>
        อ่านเพิ่มเติมได้ที่ <a href="/shipping">การสั่งซื้อและจัดส่ง</a> และ{" "}
        <a href="/affiliate-disclosure">การเปิดเผยลิงก์พันธมิตร</a>
      </p>
    </StaticPage>
  );
}
