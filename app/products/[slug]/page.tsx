import type { Metadata } from "next";
/* eslint-disable @next/next/no-img-element -- existing product art relies on CSS crop classes. */
import Link from "next/link";
import { notFound } from "next/navigation";
import { CartPanel } from "@/components/cart-panel";
import { CartProvider } from "@/components/cart-context";
import { teamPathForCatId } from "@/data/team";
import { AFFILIATE_NOTE, isGenericShopeeSearch } from "@/lib/affiliate";
import { STORE_ENABLED } from "@/lib/store";
import { ProductGallery } from "@/components/product-gallery";
import { ProductDetailActions } from "@/components/product-detail-actions";
import { ProductGrid } from "@/components/product-grid";
import { SearchProvider } from "@/components/search-context";
import { PromoBar, SiteFooter } from "@/components/sections";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl, serverEnv } from "@/lib/env";
import { formatThb } from "@/lib/format";
import { getProductBySlug, getProducts } from "@/lib/products";
import { productJsonLd } from "@/lib/product-jsonld";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description,
      url: `${getSiteUrl()}/products/${product.slug}`,
      images: [product.image],
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const products = await getProducts();
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);
  const fallbackRelated = products.filter((p) => p.id !== product.id).slice(0, 4);
  const shownRelated = relatedProducts.length > 0 ? relatedProducts : fallbackRelated;
  const { SHIPPING_FLAT_RATE, FREE_SHIPPING_THRESHOLD } = serverEnv();

  // Only rows with real data; nothing is shown for fields we have not verified.
  const rating =
    product.rating != null && product.reviewCount
      ? `${product.rating.toFixed(1)}/5 จาก ${product.reviewCount.toLocaleString("th-TH")} รีวิว`
      : null;
  const notes: [label: string, value: string, preserveLines?: boolean][] = (
    [
      ["ขนาด", product.details.dimensions],
      ["วัสดุ", product.details.material],
      ["เหมาะกับ", product.bestFor || product.details.suitableFor],
      ["วิธีใช้", product.details.instructions, true],
      ["การรับประกัน (ตามที่ร้านระบุ)", product.warranty],
      ["ข้อดี", product.pros?.join(" · ")],
      ["ข้อควรพิจารณา", product.cons?.join(" · ")],
      ["คะแนนจากผู้ซื้อ", rating],
      ["ร้านค้า", product.merchant],
      ["ตรวจข้อมูลล่าสุด", product.lastChecked],
    ] as [string, string | null | undefined, boolean?][]
  ).filter((n): n is [string, string, boolean?] => Boolean(n[1]));

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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(productJsonLd(product, getSiteUrl(), STORE_ENABLED)).replace(/</g, "\\u003c"),
            }}
          />
          <section className="product-detail">
            <div className="product-detail-media">
              <ProductGallery key={product.id} product={product} />
              {product.companionImage ? (
                <Link
                  className="product-detail-companion"
                  href={teamPathForCatId(product.companionCatId)}
                >
                  <img
                    src={product.companionImage}
                    alt={product.companionAlt ?? ""}
                    loading="lazy"
                  />
                  <span>{product.companionLabel}</span>
                </Link>
              ) : null}
            </div>

            <div className="product-detail-copy">
              <Link className="back-link" href="/#new">
                กลับไปเลือกสินค้า
              </Link>
              <p className="eyebrow">{product.category}</p>
              <h1>{product.name}</h1>
              <p className="product-detail-description">{product.description}</p>
              <p className="product-detail-price">
                {STORE_ENABLED
                  ? formatThb(product.priceThb)
                  : isGenericShopeeSearch(product.shopeeUrl)
                    ? "เช็กราคาล่าสุดบน Shopee"
                    : `ราคาอ้างอิง ${formatThb(product.priceThb)}`}
              </p>
              {STORE_ENABLED ? null : <p className="affiliate-disclosure">{AFFILIATE_NOTE}</p>}
              <ProductDetailActions product={product} />
              {notes.length > 0 ? (
                <dl className="product-detail-notes">
                  {notes.map(([label, value, preserve]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd className={preserve ? "preserve-lines" : undefined}>{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </section>

          {shownRelated.length > 0 ? (
            <section className="section product-detail-related" id="new">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">YOU MAY ALSO LIKE</p>
                  <h2>สินค้าแนะนำเพิ่มเติม</h2>
                </div>
              </div>
              <ProductGrid products={shownRelated} />
            </section>
          ) : null}
        </main>
        <SiteFooter />
        {STORE_ENABLED ? <CartPanel /> : null}
      </SearchProvider>
    </CartProvider>
  );
}
