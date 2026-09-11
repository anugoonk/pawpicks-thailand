"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabase } from "@/lib/env";

type State = "idle" | "sending" | "sent" | "error";

export function SignInForm({ hadError }: { hadError?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  if (!hasSupabase()) {
    return (
      <p style={{ color: "var(--muted)" }}>
        ระบบบัญชียังไม่พร้อมใช้งานในสภาพแวดล้อมนี้
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === "sending") return;
    setState("sending");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setState(error ? "error" : "sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="auth-note">
        <p>
          ส่งลิงก์เข้าสู่ระบบไปที่ <strong>{email}</strong> แล้ว
        </p>
        <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>
          เปิดอีเมลแล้วกดลิงก์เพื่อเข้าสู่ระบบ (ลิงก์ใช้ได้ครั้งเดียว)
        </p>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label htmlFor="auth-email">อีเมลของคุณ</label>
      <input
        id="auth-email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="primary-button" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "กำลังส่งลิงก์…" : "ส่งลิงก์เข้าสู่ระบบ"}
      </button>
      {(state === "error" || hadError) && (
        <p className="auth-error" role="alert">
          ไม่สามารถส่งลิงก์ได้ กรุณาตรวจสอบอีเมลแล้วลองใหม่
        </p>
      )}
    </form>
  );
}
