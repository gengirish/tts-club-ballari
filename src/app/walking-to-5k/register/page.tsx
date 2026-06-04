"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signInEmailPasswordWithTimeout } from "@/lib/client/sign-in-email-password";
import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { registerSchema } from "@/lib/validation/auth";
import type { WalkingTo5kEnrollInput } from "@/lib/validation/walking-to-5k";

type WizardStep = 1 | 2 | 3 | 4;

const inputClass =
  "w-full rounded-card border border-paper-deep bg-paper-muted px-4 py-3 text-ink shadow-sm placeholder:text-ink/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink/55";

function ParqRow({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset className="rounded-card border border-paper-deep/80 bg-paper-raised/60 p-4">
      <legend className="text-sm font-semibold text-ink/90">{label}</legend>
      <div className="mt-3 flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            className="h-4 w-4 accent-violet"
            checked={value === false}
            onChange={() => onChange(false)}
            disabled={disabled}
            name={id}
          />
          No
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            className="h-4 w-4 accent-violet"
            checked={value === true}
            onChange={() => onChange(true)}
            disabled={disabled}
            name={id}
          />
          Yes
        </label>
      </div>
    </fieldset>
  );
}

export default function WalkingTo5kRegisterPage() {
  const baseId = useId();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [step, setStep] = useState<WizardStep>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Account creation (signed-out)
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");

  // Programme form
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [mobile, setMobile] = useState("");
  const [emailExtra, setEmailExtra] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [parqHeartCondition, setParqHeartCondition] = useState(false);
  const [parqChestPainDuringActivity, setParqChestPainDuringActivity] = useState(false);
  const [parqRecentSurgery, setParqRecentSurgery] = useState(false);
  const [parqRegularMedication, setParqRegularMedication] = useState(false);
  const [parqOtherConcerns, setParqOtherConcerns] = useState("");
  const [consentVoluntary, setConsentVoluntary] = useState(false);
  const [consentWithinLimits, setConsentWithinLimits] = useState(false);
  const [orientationWhatsAppJoined, setOrientationWhatsAppJoined] = useState(false);
  const [orientationMedicalSubmitted, setOrientationMedicalSubmitted] = useState(false);

  const sessionEmail = session?.user?.email ?? "";

  const hydrateFromSession = useCallback(() => {
    if (session?.user?.name) setFullName((n) => n || session.user?.name || "");
    if (sessionEmail) setEmailExtra((e) => e || sessionEmail);
  }, [session?.user?.name, sessionEmail]);

  useEffect(() => {
    if (status === "authenticated") hydrateFromSession();
  }, [status, hydrateFromSession]);

  async function createAccount() {
    setLoading(true);
    setError(null);
    const payload: Record<string, string> = { password: regPassword };
    if (regEmail.trim()) payload.email = regEmail.trim();
    if (regUsername.trim()) payload.username = regUsername.trim();
    if (regName.trim()) payload.name = regName.trim();

    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
      const msg =
        parsed.error.flatten().fieldErrors.email?.[0] ??
        parsed.error.flatten().fieldErrors.username?.[0] ??
        parsed.error.flatten().fieldErrors.password?.[0] ??
        "Check email or username and password.";
      setError(msg);
      setLoading(false);
      return;
    }

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
      const sign = await signInEmailPasswordWithTimeout(loginId, regPassword);
      if (sign?.ok) {
        router.replace("/walking-to-5k/register");
        router.refresh();
        return;
      }
      setError("Account created but sign-in failed. Open Sign in below.");
    } catch (e) {
      setError(
        e instanceof Error && e.message === "SIGN_IN_TIMEOUT"
          ? "Account may exist, but sign-in timed out. Use Sign in with your password."
          : "Could not finish sign-up. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function buildPayload(): WalkingTo5kEnrollInput {
    return {
      fullName: fullName.trim(),
      dateOfBirth,
      mobile: mobile.trim(),
      email: emailExtra.trim() || undefined,
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      emergencyRelationship: emergencyRelationship.trim(),
      parqHeartCondition,
      parqChestPainDuringActivity,
      parqRecentSurgery,
      parqRegularMedication,
      parqOtherConcerns: parqOtherConcerns.trim() || undefined,
      consentVoluntary,
      consentWithinLimits,
      orientationWhatsAppJoined,
      orientationMedicalSubmitted,
    };
  }

  async function submitEnrolment() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/programs/walking-to-5k/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload()),
    });
    const body = await res.json();
    setLoading(false);
    if (!body.ok) {
      setError(body.error?.message ?? "Registration failed");
      return;
    }
    const to = body.data?.redirectTo as string | undefined;
    if (to) router.push(to);
    else router.push("/app/programs/couch-to-5k");
  }

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper text-ink">
        <p className="text-sm font-semibold text-ink/70">Loading…</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="relative min-h-screen overflow-hidden bg-paper px-4 py-10 text-ink sm:px-6">
        <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
          <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-energy-soft blur-3xl" />
        </div>
        <div className="relative mx-auto w-full max-w-lg">
          <Link href="/walking-to-5k" className="text-sm font-bold text-violet-soft hover:underline">
            ← Walking to 5K
          </Link>
          <h1 className="mt-4 font-display text-3xl font-bold uppercase text-violet">Create your account</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            Sign up with email or username and a password, then you will complete the programme registration (PAR-Q,
            emergency contact, consent) on the next screens.
          </p>
          <div className="mt-8 rounded-screen border border-steel/35 bg-paper-raised/95 p-6 shadow-xl">
            <label htmlFor={`${baseId}-reg-email`} className={labelClass}>
              Email
            </label>
            <input
              id={`${baseId}-reg-email`}
              className={`${inputClass} mb-3`}
              type="email"
              autoComplete="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              disabled={loading}
            />
            <label htmlFor={`${baseId}-reg-user`} className={labelClass}>
              Username
            </label>
            <input
              id={`${baseId}-reg-user`}
              className={`${inputClass} mb-3`}
              autoComplete="username"
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
              disabled={loading}
            />
            <label htmlFor={`${baseId}-reg-name`} className={labelClass}>
              Display name
            </label>
            <input
              id={`${baseId}-reg-name`}
              className={`${inputClass} mb-3`}
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              disabled={loading}
            />
            <label htmlFor={`${baseId}-reg-pass`} className={labelClass}>
              Password
            </label>
            <input
              id={`${baseId}-reg-pass`}
              className={`${inputClass} mb-4`}
              type="password"
              autoComplete="new-password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => void createAccount()}
              disabled={loading}
              className="w-full rounded-full bg-energy py-3.5 font-extrabold text-white shadow-md hover:brightness-105 disabled:opacity-60"
            >
              {loading ? "Working…" : "Create account & continue"}
            </button>
            <p className="mt-4 text-center text-sm text-ink/65">
              Already registered?{" "}
              <Link
                href="/login?callbackUrl=/walking-to-5k/register"
                className="font-bold text-violet-soft underline-offset-2 hover:underline"
              >
                Sign in with password
              </Link>
            </p>
            {error ? (
              <p className="mt-4 rounded-card border border-magenta/25 bg-magenta/5 px-3 py-2 text-sm text-magenta" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </main>
    );
  }

  // Authenticated wizard
  return (
    <main className="relative min-h-screen overflow-hidden bg-paper px-4 py-8 text-ink sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0 opacity-35" aria-hidden>
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-violet/20 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-xl">
        <Link href="/walking-to-5k" className="text-sm font-bold text-violet-soft hover:underline">
          ← Programme overview
        </Link>
        <h1 className="mt-3 font-display text-2xl font-bold uppercase text-violet sm:text-3xl">Walking to 5K registration</h1>
        <p className="mt-2 text-sm text-ink/70">
          Signed in as <span className="font-semibold text-ink">{session?.user?.email ?? session?.user?.name ?? "member"}</span>
        </p>

        <ol className="mt-6 flex gap-2 text-[11px] font-bold uppercase tracking-wide text-ink/45">
          {([1, 2, 3, 4] as const).map((s) => (
            <li
              key={s}
              className={`flex-1 rounded-full py-2 text-center ${
                step === s ? "bg-energy text-white" : s < step ? "bg-violet/30 text-ink/80" : "bg-paper-muted"
              }`}
            >
              {s}. {s === 1 ? "You" : s === 2 ? "Emergency" : s === 3 ? "PAR-Q" : "Consent"}
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-screen border border-steel/35 bg-paper-raised/95 p-6 shadow-xl">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold uppercase text-steel-bright">Participant details</h2>
              <div>
                <label htmlFor={`${baseId}-fn`} className={labelClass}>
                  Full name
                </label>
                <input id={`${baseId}-fn`} className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <label htmlFor={`${baseId}-dob`} className={labelClass}>
                  Date of birth
                </label>
                <input
                  id={`${baseId}-dob`}
                  type="date"
                  className={inputClass}
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`${baseId}-mob`} className={labelClass}>
                  Mobile number
                </label>
                <input
                  id={`${baseId}-mob`}
                  className={inputClass}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+91 9XXXXXXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`${baseId}-em`} className={labelClass}>
                  Email (optional — updates your profile if provided)
                </label>
                <input
                  id={`${baseId}-em`}
                  type="email"
                  className={inputClass}
                  value={emailExtra}
                  onChange={(e) => setEmailExtra(e.target.value)}
                  placeholder={sessionEmail || "you@example.com"}
                />
              </div>
              <button
                type="button"
                className="w-full rounded-full bg-energy py-3 font-extrabold text-white hover:brightness-105"
                onClick={() => {
                  setError(null);
                  setStep(2);
                }}
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold uppercase text-steel-bright">Emergency contact</h2>
              <div>
                <label htmlFor={`${baseId}-ecn`} className={labelClass}>
                  Contact name
                </label>
                <input
                  id={`${baseId}-ecn`}
                  className={inputClass}
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`${baseId}-ecp`} className={labelClass}>
                  Contact phone
                </label>
                <input
                  id={`${baseId}-ecp`}
                  className={inputClass}
                  inputMode="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`${baseId}-rel`} className={labelClass}>
                  Relationship
                </label>
                <input
                  id={`${baseId}-rel`}
                  className={inputClass}
                  placeholder="e.g. spouse, parent"
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button type="button" className="flex-1 rounded-full border border-paper-deep py-3 font-bold" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="button" className="flex-1 rounded-full bg-energy py-3 font-extrabold text-white" onClick={() => setStep(3)}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold uppercase text-steel-bright">Medical declaration (PAR-Q)</h2>
              <p className="text-xs leading-relaxed text-ink/60">
                Same questions as the paper form. If you answer Yes anywhere, tell your coach before high-intensity work — you
                may need medical clearance.
              </p>
              <ParqRow
                id={`${baseId}-parq-heart`}
                label="Heart condition?"
                value={parqHeartCondition}
                onChange={setParqHeartCondition}
              />
              <ParqRow
                id={`${baseId}-parq-chest`}
                label="Chest pain during activity?"
                value={parqChestPainDuringActivity}
                onChange={setParqChestPainDuringActivity}
              />
              <ParqRow
                id={`${baseId}-parq-surg`}
                label="Recent surgery?"
                value={parqRecentSurgery}
                onChange={setParqRecentSurgery}
              />
              <ParqRow
                id={`${baseId}-parq-med`}
                label="Regular medication?"
                value={parqRegularMedication}
                onChange={setParqRegularMedication}
              />
              <p className="text-[11px] text-ink/50">
                Wet ink signatures on the PDF can still be collected at orientation; this digital copy is for your file and
                coaches.
              </p>
              <div>
                <label htmlFor={`${baseId}-parq-other`} className={labelClass}>
                  Other medical concerns (optional)
                </label>
                <textarea
                  id={`${baseId}-parq-other`}
                  className={`${inputClass} min-h-[88px] resize-y`}
                  value={parqOtherConcerns}
                  onChange={(e) => setParqOtherConcerns(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button type="button" className="flex-1 rounded-full border border-paper-deep py-3 font-bold" onClick={() => setStep(2)}>
                  Back
                </button>
                <button type="button" className="flex-1 rounded-full bg-energy py-3 font-extrabold text-white" onClick={() => setStep(4)}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold uppercase text-steel-bright">Consent & orientation</h2>
              <label className="flex cursor-pointer gap-3 text-sm leading-relaxed">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 accent-violet"
                  checked={consentVoluntary}
                  onChange={(e) => setConsentVoluntary(e.target.checked)}
                />
                I understand participation is voluntary.
              </label>
              <label className="flex cursor-pointer gap-3 text-sm leading-relaxed">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 accent-violet"
                  checked={consentWithinLimits}
                  onChange={(e) => setConsentWithinLimits(e.target.checked)}
                />
                I accept responsibility for exercising within my limits.
              </label>
              <label className="flex cursor-pointer gap-3 text-sm leading-relaxed">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 accent-violet"
                  checked={orientationMedicalSubmitted}
                  onChange={(e) => setOrientationMedicalSubmitted(e.target.checked)}
                />
                Medical declaration above is complete and accurate to the best of my knowledge.
              </label>
              <label className="flex cursor-pointer gap-3 text-sm leading-relaxed">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 accent-violet"
                  checked={orientationWhatsAppJoined}
                  onChange={(e) => setOrientationWhatsAppJoined(e.target.checked)}
                />
                I have joined (or will join) the programme WhatsApp group when the host shares the link.
              </label>
              <div className="flex gap-2">
                <button type="button" className="flex-1 rounded-full border border-paper-deep py-3 font-bold" onClick={() => setStep(3)}>
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  className="flex-1 rounded-full bg-energy py-3 font-extrabold text-white disabled:opacity-60"
                  onClick={() => void submitEnrolment()}
                >
                  {loading ? "Saving…" : "Submit & enter programme"}
                </button>
              </div>
            </div>
          )}

          {error ? (
            <p className="mt-4 rounded-card border border-magenta/25 bg-magenta/5 px-3 py-2 text-sm text-magenta" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
