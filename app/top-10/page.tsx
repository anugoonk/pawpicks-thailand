import type { Metadata } from "next";
import { CartPanel } from "@/components/cart-panel";
import { CartProvider } from "@/components/cart-context";
import { STORE_ENABLED } from "@/lib/store";
import { SearchProvider } from "@/components/search-context";
import { PromoBar, SiteFooter } from "@/components/sections";
import { SiteHeader } from "@/components/site-header";
import { Top10Filter } from "@/components/top10-filter";
import { serverEnv } from "@/lib/env";
import { getProducts } from "@/lib/products";
import { getTop10ListedArticles } from "@/lib/top10";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "PawPicks Top 10",
  description:
    "บทความจัดอันดับของใช้แมวและ Pet Tech จาก PawPicks Thailand คัดเลือกจากคุณสมบัติ ราคา ความปลอดภัย การรับประกัน และความคิดเห็นจากผู้ซื้อที่ตรวจสอบได้",
};

export default async function Top10LandingPage() {
  const articles = getTop10ListedArticles();
  const categories = [...new Set(articles.map((a) => a.category))];  const products = await getProducts();
  const { SHIPPING_FLAT_RATE, FREE_SHIPPING_THRESHOLD } = serverEnv();

  return (
    <CartProvider
      products={products}
      shippingFlatRate={SHIPPING_FLAT_RATE}
      freeShippingThreshold={FREE_SHIPPING_THRESHOLD}
    >
      <SearchProvider>
        <PromoBar />
        <SiteHeader />
        <main id="top">
          <section className="section top10-landing">
            <div className="section-heading">
              <div>
                <p className="eyebrow">PAWPICKS TOP 10</p>
                <h1>บทความจัดอันดับของใช้แมว</h1>
              </div>
            </div>
            <p className="top10-landing-intro">
              คัดสรรและจัดอันดับของใช้แมวตามหมวดหมู่ เผยแพร่เมื่อมีข้อมูลที่ตรวจสอบแล้วเท่านั้น
              ดู <a href="/how-we-choose">วิธีที่เราเลือกสินค้า</a>
            </p>
            <Top10Filter articles={articles} categories={categories} />
          </section>
        </main>
        <SiteFooter />
        {STORE_ENABLED ? <CartPanel /> : null}
      </SearchProvider>
    </CartProvider>
  );
}
