import type { Metadata } from "next";
import { AffiliateDisclosure } from "@/components/affiliate-notices";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductComparison } from "@/components/product-comparison";
import { SiteShell } from "@/components/site-shell";
import { MIN_COMPARE, parseCompareSlugs } from "@/lib/compare";
import { isProductPublic } from "@/lib/product-view";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "เปรียบเทียบสินค้า",
  description: "เปรียบเทียบสินค้าแมวและ Pet Tech เคียงข้างกันจากข้อมูลที่ตรวจสอบแล้ว",
  // Query-driven tool page: useful to people, not something to index.
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ items?: string | string[] }> };

export default async function ComparePage({ searchParams }: Props) {
  const { items } = await searchParams;
  const slugs = parseCompareSlugs(items);
  const all = await getProducts();
  const products = slugs.flatMap((s) => {
    const p = all.find((x) => x.slug === s);
    return p && isProductPublic(p) ? [p] : [];
  });

  return (
    <SiteShell>
      <section className="section">
        <Breadcrumbs items={[{ name: "เปรียบเทียบสินค้า" }]} />
        <header className="guide-header">
          <h1>เปรียบเทียบสินค้า</h1>
        </header>
        {products.length >= MIN_COMPARE ? (
          <>
            <ProductComparison products={products} />
            <AffiliateDisclosure />
          </>
        ) : (
          <p className="top10-none-yet">
            เลือกสินค้าอย่างน้อย {MIN_COMPARE} รายการเพื่อเปรียบเทียบ เช่น <code>/compare?items=สินค้า-a,สินค้า-b</code>{" "}
            (ใช้ slug ของสินค้า)
          </p>
        )}
      </section>
    </SiteShell>
  );
}
