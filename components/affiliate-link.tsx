"use client";

import type { ReactNode } from "react";
import { affiliateCtaLabel, isSafeAffiliateUrl } from "@/lib/affiliate";
import { trackAffiliateClick } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";

export type AffiliateLinkProps = {
  href: string | null | undefined;
  /** Merchant name; derived from the URL host when omitted. */
  merchant?: string | null;
  productId?: string | null;
  productName?: string | null;
  /** Where the link sits, e.g. "product_card", "product_detail", "ranking_item", "comparison". */
  placement?: string;
  campaign?: string | null;
  className?: string;
  /** Overrides the default CTA label. */
  children?: ReactNode;
};

function merchantFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname;
    if (host.includes("shopee")) return "Shopee";
    if (host.includes("lazada")) return "Lazada";
  } catch {
    /* fall through */
  }
  return siteConfig.affiliate.defaultMerchant;
}

/**
 * The one way to render an outbound affiliate link: opens in a new tab with
 * rel="noopener noreferrer sponsored", fires a (provider-agnostic) click event,
 * and renders nothing for an unusable URL ("#", javascript:, malformed) so a
 * dead button can never ship.
 */
export function AffiliateLink({
  href,
  merchant,
  productId,
  productName,
  placement = "unknown",
  campaign,
  className,
  children,
}: AffiliateLinkProps) {
  if (!isSafeAffiliateUrl(href)) return null;
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() =>
        trackAffiliateClick({
          product_id: productId ?? null,
          product_name: productName ?? null,
          merchant: merchant ?? merchantFromUrl(href),
          placement,
          campaign: campaign ?? null,
        })
      }
    >
      {children ?? affiliateCtaLabel(href)}
    </a>
  );
}

/** A prominent affiliate CTA (primary button styling). */
export function AffiliateButton(props: AffiliateLinkProps) {
  return <AffiliateLink {...props} className={`primary-button ${props.className ?? ""}`.trim()} />;
}
