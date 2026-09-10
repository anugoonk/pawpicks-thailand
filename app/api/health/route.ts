import { NextResponse } from "next/server";
import { hasStripe, hasSupabase, serverEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Liveness / readiness probe for Firebase App Hosting health checks.
 *
 * The bare probe returns only `{ status: "ok" }` so it discloses nothing
 * about how the deployment is configured. Config detail (`checks`) is
 * returned only when HEALTH_CHECK_TOKEN is set AND the caller passes a
 * matching `?token=` — used by the post-deploy smoke test.
 */
export function GET(request: Request) {
  const body: Record<string, unknown> = {
    status: "ok",
    service: "pawpicks-thailand",
    time: new Date().toISOString(),
  };

  const { HEALTH_CHECK_TOKEN } = serverEnv();
  const token = new URL(request.url).searchParams.get("token");
  if (HEALTH_CHECK_TOKEN && token === HEALTH_CHECK_TOKEN) {
    // Booleans only — never echo secret values.
    body.checks = {
      supabaseConfigured: hasSupabase(),
      stripeConfigured: hasStripe(),
    };
  }

  return NextResponse.json(body);
}
