import { CartPanel } from "@/components/cart-panel";
import { CartProvider } from "@/components/cart-context";
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
  TrustRow,
} from "@/components/sections";
import { serverEnv } from "@/lib/env";
import { getProducts } from "@/lib/products";

// Marketing page: static content + product list. Products come from Supabase
// when configured, otherwise the static fallback — so this always renders.
// Statically rendered; re-generated at most every 5 minutes (ISR).
export const revalidate = 300;

export default async function HomePage() {
  const products = await getProducts();
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
          <Hero />
          <TrustRow />
          <section className="section" id="new">
            <NewSectionHeading />
            <ProductGrid products={products} />
          </section>
          <Collections />
          <About />
          <CatTeam />
        </main>
        <SiteFooter />
        <CartPanel />
      </SearchProvider>
    </CartProvider>
  );
}
