"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const inputClass =
  "w-full rounded-card border border-paper-deep bg-paper-muted px-4 py-3.5 text-ink shadow-sm placeholder:text-ink/45 transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:opacity-60";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token")?.trim() ?? "");
  }, []);

  async function submit() {
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("Missing reset token. Please request a new password reset link.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) {
        setError(body?.error?.message ?? "Could not reset password. Request a new link and try again.");
        return;
      }
      setSuccess(body.data?.message ?? "Password updated. You can now sign in.");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Could not reset password. Check your connection and try again.");
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
          <h1 className="font-display text-3xl uppercase leading-tight text-violet sm:text-4xl">Reset password</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            Choose a new password for your SSS Club account.
          </p>

          <label htmlFor="reset-password-new" className="mt-6 mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink/55">
            New password
          </label>
          <input
            id="reset-password-new"
            data-testid="reset-password-new"
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            disabled={loading}
          />

          <label htmlFor="reset-password-confirm" className="mt-4 mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink/55">
            Confirm password
          </label>
          <input
            id="reset-password-confirm"
            data-testid="reset-password-confirm"
            type="password"
            className={inputClass}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            autoComplete="new-password"
            disabled={loading}
          />

          <button
            type="button"
            data-testid="reset-password-submit"
            onClick={() => void submit()}
            disabled={loading}
            className="mt-4 w-full cursor-pointer rounded-full bg-energy py-3.5 font-extrabold text-white shadow-md shadow-violet/25 transition-[filter,transform] duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update password"}
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
            Need a fresh link?{" "}
            <Link href="/login/forgot-password" className="font-bold text-violet-soft underline-offset-2 hover:underline">
              Request reset
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-ink/65">
            <Link href="/login" className="font-bold text-violet-soft underline-offset-2 hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
