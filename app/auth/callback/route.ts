import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Magic-link landing. Supabase sends the user here with `?code=...`; we
 * exchange it for a session cookie and forward to the account page.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (hasSupabase() && code) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/account?error=auth`);
}

/** Only allow same-site relative paths as the post-login redirect. */
function safeNext(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/account";
}
