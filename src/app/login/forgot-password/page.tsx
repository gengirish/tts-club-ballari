"use client";

import Link from "next/link";
import { useState } from "react";
import { forgotPasswordRequestSchema } from "@/lib/validation/auth";

const inputClass =
  "w-full rounded-card border border-paper-deep bg-paper-muted px-4 py-3.5 text-ink shadow-sm placeholder:text-ink/45 transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:opacity-60";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setSuccess(null);
    const parsed = forgotPasswordRequestSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors.email?.[0] ?? "Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parsed.data.email }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) {
        setError(body?.error?.message ?? "Could not process your request. Please try again.");
        return;
      }
      setSuccess(
        body.data?.message ??
          "If an account with that email exists, we sent a password reset link. Please check your inbox."
      );
    } catch {
      setError("Could not process your request. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-energy-soft blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-violet/20 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <div className="rounded-screen border border-steel/35 bg-paper-raised/92 p-6 shadow-xl shadow-violet/10 backdrop-blur-md sm:p-8">
          <h1 className="font-display text-3xl uppercase leading-tight text-violet sm:text-4xl">Forgot password</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            Enter your account email and we will send you a secure reset link.
          </p>

          <label htmlFor="forgot-password-email" className="mt-6 mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink/55">
            Email
          </label>
          <input
            id="forgot-password-email"
            data-testid="forgot-password-email"
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={loading}
          />

          <button
            type="button"
            data-testid="forgot-password-submit"
            onClick={() => void submit()}
            disabled={loading}
            className="mt-4 w-full cursor-pointer rounded-full bg-energy py-3.5 font-extrabold text-white shadow-md shadow-violet/25 transition-[filter,transform] duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending link..." : "Send reset link"}
          </button>

          {success ? (
            <p className="mt-4 rounded-card border border-progress/35 bg-progress/10 px-3 py-2 text-sm font-semibold text-progress" role="status">
              {success}
            </p>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-card border border-magenta/25 bg-magenta/5 px-3 py-2 text-sm font-semibold text-magenta" role="alert">
              {error}
            </p>
          ) : null}

          <p className="mt-5 text-center text-xs text-ink/65">
            Remembered your password?{" "}
            <Link href="/login" className="font-bold text-violet-soft underline-offset-2 hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
