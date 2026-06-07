"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { magicLinkEmailSchema } from "@/lib/validation/auth";
import { signInEmailPasswordWithTimeout } from "@/lib/client/sign-in-email-password";

type Tab = "password" | "magic" | "register";

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

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function friendlyAuthCallbackError(code: string | undefined): string {
  switch (code) {
    case "Configuration":
    case "CallbackRouteError":
    case "AccessDenied":
      return "Sign-in is temporarily unavailable. Please try again shortly or use password sign-in.";
    case "CredentialsSignin":
      return "Invalid email/username or password.";
    default:
      return "Sign-in failed. Try again or use password sign-in.";
  }
}

function friendlyMagicLinkError(code: string | undefined): string {
  switch (code) {
    case "EmailSignin":
      return "We couldn't send a sign-in link. If you don't have an account yet, use Sign up first. Otherwise check the email address or try password sign-in.";
    case "Configuration":
      return "Sign-in is temporarily unavailable. Please try again later or use another method.";
    case "AccessDenied":
      return "This email cannot be used for a magic link right now. Try another method or contact support.";
    case "OAuthAccountNotLinked":
      return "This email is linked to another sign-in method. Use password sign-in instead.";
    default:
      return "Something went wrong sending the link. Please try again or use password sign-in.";
  }
}

const inputClass =
  "w-full rounded-card border border-paper-deep bg-paper-muted px-4 py-3.5 pl-11 text-ink shadow-sm placeholder:text-ink/45 transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:opacity-60";

const inputNoIconClass =
  "w-full rounded-card border border-paper-deep bg-paper-muted px-4 py-3.5 text-ink shadow-sm placeholder:text-ink/45 transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:opacity-60";

export default function LoginPage() {
  const router = useRouter();
  const baseId = useId();
  const [tab, setTab] = useState<Tab>("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkSentTo, setMagicLinkSentTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) setError(friendlyAuthCallbackError(err));
  }, []);

  async function passwordLogin() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    if (!identifier.trim() || !password) {
      setError("Enter your email or username and password.");
      setLoading(false);
      return;
    }
    try {
      const res = await signInEmailPasswordWithTimeout(identifier, password);
      if (res?.ok) {
        const session = await getSession();
        if (session?.user) {
          router.replace("/app");
          router.refresh();
          return;
        }
        setError(
          "Sign-in could not start a session on this device. Try again, or clear cookies for this site and retry."
        );
        return;
      }
      setError(
        "Incorrect email/username or password. If you just signed up, use the same email or username you registered with."
      );
    } catch (e) {
      setError(
        e instanceof Error && e.message === "SIGN_IN_TIMEOUT"
          ? "Sign-in timed out. Check your connection and try again."
          : "Sign-in failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function sendMagicLink() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setMagicLinkSent(false);
    setMagicLinkSentTo("");
    const parsed = magicLinkEmailSchema.safeParse({ email: magicEmail });
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors.email?.[0] ?? "Enter a valid email address.";
      setError(msg);
      setLoading(false);
      return;
    }
    const normalizedEmail = parsed.data.email;
    const res = await signIn("magic-link", {
      email: normalizedEmail,
      callbackUrl: "/app",
      redirect: false,
    });
    setLoading(false);
    const verifyUrl = typeof res?.url === "string" && res.url.includes("/login/verify-request");
    if (res?.ok || verifyUrl) {
      setMagicLinkSent(true);
      setMagicLinkSentTo(normalizedEmail);
      return;
    }
    setError(friendlyMagicLinkError(res?.error ?? undefined));
  }

  async function register() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const payload: Record<string, string> = {
      password: regPassword,
    };
    if (regEmail.trim()) payload.email = regEmail.trim();
    if (regUsername.trim()) payload.username = regUsername.trim();
    if (regName.trim()) payload.name = regName.trim();

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!body.ok) {
        setError(body.error?.message ?? "Could not create account");
        return;
      }
      const loginId = regEmail.trim()
        ? regEmail.trim().toLowerCase()
        : regUsername.trim().toLowerCase();
      setSuccess("Account created successfully! Signing you in…");
      const sign = await signInEmailPasswordWithTimeout(loginId, regPassword);
      if (sign?.ok) {
        const session = await getSession();
        if (session?.user) {
          router.replace("/app");
          router.refresh();
          return;
        }
      }
      setSuccess("Account created! Sign in below with your email or username.");
      setTab("password");
      setIdentifier(loginId);
      setPassword("");
      setError(null);
    } catch (e) {
      setError(
        e instanceof Error && e.message === "SIGN_IN_TIMEOUT"
          ? "Account may have been created, but sign-in timed out. Try signing in again below."
          : "Could not finish sign-up. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function goTab(next: Tab) {
    setTab(next);
    setError(null);
    setSuccess(null);
    if (next !== "magic") {
      setMagicLinkSent(false);
      setMagicLinkSentTo("");
    }
  }

  const secondaryLinkClass =
    "cursor-pointer text-left text-sm font-medium text-ink/55 underline-offset-2 transition-colors hover:text-ink/80 hover:underline disabled:pointer-events-none disabled:opacity-50";

  return (
    <main className="min-h-screen bg-paper px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-sm">
        <div className="rounded-2xl border border-steel/20 bg-paper-raised px-6 py-8 sm:px-8">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {tab === "register" ? "Join" : "Sign in"}
          </h1>
          {tab === "password" ? (
            <p className="mt-1.5 text-sm text-ink/60">
              Use the email or username you registered with, or your exact display name if it is unique on your
              account.
            </p>
          ) : null}
          {tab === "magic" && !magicLinkSent ? (
            <p className="mt-1.5 text-sm text-ink/60">We will email you a one-time link (no password).</p>
          ) : null}
          {tab === "magic" && magicLinkSent ? (
            <p className="mt-1.5 text-sm text-ink/60">Open the link from your email on this device.</p>
          ) : null}

          <div id={`${baseId}-panel`} aria-busy={loading} className="mt-8">
            {tab === "password" && (
              <>
                <label htmlFor="login-identifier" className="mb-1.5 block text-xs font-medium text-ink/50">
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
                <label htmlFor="login-password-field" className="mb-1.5 block text-xs font-medium text-ink/50">
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
                <p className="mb-4 text-right text-xs font-semibold">
                  <Link
                    href="/login/forgot-password"
                    className="text-violet-soft underline-offset-2 hover:underline"
                    data-testid="login-forgot-password-link"
                  >
                    Forgot password?
                  </Link>
                </p>
                <button
                  type="button"
                  data-testid="login-password-submit"
                  onClick={() => void passwordLogin()}
                  disabled={loading}
                  className="w-full cursor-pointer rounded-full bg-energy py-3.5 font-semibold text-white transition-[filter] duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>

                <nav className="mt-8 flex flex-col gap-3 border-t border-steel/15 pt-6" aria-label="Other sign-in options">
                  <button type="button" data-testid="login-tab-magic" disabled={loading} onClick={() => goTab("magic")} className={secondaryLinkClass}>
                    Email link
                  </button>
                  <button
                    type="button"
                    data-testid="login-tab-register"
                    disabled={loading}
                    onClick={() => goTab("register")}
                    className={secondaryLinkClass}
                  >
                    Join
                  </button>
                </nav>
              </>
            )}

            {tab === "magic" && (
              <>
                {magicLinkSent ? (
                  <div className="rounded-xl border border-steel/20 bg-paper-muted/40 px-4 py-4 text-sm leading-relaxed text-ink/85" role="status">
                    <p className="font-medium text-ink">Check your email</p>
                    <p className="mt-2 text-ink/75">
                      We sent a link to <strong className="font-medium text-ink">{magicLinkSentTo || magicEmail}</strong>. Open
                      it on this device. Check spam if needed.
                    </p>
                    <p className="mt-2 text-xs text-ink/55">
                      Links only work for accounts with that email. Username-only accounts should use password sign-in.
                    </p>
                    <button
                      type="button"
                      data-testid="login-magic-reset"
                      onClick={() => {
                        setMagicLinkSent(false);
                        setMagicEmail("");
                        setError(null);
                      }}
                      className="mt-4 w-full rounded-lg border border-steel/25 bg-paper-raised py-2.5 text-sm font-medium text-ink/80 transition-colors hover:border-steel/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2"
                    >
                      Use a different email
                    </button>
                    <button type="button" data-testid="login-tab-password" onClick={() => goTab("password")} className={`${secondaryLinkClass} mt-4 w-full text-center`}>
                      ← Sign in
                    </button>
                  </div>
                ) : (
                  <>
                    <button type="button" data-testid="login-tab-password" onClick={() => goTab("password")} className={`${secondaryLinkClass} mb-5`}>
                      ← Sign in
                    </button>
                    <label htmlFor="login-magic-email" className="mb-1.5 block text-xs font-medium text-ink/50">
                      Email
                    </label>
                    <div className="relative mb-4">
                      <IconMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-violet/70" />
                      <input
                        id="login-magic-email"
                        data-testid="login-magic-email"
                        type="email"
                        className={inputClass}
                        placeholder="you@example.com"
                        value={magicEmail}
                        onChange={(e) => setMagicEmail(e.target.value)}
                        autoComplete="email"
                        disabled={loading}
                      />
                    </div>
                    <button
                      type="button"
                      data-testid="login-magic-submit"
                      onClick={() => void sendMagicLink()}
                      disabled={loading}
                      className="mt-2 w-full cursor-pointer rounded-full bg-energy py-3.5 font-semibold text-white transition-[filter] duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Sending link…" : "Email me a link"}
                    </button>
                  </>
                )}
              </>
            )}

            {tab === "register" && (
              <>
                <button type="button" data-testid="login-tab-password" onClick={() => goTab("password")} className={`${secondaryLinkClass} mb-6`}>
                  ← Sign in
                </button>
                <div className="flex flex-col gap-3">
                  <label htmlFor="register-email" className="sr-only">
                    Email (optional if you set a username)
                  </label>
                  <input
                    id="register-email"
                    data-testid="register-email"
                    className={inputNoIconClass}
                    placeholder="Email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    autoComplete="email"
                    disabled={loading}
                  />
                  <label htmlFor="register-username" className="sr-only">
                    Username (optional if you set an email; letters, numbers, dot, underscore)
                  </label>
                  <input
                    id="register-username"
                    data-testid="register-username"
                    className={inputNoIconClass}
                    placeholder="Username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    autoComplete="username"
                    disabled={loading}
                  />
                  <label htmlFor="register-name" className="sr-only">
                    Display name (optional)
                  </label>
                  <input
                    id="register-name"
                    data-testid="register-name"
                    className={inputNoIconClass}
                    placeholder="Name (optional)"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    disabled={loading}
                  />
                  <label htmlFor="register-password-field" className="sr-only">
                    Password (at least 8 characters)
                  </label>
                  <input
                    id="register-password-field"
                    data-testid="register-password"
                    type="password"
                    className={inputNoIconClass}
                    placeholder="Password (8+ characters)"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>
                <button
                  type="button"
                  data-testid="register-submit"
                  onClick={() => void register()}
                  disabled={loading}
                  className="mt-5 w-full cursor-pointer rounded-full bg-energy py-3.5 font-semibold text-white transition-[filter] duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Create member account"
                >
                  {loading ? "Joining…" : "Join"}
                </button>
              </>
            )}
          </div>

          {success ? (
            <p
              className="mt-4 rounded-card border border-progress/35 bg-progress/10 px-3 py-2 text-sm font-semibold text-progress"
              role="status"
              data-testid="login-form-success"
            >
              {success}
            </p>
          ) : null}

          {error ? (
            <p
              className="mt-4 rounded-card border border-magenta/25 bg-magenta/5 px-3 py-2 text-sm font-semibold text-magenta"
              role="alert"
              data-testid="login-form-error"
            >
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
