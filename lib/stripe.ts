import "server-only";

import Stripe from "stripe";

let cached: Stripe | null = null;

/**
 * Lazily-constructed Stripe client. Throws a clear error if called without
 * `STRIPE_SECRET_KEY` so that `next build` (which never calls this) still
 * succeeds without secrets.
 */
export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  cached = new Stripe(key, {
    // Pin to the version the installed `stripe` package ships types for.
    apiVersion: "2025-02-24.acacia",
    appInfo: { name: "PawPicks Thailand", url: "https://pawpicks.co.th" },
    typescript: true,
  });
  return cached;
}

/** Guard against accidentally shipping a live key to a non-prod environment. */
export function assertTestModeOutsideProduction(): void {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const isLive = key.startsWith("sk_live_");
  if (isLive && process.env.NODE_ENV !== "production") {
    throw new Error(
      "Refusing to use a live Stripe key outside production (NODE_ENV=" +
        process.env.NODE_ENV +
        ").",
    );
  }
}
