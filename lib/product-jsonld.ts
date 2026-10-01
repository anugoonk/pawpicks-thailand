import { canPurchase } from "@/lib/cart";
import type { Product } from "@/lib/types";

/**
 * Product + Breadcrumb structured data. `offers` is emitted ONLY when the
 * store is selling this product (flag on, active, stock > 0) so price and
 * availability always match the database. Never emits Review/aggregateRating.
 */
export function productJsonLd(product: Product, base: string, storeEnabled: boolean) {
  const url = `${base}/products/${product.slug}`;
  const image = product.image.startsWith("http") ? product.image : `${base}${product.image}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: [image],
      url,
      ...(storeEnabled && canPurchase(product)
        ? {
            offers: {
              "@type": "Offer",
              url,
              priceCurrency: "THB",
              price: product.priceThb,
              availability: "https://schema.org/InStock",
            },
          }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${base}/` },
        { "@type": "ListItem", position: 2, name: product.name, item: url },
      ],
    },
  ];
}
