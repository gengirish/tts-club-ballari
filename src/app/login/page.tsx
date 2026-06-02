"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { requestOtpSchema, verifyOtpSchema } from "@/lib/validation/auth";

type Tab = "phone" | "password" | "register";

export default function LoginPage() {
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

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl uppercase text-violet">Welcome, sister</h1>
        <p className="text-ink/60 mt-1 mb-4 text-sm">
          Log in with your mobile (OTP) or email / username and password.
        </p>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            data-testid="login-tab-phone"
            onClick={() => {
              setTab("phone");
              setError(null);
            }}
            className={`flex-1 rounded-full py-2 text-sm font-bold ${
              tab === "phone" ? "bg-energy text-white" : "bg-paper-deep text-ink/70"
            }`}
          >
            Phone OTP
          </button>
          <button
            type="button"
            data-testid="login-tab-password"
            onClick={() => {
              setTab("password");
              setError(null);
            }}
            className={`flex-1 rounded-full py-2 text-sm font-bold ${
              tab === "password" ? "bg-energy text-white" : "bg-paper-deep text-ink/70"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            data-testid="login-tab-register"
            onClick={() => {
              setTab("register");
              setError(null);
            }}
            className={`flex-1 rounded-full py-2 text-sm font-bold ${
              tab === "register" ? "bg-energy text-white" : "bg-paper-deep text-ink/70"
            }`}
          >
            Sign up
          </button>
        </div>

        {tab === "phone" && (
          <>
            {stage === "phone" ? (
              <>
                <input
                  data-testid="login-phone"
                  className="w-full border border-paper-deep rounded-card px-4 py-3 mb-3"
                  placeholder="+91 9XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <button
                  type="button"
                  data-testid="login-send-otp"
                  onClick={requestOtp}
                  disabled={loading}
                  className="w-full bg-energy text-white font-extrabold rounded-full py-3 disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Send OTP"}
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-ink/65 mb-3 leading-relaxed">
                  Code arrives on WhatsApp. If you tap &quot;Send again&quot;, your previous code stops working — use
                  only the newest 6 digits.
                </p>
                <input
                  data-testid="login-otp"
                  className="w-full border border-paper-deep rounded-card px-4 py-3 mb-3 tracking-[0.3em] text-center"
                  placeholder="••••••"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
                <button
                  type="button"
                  data-testid="login-verify"
                  onClick={verifyOtpLogin}
                  disabled={loading}
                  className="w-full bg-energy text-white font-extrabold rounded-full py-3 disabled:opacity-60"
                >
                  {loading ? "Verifying…" : "Verify & continue"}
                </button>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    data-testid="login-resend-otp"
                    onClick={() => void requestOtp()}
                    disabled={loading}
                    className="flex-1 rounded-full border border-paper-deep py-2 text-sm font-bold text-ink/80 disabled:opacity-60"
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
                    className="flex-1 rounded-full border border-paper-deep py-2 text-sm font-bold text-ink/80 disabled:opacity-60"
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
            <input
              data-testid="login-identifier"
              className="w-full border border-paper-deep rounded-card px-4 py-3 mb-3"
              placeholder="Email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />
            <input
              data-testid="login-password"
              type="password"
              className="w-full border border-paper-deep rounded-card px-4 py-3 mb-3"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              data-testid="login-password-submit"
              onClick={passwordLogin}
              disabled={loading}
              className="w-full bg-energy text-white font-extrabold rounded-full py-3 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </>
        )}

        {tab === "register" && (
          <>
            <p className="text-ink/60 text-xs mb-3">Use at least one of email or username (you can use both).</p>
            <input
              data-testid="register-email"
              className="w-full border border-paper-deep rounded-card px-4 py-3 mb-3"
              placeholder="Email (optional if you set username)"
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              data-testid="register-username"
              className="w-full border border-paper-deep rounded-card px-4 py-3 mb-3"
              placeholder="Username (optional if you set email)"
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
              autoComplete="username"
            />
            <input
              data-testid="register-name"
              className="w-full border border-paper-deep rounded-card px-4 py-3 mb-3"
              placeholder="Display name (optional)"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
            />
            <input
              data-testid="register-password"
              type="password"
              className="w-full border border-paper-deep rounded-card px-4 py-3 mb-3"
              placeholder="Password (min 8 characters)"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              data-testid="register-submit"
              onClick={register}
              disabled={loading}
              className="w-full bg-energy text-white font-extrabold rounded-full py-3 disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create account"}
            </button>
          </>
        )}

        {error && <p className="text-magenta mt-3 text-sm font-semibold">{error}</p>}
      </div>
    </main>
  );
}
