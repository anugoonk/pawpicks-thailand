import { z } from "zod";

/**
 * Centralised, validated environment access.
 *
 * - Never import `serverEnv` from a Client Component. It is guarded by
 *   `server-only` at the call sites that need secrets.
 * - Public values (safe for the browser) live in `publicEnv`.
 * - Validation is lazy so that `next build` does not require production
 *   secrets to be present (Firebase App Hosting injects them at runtime).
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  SHIPPING_FLAT_RATE: z.coerce.number().nonnegative().default(50),
  FREE_SHIPPING_THRESHOLD: z.coerce.number().nonnegative().default(1500),
});

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
});

let cachedServerEnv: z.infer<typeof serverSchema> | null = null;

export function serverEnv(): z.infer<typeof serverSchema> {
  if (!cachedServerEnv) {
    cachedServerEnv = serverSchema.parse({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      SHIPPING_FLAT_RATE: process.env.SHIPPING_FLAT_RATE,
      FREE_SHIPPING_THRESHOLD: process.env.FREE_SHIPPING_THRESHOLD,
    });
  }
  return cachedServerEnv;
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3021"
  );
}

/** True when Supabase is configured for this environment. */
export function hasSupabase(): boolean {
  return Boolean(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL && publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** True when Stripe server keys are present (test or live). */
export function hasStripe(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
