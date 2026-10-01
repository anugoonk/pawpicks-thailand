import { CartPanel } from "@/components/cart-panel";
import { CartProvider } from "@/components/cart-context";
import { STORE_ENABLED } from "@/lib/store";
import { SearchProvider } from "@/components/search-context";
import { SiteHeader } from "@/components/site-header";
import { ProductGrid } from "@/components/product-grid";
import {
  About,
  CatTeam,
  Collections,
  Hero,
  NewSectionHeading,
  PromoBar,
  SiteFooter,
  Top10Promo,
  TrustRow,
} from "@/components/sections";
import { serverEnv } from "@/lib/env";
import { getProducts } from "@/lib/products";

// Marketing page: static content + product list. Products come from Supabase
// when configured, otherwise the static fallback — so this always renders.
// Statically rendered; re-generated at most every 5 minutes (ISR), except
// when a `?q=` search lands here from another page (see SiteHeader), which
// makes the request dynamic for that one visit.
export const revalidate = 300;

type HomePageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q } = await searchParams;
  const products = await getProducts();
  const { SHIPPING_FLAT_RATE, FREE_SHIPPING_THRESHOLD } = serverEnv();

  return (
    <CartProvider
      products={products}
      shippingFlatRate={SHIPPING_FLAT_RATE}
      freeShippingThreshold={FREE_SHIPPING_THRESHOLD}
    >
      <SearchProvider initialQuery={q ?? ""}>
        <PromoBar />
        <SiteHeader />
        <main id="top">
          <Hero />
          <TrustRow />
          <section className="section" id="new">
            <NewSectionHeading />
            <ProductGrid products={products} />
          </section>
          <Top10Promo />
          <Collections />
          <About />
          <CatTeam />
        </main>
        <SiteFooter />
        {STORE_ENABLED ? <CartPanel /> : null}
      </SearchProvider>
    </CartProvider>
  );
}
