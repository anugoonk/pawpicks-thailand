import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = {
  title: "การสั่งซื้อและจัดส่ง",
  description: "PawPicks Thailand เป็นเว็บไซต์แนะนำสินค้า ไม่ได้เป็นผู้ขายหรือผู้จัดส่ง — การสั่งซื้อและจัดส่งเป็นไปตามเงื่อนไขของร้านค้าและแพลตฟอร์มที่คุณซื้อ",
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <StaticPage
      title="การสั่งซื้อและจัดส่ง"
      intro="PawPicks Thailand เป็นเว็บไซต์แนะนำสินค้า และอาจมีลิงก์พันธมิตร (Affiliate Link) ไปยังแพลตฟอร์มภายนอก เช่น Shopee"
    >
      <h2>เมื่อคุณกดลิงก์และซื้อสินค้า</h2>
      <p>การดำเนินการต่อไปนี้เป็นไปตามเงื่อนไขของร้านค้าและแพลตฟอร์มที่คุณซื้อสินค้า:</p>
      <ul>
        <li>การชำระเงิน</li>
        <li>การจัดส่งและการติดตามพัสดุ</li>
        <li>การคืนสินค้าและคืนเงิน</li>
        <li>การรับประกันสินค้า</li>
      </ul>
      <h2>PawPicks ไม่ได้เป็นผู้ขายหรือผู้จัดส่ง</h2>
      <p>
        ขณะนี้ PawPicks Thailand ไม่ได้รับคำสั่งซื้อ ไม่ได้รับชำระเงิน ไม่ได้แพ็กหรือจัดส่งสินค้า
        และไม่ได้ออกเลขพัสดุเอง หากมีปัญหาเกี่ยวกับคำสั่งซื้อ โปรดติดต่อร้านค้าหรือฝ่ายบริการของแพลตฟอร์มโดยตรง
      </p>
    </StaticPage>
  );
}
