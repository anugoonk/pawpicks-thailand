import Link from "next/link";
import type { ReactNode } from "react";
import { AffiliateLink } from "@/components/affiliate-link";
import { teamPathForCatId } from "@/data/team";
import { isGenericShopeeSearch } from "@/lib/affiliate";
import { formatThb } from "@/lib/format";
import {
  highlights,
  merchantLabel,
  priceInfo,
  productAffiliateUrl,
  ratingInfo,
} from "@/lib/product-view";
import type { Product } from "@/lib/types";

/**
 * Reusable product card. Renders ONLY the data that exists: no rating without
 * a review count, no price without a verifiable one (then "check the latest
 * price"), no CTA without a usable affiliate URL. Never falls back to
 * made-up numbers.
 *
 * `actions` is for store-mode extras (stock + add-to-cart); when present the
 * price is shown by that UI instead.
 */
export function ProductCard({
  product: p,
  placement = "product_card",
  hidden,
  actions,
}: {
  product: Product;
  placement?: string;
  hidden?: boolean;
  actions?: ReactNode;
}) {
  const price = priceInfo(p);
  const rating = ratingInfo(p);
  const url = productAffiliateUrl(p);
  const points = highlights(p);
  const merchant = merchantLabel(p);

  return (
    <article className="product-card" data-search={p.searchKeywords} hidden={hidden}>
      <Link
        className={`product-image product-image-link ${p.imageCrop ?? ""}`.trim()}
        href={`/products/${p.slug}`}
        aria-label={`ดูรายละเอียด ${p.name}`}
      >
        {/* Plain <img>: the original design crops via CSS transform:scale. */}
        <img src={p.image} alt={p.name} />
        {p.badge ? <span className={`badge${p.badgeDark ? " dark" : ""}`}>{p.badge}</span> : null}
        {price?.discountPct ? <span className="badge discount">-{price.discountPct}%</span> : null}
      </Link>
      <div className="product-info">
        {p.companionCatId ? (
          <Link className="product-companion" href={teamPathForCatId(p.companionCatId)}>
            <img src={p.companionImage ?? ""} alt={p.companionAlt ?? ""} loading="lazy" />
            <span>{p.companionLabel}</span>
          </Link>
        ) : null}
        <small>{[p.brand, p.category].filter(Boolean).join(" · ")}</small>
        <h3>
          <Link className="product-title-link" href={`/products/${p.slug}`}>
            {p.name}
          </Link>
        </h3>
        <p>{p.shortDescription || p.description}</p>

        {rating || p.soldCount ? (
          <p className="product-meta">
            {rating ? (
              <span>
                ★ {rating.rating.toFixed(1)} ({rating.reviewCount.toLocaleString("th-TH")} รีวิว)
              </span>
            ) : null}
            {p.soldCount ? <span>ขายแล้ว {p.soldCount.toLocaleString("th-TH")} ชิ้น</span> : null}
          </p>
        ) : null}

        {points.length > 0 ? (
          <ul className="product-highlights">
            {points.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        ) : null}

        <div className="product-actions">
          {actions ?? (
            <p className="product-reference-price">
              {price ? (
                <>
                  ราคาอ้างอิง {formatThb(price.price)}
                  {price.originalPrice ? (
                    <s className="price-original"> {formatThb(price.originalPrice)}</s>
                  ) : null}
                </>
              ) : url && isGenericShopeeSearch(url) ? (
                "เช็กราคาล่าสุดบน Shopee"
              ) : (
                "เช็กราคาล่าสุด"
              )}
            </p>
          )}
          {merchant && url ? <small className="product-merchant">จำหน่ายโดย {merchant}</small> : null}
          {/* Marketplace links are a secondary option, never the main CTA. */}
          <AffiliateLink
            className="shopee-link"
            href={url}
            merchant={p.merchant}
            productId={p.id}
            productName={p.name}
            placement={placement}
          />
        </div>
      </div>
    </article>
  );
}
