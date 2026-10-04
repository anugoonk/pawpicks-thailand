/**
 * Provider-agnostic event tracking. No analytics provider is installed today,
 * so every call is a safe no-op unless a provider has been registered. Events
 * carry only product/placement/page info — never personal data, and the page
 * path excludes the query string (which can hold search text).
 *
 * To plug a provider in later (GA4, Plausible, …), call
 * `registerAnalyticsProvider((name, payload) => …)` once on the client, and
 * set NEXT_PUBLIC_ANALYTICS_ENABLED=true.
 */

export type AffiliateClickEvent = {
  product_id: string | null;
  product_name: string | null;
  merchant: string | null;
  /** Where on the page the link sat, e.g. "product_card", "product_detail", "ranking_item". */
  placement: string;
  page_type: string;
  page_path: string;
  campaign: string | null;
};

export type AnalyticsEventName = "affiliate_click";
export type AnalyticsProvider = (name: AnalyticsEventName, payload: AffiliateClickEvent) => void;

const providers = new Set<AnalyticsProvider>();

/** Registers a provider; returns an unregister function. */
export function registerAnalyticsProvider(provider: AnalyticsProvider): () => void {
  providers.add(provider);
  return () => providers.delete(provider);
}

/** Maps a path to a coarse page type for reporting. */
export function pageTypeFromPath(path: string): string {
  if (path === "/") return "home";
  if (path.startsWith("/products/")) return "product";
  if (path.startsWith("/category/")) return "category";
  if (path.startsWith("/guides")) return "guide";
  if (path.startsWith("/top-10")) return path === "/top-10" ? "ranking_index" : "ranking";
  if (path.startsWith("/compare")) return "comparison";
  if (path.startsWith("/team/")) return "team";
  return "other";
}

export function trackAffiliateClick(
  event: Omit<AffiliateClickEvent, "page_type" | "page_path"> &
    Partial<Pick<AffiliateClickEvent, "page_type" | "page_path">>,
): void {
  try {
    if (typeof window === "undefined") return;
    const page_path = event.page_path ?? window.location.pathname;
    const payload: AffiliateClickEvent = {
      ...event,
      page_path,
      page_type: event.page_type ?? pageTypeFromPath(page_path),
    };
    window.dispatchEvent(new CustomEvent("pawpicks:affiliate_click", { detail: payload }));
    providers.forEach((p) => {
      try {
        p("affiliate_click", payload);
      } catch {
        /* a broken provider must never break the click */
      }
    });
  } catch {
    /* tracking is best-effort */
  }
}
