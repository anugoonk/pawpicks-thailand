import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({ hasSupabase: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { hasSupabase } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { isAdmin, isAdminRole } from "@/lib/admin";

describe("isAdminRole", () => {
  it("is true only for the exact string 'admin'", () => {
    expect(isAdminRole("admin")).toBe(true);
  });

  it("is false for any other role, null or undefined", () => {
    expect(isAdminRole("customer")).toBe(false);
    expect(isAdminRole("Admin")).toBe(false); // case-sensitive on purpose
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
  });
});

/** Minimal fake matching the one chain isAdmin() actually calls. */
function fakeSupabase(opts: {
  user: { id: string } | null;
  role?: string | null;
}) {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: opts.user } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () =>
            Promise.resolve({ data: opts.role ? { role: opts.role } : null }),
        }),
      }),
    }),
  };
}

describe("isAdmin", () => {
  afterEach(() => vi.mocked(createClient).mockReset());

  it("returns false without touching Supabase when it isn't configured", async () => {
    vi.mocked(hasSupabase).mockReturnValue(false);
    expect(await isAdmin()).toBe(false);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("returns false when signed out", async () => {
    vi.mocked(hasSupabase).mockReturnValue(true);
    vi.mocked(createClient).mockResolvedValue(
      fakeSupabase({ user: null }) as never,
    );
    expect(await isAdmin()).toBe(false);
  });

  it("returns true for a signed-in admin", async () => {
    vi.mocked(hasSupabase).mockReturnValue(true);
    vi.mocked(createClient).mockResolvedValue(
      fakeSupabase({ user: { id: "u1" }, role: "admin" }) as never,
    );
    expect(await isAdmin()).toBe(true);
  });

  it("returns false for a signed-in non-admin", async () => {
    vi.mocked(hasSupabase).mockReturnValue(true);
    vi.mocked(createClient).mockResolvedValue(
      fakeSupabase({ user: { id: "u1" }, role: "customer" }) as never,
    );
    expect(await isAdmin()).toBe(false);
  });

  it("fails closed (false) if the Supabase client throws", async () => {
    vi.mocked(hasSupabase).mockReturnValue(true);
    vi.mocked(createClient).mockRejectedValue(new Error("network down"));
    expect(await isAdmin()).toBe(false);
  });
});
