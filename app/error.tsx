"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Root error boundary — catches anything an uncaught Server/Client Component
 * error would otherwise show as Next.js's default (unstyled, English) error
 * screen. Never renders `error.message` — it can carry internal details.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled page error:", error);
  }, [error]);

  return (
    <main id="top">
      <section className="section" style={{ textAlign: "center" }}>
        <p className="eyebrow" style={{ color: "var(--muted)" }}>
          เกิดข้อผิดพลาด
        </p>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", margin: "12px 0" }}>
          ขออภัย มีบางอย่างผิดพลาด
        </h1>
        <p style={{ color: "var(--muted)" }}>
          กรุณาลองใหม่อีกครั้ง หากยังไม่หาย ลองกลับมาใหม่ภายหลัง
        </p>
        {error.digest ? (
          <p style={{ color: "var(--muted)", fontSize: ".75rem", marginTop: 6 }}>
            รหัสอ้างอิง: {error.digest}
          </p>
        ) : null}
        <p
          style={{
            marginTop: 24,
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button className="primary-button" onClick={() => reset()}>
            ลองใหม่ <span>↻</span>
          </button>
          <Link
            className="primary-button"
            href="/"
            style={{ background: "#fff", color: "var(--ink)", border: "1px solid var(--line)" }}
          >
            กลับหน้าแรก
          </Link>
        </p>
      </section>
    </main>
  );
}
