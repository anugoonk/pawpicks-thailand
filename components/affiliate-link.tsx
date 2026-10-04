import type { ReactNode } from "react";
import { isSafeAffiliateUrl, shopeeCtaLabel } from "@/lib/affiliate";

/**
 * The one way to render an outbound affiliate link: opens in a new tab with
 * rel="sponsored noopener noreferrer", and renders nothing for an unusable URL
 * ("#", javascript:, malformed) so a dead button can never ship.
 */
export function AffiliateLink({
  href,
  className,
  children,
}: {
  href: string | null | undefined;
  className?: string;
  /** Overrides the default Shopee label. */
  children?: ReactNode;
}) {
  if (!isSafeAffiliateUrl(href)) return null;
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      {children ?? shopeeCtaLabel(href)}
    </a>
  );
}
