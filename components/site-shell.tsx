import type { ReactNode } from "react";
import { CartPanel } from "@/components/cart-panel";
import { CartProvider } from "@/components/cart-context";
import { SearchProvider } from "@/components/search-context";
import { PromoBar, SiteFooter } from "@/components/sections";
import { SiteHeader } from "@/components/site-header";
import { serverEnv } from "@/lib/env";
import { getProducts } from "@/lib/products";
import { STORE_ENABLED } from "@/lib/store";

/**
 * Standard page chrome (promo bar, header, footer, cart/search providers) for
 * the content templates: category, guides and comparison pages.
 */
export async function SiteShell({ children }: { children: ReactNode }) {
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
        <main id="top">{children}</main>
        <SiteFooter />
        {STORE_ENABLED ? <CartPanel /> : null}
      </SearchProvider>
    </CartProvider>
  );
}
