"use client";

import { useId, useState } from "react";
import { signIn } from "next-auth/react";
import { requestOtpSchema, verifyOtpSchema } from "@/lib/validation/auth";

type Tab = "phone" | "password" | "register";

function IconPhone({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.6 3h3.2c.3 0 .6.2.7.5l1 2.7c.1.3 0 .6-.2.8l-1.9 1.9c.9 1.8 2.4 3.3 4.2 4.2l1.9-1.9c.2-.2.5-.3.8-.2l2.7 1c.3.1.5.4.5.7v3.2c0 1.2-1 2.2-2.2 2.2C9.4 21 3 14.6 3 6.6 3 5.4 4 4.4 5.2 4.4H6.6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconUserPlus({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const inputClass =
  "w-full rounded-card border border-paper-deep bg-white px-4 py-3.5 pl-11 text-ink shadow-sm placeholder:text-ink/45 transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:opacity-60";

const inputNoIconClass =
  "w-full rounded-card border border-paper-deep bg-white px-4 py-3.5 text-ink shadow-sm placeholder:text-ink/45 transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:opacity-60";

export default function LoginPage() {
  const baseId = useId();
  const [tab, setTab] = useState<Tab>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestOtp() {
    setLoading(true);
    setError(null);
    const parsed = requestOtpSchema.safeParse({ phone });
    if (!parsed.success) {
      const msg =
        parsed.error.flatten().fieldErrors.phone?.[0] ?? "Enter a valid mobile number.";
      setError(msg);
      setLoading(false);
      return;
    }
    const res = await fetch("/api/auth/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: parsed.data.phone }),
    });
    const body = await res.json();
    setLoading(false);
    if (body.ok) {
      setStage("otp");
      setCode("");
      return;
    }
    if (body.error?.code === "RATE_LIMITED") {
      setError(body.error?.message ?? "Too many attempts. Please try again later.");
      return;
    }
    setError(body.error?.message ?? "Could not send OTP");
  }

  async function verifyOtpLogin() {
    setLoading(true);
    setError(null);
    const parsed = verifyOtpSchema.safeParse({ phone, code });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setError(flat.code?.[0] ?? flat.phone?.[0] ?? "Enter the 6-digit code from WhatsApp.");
      setLoading(false);
      return;
    }
    const res = await signIn("phone-otp", {
      phone: parsed.data.phone,
      code: parsed.data.code,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) window.location.href = "/app";
    else
      setError(
        "Invalid or expired code, or too many tries for this number. Wait a few minutes and request a new code if needed."
      );
  }

  async function passwordLogin() {
    setLoading(true);
    setError(null);
    const res = await signIn("email-password", {
      identifier,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) window.location.href = "/app";
    else setError("Invalid email/username or password");
  }

  async function register() {
    setLoading(true);
    setError(null);
    const payload: Record<string, string> = {
      password: regPassword,
    };
    if (regEmail.trim()) payload.email = regEmail.trim();
    if (regUsername.trim()) payload.username = regUsername.trim();
    if (regName.trim()) payload.name = regName.trim();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    if (!body.ok) {
      setLoading(false);
      setError(body.error?.message ?? "Could not create account");
      return;
    }
    const loginId = regEmail.trim()
      ? regEmail.trim().toLowerCase()
      : regUsername.trim().toLowerCase();
    const sign = await signIn("email-password", {
      identifier: loginId,
      password: regPassword,
      redirect: false,
    });
    setLoading(false);
    if (sign?.ok) window.location.href = "/app";
    else setError("Account created but sign-in failed. Try logging in.");
  }

  const tabBtn = (t: Tab, label: string, testId: string, Icon: typeof IconPhone) => (
    <button
      type="button"
      data-testid={testId}
      role="tab"
      aria-selected={tab === t}
      id={`${baseId}-tab-${t}`}
      aria-controls={`${baseId}-panel`}
      onClick={() => {
        setTab(t);
        setError(null);
      }}
      className={`flex min-h-[44px] min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 rounded-full py-2.5 text-[0.7rem] font-bold leading-tight transition-colors duration-200 sm:gap-1.5 sm:text-xs ${
        tab === t
          ? "bg-energy text-white shadow-md shadow-violet/30"
          : "border border-paper-deep bg-white text-ink/80 hover:border-violet/30 hover:bg-paper-deep/60"
      }`}
    >
      <Icon className={`shrink-0 ${tab === t ? "text-white" : "text-violet"}`} />
      <span className="truncate text-center">{label}</span>
    </button>
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper px-4 py-10 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 motion-reduce:opacity-25"
        aria-hidden
      >
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-energy-soft blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-violet/20 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <div className="rounded-screen border border-white/60 bg-white/90 p-6 shadow-xl shadow-violet/10 backdrop-blur-md sm:p-8">
          <h1 className="font-display text-3xl uppercase leading-tight text-violet sm:text-4xl">
            Welcome, sister
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            Log in with your mobile (WhatsApp OTP) or use email or username with a password.
          </p>

          <div
            className="mt-6 flex gap-2"
            role="tablist"
            aria-label="Sign in method"
          >
            {tabBtn("phone", "Phone OTP", "login-tab-phone", IconPhone)}
            {tabBtn("password", "Password", "login-tab-password", IconLock)}
            {tabBtn("register", "Sign up", "login-tab-register", IconUserPlus)}
          </div>

          <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${tab}`} aria-busy={loading} className="mt-6">
            {tab === "phone" && (
              <>
                {stage === "phone" ? (
                  <>
                    <label htmlFor="login-phone" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink/55">
                      Mobile number
                    </label>
                    <div className="relative mb-4">
                      <IconPhone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-violet/70" />
                      <input
                        id="login-phone"
                        data-testid="login-phone"
                        className={inputClass}
                        placeholder="+91 9XXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                        inputMode="tel"
                        disabled={loading}
                      />
                    </div>
                    <button
                      type="button"
                      data-testid="login-send-otp"
                      onClick={() => void requestOtp()}
                      disabled={loading}
                      className="w-full cursor-pointer rounded-full bg-energy py-3.5 font-extrabold text-white shadow-md shadow-violet/25 transition-[filter,transform] duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-safe:active:scale-[0.99]"
                    >
                      {loading ? "Sending…" : "Send OTP"}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="mb-3 text-xs leading-relaxed text-ink/65">
                      Code arrives on WhatsApp. If you tap &quot;Send again&quot;, your previous code stops working —
                      use only the newest 6 digits.
                    </p>
                    <label htmlFor="login-otp" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink/55">
                      One-time code
                    </label>
                    <input
                      id="login-otp"
                      data-testid="login-otp"
                      className={`${inputNoIconClass} mb-4 text-center tracking-[0.35em]`}
                      placeholder="••••••"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      data-testid="login-verify"
                      onClick={() => void verifyOtpLogin()}
                      disabled={loading}
                      className="w-full cursor-pointer rounded-full bg-energy py-3.5 font-extrabold text-white shadow-md shadow-violet/25 transition-[filter,transform] duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-safe:active:scale-[0.99]"
                    >
                      {loading ? "Verifying…" : "Verify & continue"}
                    </button>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        data-testid="login-resend-otp"
                        onClick={() => void requestOtp()}
                        disabled={loading}
                        className="min-h-[44px] flex-1 cursor-pointer rounded-full border border-paper-deep bg-white py-2.5 text-sm font-bold text-ink/85 transition-colors duration-200 hover:border-violet/35 hover:bg-paper-deep/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Send again
                      </button>
                      <button
                        type="button"
                        data-testid="login-change-number"
                        onClick={() => {
                          setStage("phone");
                          setCode("");
                          setError(null);
                        }}
                        disabled={loading}
                        className="min-h-[44px] flex-1 cursor-pointer rounded-full border border-paper-deep bg-white py-2.5 text-sm font-bold text-ink/85 transition-colors duration-200 hover:border-violet/35 hover:bg-paper-deep/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Change number
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {tab === "password" && (
              <>
                <label htmlFor="login-identifier" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink/55">
                  Email or username
                </label>
                <div className="relative mb-3">
                  <IconUserPlus className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-violet/70" />
                  <input
                    id="login-identifier"
                    data-testid="login-identifier"
                    className={inputClass}
                    placeholder="you@example.com or yourname"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
                <label htmlFor="login-password-field" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink/55">
                  Password
                </label>
                <div className="relative mb-4">
                  <IconLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-violet/70" />
                  <input
                    id="login-password-field"
                    data-testid="login-password"
                    type="password"
                    className={inputClass}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                </div>
                <button
                  type="button"
                  data-testid="login-password-submit"
                  onClick={() => void passwordLogin()}
                  disabled={loading}
                  className="w-full cursor-pointer rounded-full bg-energy py-3.5 font-extrabold text-white shadow-md shadow-violet/25 transition-[filter,transform] duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-safe:active:scale-[0.99]"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </>
            )}

            {tab === "register" && (
              <>
                <p className="mb-3 text-xs leading-relaxed text-ink/65">
                  Use at least one of email or username (you can set both).
                </p>
                <label htmlFor="register-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink/55">
                  Email
                </label>
                <input
                  id="register-email"
                  data-testid="register-email"
                  className={`${inputNoIconClass} mb-3`}
                  placeholder="Optional if you choose a username"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                />
                <label htmlFor="register-username" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink/55">
                  Username
                </label>
                <input
                  id="register-username"
                  data-testid="register-username"
                  className={`${inputNoIconClass} mb-3`}
                  placeholder="letters, numbers, underscore"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  autoComplete="username"
                  disabled={loading}
                />
                <label htmlFor="register-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink/55">
                  Display name
                </label>
                <input
                  id="register-name"
                  data-testid="register-name"
                  className={`${inputNoIconClass} mb-3`}
                  placeholder="Optional"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  disabled={loading}
                />
                <label htmlFor="register-password-field" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink/55">
                  Password
                </label>
                <input
                  id="register-password-field"
                  data-testid="register-password"
                  type="password"
                  className={`${inputNoIconClass} mb-4`}
                  placeholder="At least 8 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  data-testid="register-submit"
                  onClick={() => void register()}
                  disabled={loading}
                  className="w-full cursor-pointer rounded-full bg-energy py-3.5 font-extrabold text-white shadow-md shadow-violet/25 transition-[filter,transform] duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-safe:active:scale-[0.99]"
                >
                  {loading ? "Creating…" : "Create account"}
                </button>
              </>
            )}
          </div>

          {error ? (
            <p className="mt-4 rounded-card border border-magenta/25 bg-magenta/5 px-3 py-2 text-sm font-semibold text-magenta" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
