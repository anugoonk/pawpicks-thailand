import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart-context";
import { SearchProvider } from "@/components/search-context";
import { PromoBar, SiteFooter } from "@/components/sections";
import { SiteHeader } from "@/components/site-header";
import { serverEnv } from "@/lib/env";
import { PENDING } from "@/lib/legal";
import { getProducts } from "@/lib/products";

/** Shared chrome for the trust/legal pages (header + footer + readable column). */
export async function StaticPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
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
          <article className="section static-page">
            <h1>{title}</h1>
            {intro ? <p className="static-intro">{intro}</p> : null}
            {children}
          </article>
        </main>
        <SiteFooter />
      </SearchProvider>
    </CartProvider>
  );
}

/** Renders a business value, highlighting unfilled placeholders so they can't be missed. */
export function Fact({ value }: { value: string }) {
  return value === PENDING ? <mark className="placeholder">{value}</mark> : <>{value}</>;
}
