/**
 * Master switch for direct selling. NEXT_PUBLIC_* is inlined at build time, so
 * the same flag drives both server and client components. Default OFF: the
 * site stays a curated catalogue until the owner opts in (Stripe Test Mode
 * first — never flip this on Production without Stripe live-mode sign-off).
 */
export const STORE_ENABLED = process.env.NEXT_PUBLIC_STORE_ENABLED === "true";
