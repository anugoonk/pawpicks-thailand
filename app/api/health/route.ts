import { NextResponse } from "next/server";
import { hasStripe, hasSupabase } from "@/lib/env";

export const dynamic = "force-dynamic";

/** Liveness / readiness probe for Firebase App Hosting health checks. */
export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "pawpicks-thailand",
    time: new Date().toISOString(),
    // Booleans only — never echo secret values.
    checks: {
      supabaseConfigured: hasSupabase(),
      stripeConfigured: hasStripe(),
    },
  });
}
