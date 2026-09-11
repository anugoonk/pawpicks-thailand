import "server-only";

import { hasSupabase } from "@/lib/env";

/** The only value of `profiles.role` that grants admin access. */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin";
}

/**
 * Whether the signed-in user has `profiles.role = 'admin'`. Backed by the
 * "profiles: read own" RLS policy — a user can only ever read their own row,
 * so this can't be used to check anyone else's role.
 */
export async function isAdmin(): Promise<boolean> {
  if (!hasSupabase()) return false;
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    return isAdminRole(data?.role);
  } catch {
    return false;
  }
}
