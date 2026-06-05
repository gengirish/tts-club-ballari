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
        "Incorrect email/username or password. If you just signed up, use the same details on the Password tab."
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
      setSuccess("Account created successfully! Use the Password tab to sign in with your email or username.");
      setTab("password");
      setIdentifier(loginId);
      setPassword("");
      setError(null);
    } catch (e) {
      setError(
        e instanceof Error && e.message === "SIGN_IN_TIMEOUT"
          ? "Account may have been created, but sign-in timed out. Open Password and try logging in."
          : "Could not finish sign-up. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const tabBtn = (
    t: Tab,
    label: string,
    testId: string,
    Icon: typeof IconLock
  ) => (
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
        setSuccess(null);
        if (t !== "magic") {
          setMagicLinkSent(false);
          setMagicLinkSentTo("");
        }
      }}
      className={`flex min-h-[44px] w-full min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 rounded-full py-2.5 text-[0.7rem] font-bold leading-tight transition-colors duration-200 sm:gap-1.5 sm:text-xs ${
        tab === t
          ? "bg-energy text-white shadow-md shadow-violet/30"
          : "border border-paper-deep bg-paper-raised text-ink/80 hover:border-violet/30 hover:bg-paper-muted/80"
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
        <div className="rounded-screen border border-steel/35 bg-paper-raised/92 p-6 shadow-xl shadow-violet/10 backdrop-blur-md sm:p-8">
          <h1 className="font-display text-3xl uppercase leading-tight text-violet sm:text-4xl">
            Welcome, strider
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            Sign in with a one-time email link, or email or username with a password. New here? Use <strong className="font-semibold text-ink/85">Sign up</strong>.
          </p>

          <div
            className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:flex sm:flex-nowrap"
            role="tablist"
            aria-label="Sign in method"
          >
            {tabBtn("password", "Password", "login-tab-password", IconLock)}
            {tabBtn("magic", "Email link", "login-tab-magic", IconMail)}
            {tabBtn("register", "Sign up", "login-tab-register", IconUserPlus)}
          </div>

          <div
            id={`${baseId}-panel`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${tab}`}
            aria-busy={loading}
            className="mt-6"
          >
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
                  className="w-full cursor-pointer rounded-full bg-energy py-3.5 font-extrabold text-white shadow-md shadow-violet/25 transition-[filter,transform] duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-safe:active:scale-[0.99]"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </>
            )}

            {tab === "magic" && (
              <>
                {magicLinkSent ? (
                  <div
                    className="rounded-card border border-violet/30 bg-violet/5 px-4 py-4 text-sm leading-relaxed text-ink/85"
                    role="status"
                  >
                    <p className="font-display text-lg font-bold uppercase tracking-wide text-violet">
                      Check your email
                    </p>
                    <p className="mt-2">
                      We sent a sign-in link to{" "}
                      <strong className="font-semibold text-ink">{magicLinkSentTo || magicEmail}</strong>. Open it on
                      this device to continue. If you do not see it, check spam or promotions.
                    </p>
                    <p className="mt-2 text-xs text-ink/60">
                      Email links only work for accounts registered with that address. Use Password sign-in if you
                      signed up with a username only.
                    </p>
                    <button
                      type="button"
                      data-testid="login-magic-reset"
                      onClick={() => {
                        setMagicLinkSent(false);
                        setMagicEmail("");
                        setError(null);
                      }}
                      className="mt-4 w-full cursor-pointer rounded-full border border-paper-deep bg-paper-raised py-2.5 text-sm font-bold text-ink/85 transition-colors duration-200 hover:border-violet/35 hover:bg-paper-muted/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2"
                    >
                      Use a different email
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="mb-3 text-xs leading-relaxed text-ink/65">
                      No password needed — we email you a one-time link. It expires after a short time.
                    </p>
                    <label htmlFor="login-magic-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink/55">
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
                      className="w-full cursor-pointer rounded-full bg-energy py-3.5 font-extrabold text-white shadow-md shadow-violet/25 transition-[filter,transform] duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-safe:active:scale-[0.99]"
                    >
                      {loading ? "Sending link…" : "Email me a link"}
                    </button>
                  </>
                )}
              </>
            )}

            {tab === "register" && (
              <>
                <p className="mb-3 text-xs leading-relaxed text-ink/65">
                  Use at least one of email or username (you can set both). Username: letters, numbers,{" "}
                  <strong className="font-semibold text-ink/80">dot</strong>, or underscore — no spaces.
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
                  placeholder="e.g. girish_h or girish.h (no spaces)"
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
