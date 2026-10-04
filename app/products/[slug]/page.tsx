import type { Metadata } from "next";
/* eslint-disable @next/next/no-img-element -- existing product art relies on CSS crop classes. */
import Link from "next/link";
import { notFound } from "next/navigation";
import { CartPanel } from "@/components/cart-panel";
import { CartProvider } from "@/components/cart-context";
import { teamPathForCatId } from "@/data/team";
import { AffiliateNotice } from "@/components/affiliate-notices";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductSections } from "@/components/product-sections";
import { isGenericShopeeSearch } from "@/lib/affiliate";
import { categoryForProduct, categoryRoute } from "@/lib/categories";
import { getGuideLinksForProduct } from "@/lib/guides";
import { priceInfo, ratingInfo } from "@/lib/product-view";
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

  const category = categoryForProduct(product, products);
  const guideLinks = getGuideLinksForProduct(product.slug);
  const rating = ratingInfo(product);
  const price = priceInfo(product);
  const crumbs = [
    ...(category ? [{ name: category.name, href: categoryRoute(category.slug) }] : []),
    { name: product.name },
  ];

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
              __html: JSON.stringify(productJsonLd(product, getSiteUrl(), STORE_ENABLED)[0]).replace(/</g, "\\u003c"),
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
              <Breadcrumbs items={crumbs} />
              <p className="eyebrow">{[product.brand, product.category].filter(Boolean).join(" · ")}</p>
              <h1>{product.name}</h1>
              <p className="product-detail-description">{product.shortDescription || product.description}</p>
              {rating ? (
                <p className="product-meta">
                  <span>★ {rating.rating.toFixed(1)} ({rating.reviewCount.toLocaleString("th-TH")} รีวิว)</span>
                  {product.soldCount ? <span>ขายแล้ว {product.soldCount.toLocaleString("th-TH")} ชิ้น</span> : null}
                </p>
              ) : null}
              <p className="product-detail-price">
                {STORE_ENABLED ? (
                  formatThb(product.priceThb)
                ) : price ? (
                  <>
                    ราคาอ้างอิง {formatThb(price.price)}
                    {price.originalPrice ? <s className="price-original"> {formatThb(price.originalPrice)}</s> : null}
                    {price.discountPct ? <span className="badge discount"> -{price.discountPct}%</span> : null}
                  </>
                ) : isGenericShopeeSearch(product.shopeeUrl) ? (
                  "เช็กราคาล่าสุดบน Shopee"
                ) : (
                  "เช็กราคาล่าสุด"
                )}
              </p>
              {STORE_ENABLED ? null : <AffiliateNotice className="affiliate-disclosure" />}
              <ProductDetailActions product={product} />
            </div>
          </section>

          <section className="section">
            <ProductSections product={product} guides={guideLinks} />
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
