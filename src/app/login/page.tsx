"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestOtp() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const body = await res.json();
    setLoading(false);
    if (body.ok) setStage("otp");
    else setError(body.error?.message ?? "Could not send OTP");
  }

  async function verify() {
    setLoading(true);
    setError(null);
    const res = await signIn("phone-otp", { phone, code, redirect: false });
    setLoading(false);
    if (res?.ok) window.location.href = "/app";
    else setError("Invalid or expired code");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl uppercase text-violet">Welcome, sister</h1>
        <p className="text-ink/60 mt-1 mb-6 text-sm">Log in with your mobile number.</p>

        {stage === "phone" ? (
          <>
            <input
              className="w-full border border-paper-deep rounded-card px-4 py-3 mb-3"
              placeholder="+91 9XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              onClick={requestOtp}
              disabled={loading}
              className="w-full bg-energy text-white font-extrabold rounded-full py-3 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <input
              className="w-full border border-paper-deep rounded-card px-4 py-3 mb-3 tracking-[0.3em] text-center"
              placeholder="••••••"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              onClick={verify}
              disabled={loading}
              className="w-full bg-energy text-white font-extrabold rounded-full py-3 disabled:opacity-60"
            >
              {loading ? "Verifying…" : "Verify & continue"}
            </button>
          </>
        )}

        {error && <p className="text-magenta mt-3 text-sm font-semibold">{error}</p>}
      </div>
    </main>
  );
}
