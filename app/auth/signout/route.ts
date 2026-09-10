import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (hasSupabase()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  // 303 so the browser follows with GET.
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
