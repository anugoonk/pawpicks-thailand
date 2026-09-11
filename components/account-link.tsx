"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { hasSupabase } from "@/lib/env";

/** Header link to /account. The glyph fills in once the session is known. */
export function AccountLink() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    if (!hasSupabase()) {
      setSignedIn(false);
      return;
    }
    let active = true;
    let unsub: (() => void) | undefined;

    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth
        .getUser()
        .then(({ data }) => {
          if (active) setSignedIn(Boolean(data.user));
        })
        .catch(() => active && setSignedIn(false));
      const { data } = supabase.auth.onAuthStateChange((_e, session) => {
        if (active) setSignedIn(Boolean(session?.user));
      });
      unsub = () => data.subscription.unsubscribe();
    });

    return () => {
      active = false;
      unsub?.();
    };
  }, []);

  return (
    <Link
      className="icon-button account-link"
      href="/account"
      aria-label={signedIn ? "บัญชีของฉัน" : "เข้าสู่ระบบ"}
    >
      <span aria-hidden="true">{signedIn ? "👤" : "🔑"}</span>
    </Link>
  );
}
