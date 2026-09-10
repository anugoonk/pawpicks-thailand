import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/env";

/**
 * Privileged Supabase client using the Service Role key. It BYPASSES Row
 * Level Security, so:
 *
 *  - Only ever import this from server-only code (Route Handlers, webhooks,
 *    Server Actions). `server-only` above will fail the build if a Client
 *    Component pulls it in.
 *  - Never return its raw results to the browser without filtering.
 *  - Used for: marking orders paid from the verified Stripe webhook, admin
 *    tasks, migrations-style maintenance.
 */
export function createAdminClient() {
  const { SUPABASE_SERVICE_ROLE_KEY } = serverEnv();
  if (!publicEnv.NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Admin Supabase client requested but NEXT_PUBLIC_SUPABASE_URL / " +
        "SUPABASE_SERVICE_ROLE_KEY are not set.",
    );
  }
  return createSupabaseClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
