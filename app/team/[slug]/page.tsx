import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CartPanel } from "@/components/cart-panel";
import { CartProvider } from "@/components/cart-context";
import { CatProfile } from "@/components/cat-profile";
import { SearchProvider } from "@/components/search-context";
import { PromoBar, SiteFooter } from "@/components/sections";
import { SiteHeader } from "@/components/site-header";
import { TEAM, getTeamCat, getTeamNeighbours, type CatLink } from "@/data/team";
import { COLLECTIONS } from "@/lib/data";
import { getSiteUrl, serverEnv } from "@/lib/env";
import { getProducts } from "@/lib/products";
import { STORE_ENABLED } from "@/lib/store";

type TeamPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export function generateStaticParams() {
  return TEAM.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = getTeamCat(slug);
  if (!cat) return {};

  const title = `${cat.color} — ${cat.role}`;
  const description = `รู้จัก${cat.color} ${cat.role} ของ PawPicks Thailand: ${cat.traits} มาสคอตประจำเว็บที่ระบุด้วยสีและลาย`;
  return {
    title,
    description,
    alternates: { canonical: `/team/${cat.slug}` },
    openGraph: {
      title,
      description,
      url: `${getSiteUrl()}/team/${cat.slug}`,
      images: [cat.image],
      type: "website",
    },
  };
}

export default async function TeamProfilePage({ params }: TeamPageProps) {
  const { slug } = await params;
  const cat = getTeamCat(slug);
  if (!cat) notFound();

  const products = await getProducts();
  const { SHIPPING_FLAT_RATE, FREE_SHIPPING_THRESHOLD } = serverEnv();

  // Only link to products/collections that actually exist right now.
  const links: CatLink[] = [
    ...cat.productSlugs.flatMap((s) => {
      const p = products.find((x) => x.slug === s);
      return p ? [{ label: p.name, href: `/products/${p.slug}` }] : [];
    }),
    ...cat.collectionIds.flatMap((id) => {
      const c = COLLECTIONS.find((x) => x.id === id);
      return c ? [{ label: `หมวด ${c.title}`, href: "/#collections" }] : [];
    }),
    ...(cat.extraLinks ?? []),
  ];
  const { prev, next } = getTeamNeighbours(cat.slug);

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
          <div className="section">
            <CatProfile cat={cat} links={links} prev={prev} next={next} />
          </div>
        </main>
        <SiteFooter />
        {STORE_ENABLED ? <CartPanel /> : null}
      </SearchProvider>
    </CartProvider>
  );
}
