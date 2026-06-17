"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { OnboardingInput } from "@/lib/validation/member";
import { onboardingSchema } from "@/lib/validation/member";
import {
  emptyOnboardingForm,
  onboardingFormToPayload,
  type OnboardingFormState,
} from "@/lib/member/onboarding-form";

const STEPS = ["You", "Health", "Movement", "Goals"] as const;

const inputClass =
  "mt-1 w-full rounded-card border border-paper-deep bg-paper-muted px-4 py-3 text-ink shadow-sm placeholder:text-ink/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

const selectClass = `${inputClass} cursor-pointer`;

const textareaClass = `${inputClass} resize-y`;

const ACTIVITY_IDS = ["SEDENTARY", "WALKING", "RUNNING", "GYM", "YOGA", "SPORTS"] as const;

const ACTIVITY_LABEL: Record<(typeof ACTIVITY_IDS)[number], string> = {
  SEDENTARY: "Mostly seated",
  WALKING: "Walking",
  RUNNING: "Running",
  GYM: "Gym",
  YOGA: "Yoga",
  SPORTS: "Sports",
};

const GOAL_OPTIONS: { value: OnboardingInput["goals"][number]; label: string }[] = [
  { value: "WEIGHT_LOSS", label: "Weight loss" },
  { value: "WEIGHT_GAIN", label: "Strength & gain" },
  { value: "FITNESS_IMPROVEMENT", label: "General fitness" },
  { value: "WALKING_HABIT", label: "Walking habit" },
  { value: "COUCH_TO_5K", label: "Couch to 5K" },
  { value: "RUNNER_5K", label: "5K runner" },
  { value: "RUNNER_10K", label: "10K runner" },
  { value: "HALF_MARATHON", label: "Half marathon" },
  { value: "STRENGTH_TRAINING", label: "Strength training" },
  { value: "WOMENS_WELLNESS", label: "Women's wellness" },
  { value: "HEALTHY_LIFESTYLE", label: "Healthy lifestyle" },
];

type FormState = OnboardingFormState;

const emptyForm = emptyOnboardingForm;
const ONBOARDING_DRAFT_STORAGE_KEY = "sss:onboarding-stepper-draft:v1";

type OnboardingDraft = {
  mode: "onboard" | "edit";
  step: number;
  form: FormState;
};

function buildPayload(form: FormState): unknown {
  return onboardingFormToPayload(form);
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M1.5 6.5l3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OnboardingStepper({
  mode = "onboard",
  initialForm,
}: {
  mode?: "onboard" | "edit";
  initialForm?: OnboardingFormState;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => initialForm ?? emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const heightInputRef = useRef<HTMLInputElement>(null);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY);
      if (!raw) {
        setDraftReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
      if (parsed.mode !== mode || typeof parsed.step !== "number" || !parsed.form || typeof parsed.form !== "object") {
        setDraftReady(true);
        return;
      }
      setForm((prev) => ({ ...prev, ...(parsed.form as Partial<FormState>) }));
      const restoredStep = Math.min(Math.max(Math.trunc(parsed.step), 0), STEPS.length - 1);
      setStep(restoredStep);
      setDraftNotice("Draft restored on this device.");
    } catch {
      // Ignore invalid draft payloads.
    } finally {
      setDraftReady(true);
    }
  }, [mode]);

  useEffect(() => {
    if (!draftReady) return;
    const draft: OnboardingDraft = { mode, step, form };
    try {
      window.localStorage.setItem(ONBOARDING_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignore quota/private mode failures.
    }
  }, [draftReady, mode, step, form]);

  useEffect(() => {
    if (form.goals.length > 0) setFieldError("goals");
  }, [form.goals.length]);

  // Auto-focus first field when navigating between steps (not on initial render).
  useEffect(() => {
    if (!hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      return;
    }
    if (step === 0) nameInputRef.current?.focus();
    else if (step === 1) heightInputRef.current?.focus();
  }, [step]);

  function setFieldError(field: string, message?: string) {
    setFieldErrors((prev) => {
      if (!message) {
        if (!(field in prev)) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      }
      if (prev[field] === message) return prev;
      return { ...prev, [field]: message };
    });
  }

  function validateOptionalEmail(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      setFieldError("email");
      return;
    }
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    setFieldError("email", ok ? undefined : "Enter a valid email address.");
  }

  function toggleActivity(id: string) {
    setForm((f) => ({
      ...f,
      currentActivity: f.currentActivity.includes(id)
        ? f.currentActivity.filter((x) => x !== id)
        : [...f.currentActivity, id],
    }));
  }

  function toggleGoal(value: OnboardingInput["goals"][number]) {
    setForm((f) => ({
      ...f,
      goals: f.goals.includes(value) ? f.goals.filter((g) => g !== value) : [...f.goals, value],
    }));
  }

  function next() {
    setError(null);
    if (step === 0) {
      if (form.name.trim().length < 2) {
        setFieldError("name", "Please add your name (at least 2 characters).");
        setError("Please add your name (at least 2 characters).");
        return;
      }
      setFieldError("name");
    }
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  }

  function back() {
    setError(null);
    if (step > 0) setStep((s) => s - 1);
  }

  async function submit() {
    setError(null);
    const raw = buildPayload(form);
    const parsed = onboardingSchema.safeParse(raw);
    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      const nextFieldErrors: Record<string, string> = {};
      if (flattened.fieldErrors.name?.[0]) nextFieldErrors.name = flattened.fieldErrors.name[0];
      if (flattened.fieldErrors.email?.[0]) nextFieldErrors.email = flattened.fieldErrors.email[0];
      if (flattened.fieldErrors.goals?.[0]) nextFieldErrors.goals = flattened.fieldErrors.goals[0];
      setFieldErrors(nextFieldErrors);
      if (flattened.fieldErrors.name?.[0]) setStep(0);
      else if (flattened.fieldErrors.goals?.[0]) setStep(3);
      const msg =
        flattened.fieldErrors.name?.[0] ??
        flattened.fieldErrors.email?.[0] ??
        flattened.fieldErrors.goals?.[0] ??
        flattened.formErrors[0] ??
        "Please check the form.";
      setError(msg);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const body = (await res.json()) as {
      ok: boolean;
      error?: { code?: string; message?: string };
    };
    setLoading(false);

    if (!res.ok || !body.ok) {
      setError(body.error?.message ?? "Could not save. Try again.");
      return;
    }

    try {
      window.localStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }

    setDone(true);
    setTimeout(() => {
      router.push("/app");
      router.refresh();
    }, 1500);
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="rounded-card border border-progress/30 bg-paper-raised/85 backdrop-blur-sm p-8 shadow-sm text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-progress/15">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="Done">
              <path d="M4.5 14l6 6 13-12" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-display text-2xl uppercase text-transparent bg-clip-text bg-energy">
            {mode === "edit" ? "Saved!" : "You're in!"}
          </h2>
          <p className="mt-2 text-sm text-ink/60">
            {mode === "edit"
              ? "Your profile has been updated."
              : "Welcome to Steel Sisters & Striders — taking you home…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Labeled step indicator */}
      <nav aria-label="Setup progress" className="mb-8">
        <div className="flex items-start">
          {STEPS.map((name, i) => {
            const isCompleted = i < step;
            const isActive = i === step;
            return (
              <Fragment key={name}>
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                      isCompleted
                        ? "bg-violet text-white"
                        : isActive
                        ? "bg-violet text-white ring-2 ring-violet/40 ring-offset-2 ring-offset-paper"
                        : "bg-paper-deep text-ink/35"
                    }`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    {isCompleted ? <CheckIcon /> : i + 1}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wide ${
                      isActive ? "text-violet-soft" : isCompleted ? "text-ink/55" : "text-ink/25"
                    }`}
                  >
                    {name}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 mt-4 mx-1 h-0.5 rounded-full bg-paper-deep overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${isCompleted ? "bg-violet w-full" : "w-0"}`} />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </nav>

      <div className="rounded-card border border-paper-deep bg-paper-raised/85 backdrop-blur-sm p-6 shadow-sm">
        {step === 0 && (
          <section className="space-y-4" aria-labelledby="step-personal">
            <h2 id="step-personal" className="font-display text-2xl uppercase text-violet">
              About you
            </h2>
            <p className="text-sm text-ink/60">We use this to personalise your journey in Ballari.</p>
            <label className="block text-sm font-semibold text-ink">
              Name <span className="text-magenta">*</span>
              <input
                ref={nameInputRef}
                className={inputClass}
                value={form.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((f) => ({ ...f, name: value }));
                  if (value.trim().length >= 2) setFieldError("name");
                }}
                onBlur={() =>
                  setFieldError(
                    "name",
                    form.name.trim().length >= 2 ? undefined : "Please add your name (at least 2 characters)."
                  )
                }
                autoComplete="name"
              />
              {fieldErrors.name ? (
                <p className="mt-1 text-xs font-semibold text-magenta" role="alert">
                  {fieldErrors.name}
                </p>
              ) : null}
            </label>
            <label className="block text-sm font-semibold text-ink">
              Email <span className="text-ink/40 font-normal">(optional)</span>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((f) => ({ ...f, email: value }));
                  if (!value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) setFieldError("email");
                }}
                onBlur={() => validateOptionalEmail(form.email)}
                autoComplete="email"
              />
              {fieldErrors.email ? (
                <p className="mt-1 text-xs font-semibold text-magenta" role="alert">
                  {fieldErrors.email}
                </p>
              ) : null}
            </label>
            <label className="block text-sm font-semibold text-ink">
              Date of birth <span className="text-ink/40 font-normal">(optional)</span>
              <input
                type="date"
                className={inputClass}
                value={form.dob}
                onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Gender
              <select
                className={selectClass}
                value={form.gender}
                onChange={(e) =>
                  setForm((f) => ({ ...f, gender: e.target.value as FormState["gender"] }))
                }
              >
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
                <option value="UNDISCLOSED">Prefer not to say</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-ink">
              Occupation <span className="text-ink/40 font-normal">(optional)</span>
              <input
                className={inputClass}
                value={form.occupation}
                onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))}
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              City
              <input
                className={inputClass}
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </label>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-4" aria-labelledby="step-health">
            <h2 id="step-health" className="font-display text-2xl uppercase text-violet">
              Health snapshot
            </h2>
            <p className="text-sm text-ink/60">
              Share what you are comfortable with — it helps coaches support you safely.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold text-ink col-span-2 sm:col-span-1">
                Height (cm)
                <input
                  ref={heightInputRef}
                  inputMode="numeric"
                  className={inputClass}
                  value={form.heightCm}
                  onChange={(e) => setForm((f) => ({ ...f, heightCm: e.target.value }))}
                />
              </label>
              <label className="block text-sm font-semibold text-ink col-span-2 sm:col-span-1">
                Weight (kg)
                <input
                  inputMode="decimal"
                  className={inputClass}
                  value={form.weightKg}
                  onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))}
                />
              </label>
              <label className="block text-sm font-semibold text-ink col-span-2">
                Waist (cm) <span className="text-ink/40 font-normal">(optional)</span>
                <input
                  inputMode="numeric"
                  className={inputClass}
                  value={form.waistCm}
                  onChange={(e) => setForm((f) => ({ ...f, waistCm: e.target.value }))}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold text-ink">
                BP systolic
                <input
                  inputMode="numeric"
                  className={inputClass}
                  value={form.bpSystolic}
                  onChange={(e) => setForm((f) => ({ ...f, bpSystolic: e.target.value }))}
                />
              </label>
              <label className="block text-sm font-semibold text-ink">
                BP diastolic
                <input
                  inputMode="numeric"
                  className={inputClass}
                  value={form.bpDiastolic}
                  onChange={(e) => setForm((f) => ({ ...f, bpDiastolic: e.target.value }))}
                />
              </label>
            </div>
            <label className="block text-sm font-semibold text-ink">
              Conditions or notes <span className="text-ink/40 font-normal">(optional)</span>
              <textarea
                className={`${textareaClass} min-h-[88px]`}
                value={form.conditions}
                onChange={(e) => setForm((f) => ({ ...f, conditions: e.target.value }))}
              />
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasDiabetes}
                  onChange={(e) => setForm((f) => ({ ...f, hasDiabetes: e.target.checked }))}
                  className="rounded border-paper-deep text-magenta focus:ring-magenta"
                />
                Diabetes care
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasThyroid}
                  onChange={(e) => setForm((f) => ({ ...f, hasThyroid: e.target.checked }))}
                  className="rounded border-paper-deep text-magenta focus:ring-magenta"
                />
                Thyroid
              </label>
            </div>
            <label className="block text-sm font-semibold text-ink">
              Injury history <span className="text-ink/40 font-normal">(optional)</span>
              <textarea
                className={`${textareaClass} min-h-[72px]`}
                value={form.injuryHistory}
                onChange={(e) => setForm((f) => ({ ...f, injuryHistory: e.target.value }))}
              />
            </label>
            <p className="text-xs text-ink/45 pt-1">
              All fields optional — tap Continue whenever ready.
            </p>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4" aria-labelledby="step-activity">
            <h2 id="step-activity" className="font-display text-2xl uppercase text-violet">
              How you move today
            </h2>
            <p className="text-sm text-ink/60">No judgement — we meet you where you are.</p>
            {mode === "edit" ? (
              <p className="text-xs text-ink/55 rounded-card border border-paper-deep bg-paper-muted/60 px-3 py-2">
                Picked the wrong fitness level? Change it here — no need to register again.
              </p>
            ) : null}
            <label className="block text-sm font-semibold text-ink">
              Fitness level
              <select
                className={selectClass}
                value={form.level}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    level: e.target.value as FormState["level"],
                  }))
                }
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </label>
            <div>
              <p className="text-sm font-semibold text-ink mb-2">Current activity</p>
              <div className="flex flex-wrap gap-2">
                {ACTIVITY_IDS.map((id) => {
                  const on = form.currentActivity.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleActivity(id)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold border transition-colors ${
                        on
                          ? "bg-magenta text-white border-magenta shadow-sm"
                          : "bg-paper border-paper-deep text-ink hover:border-magenta/40"
                      }`}
                    >
                      {ACTIVITY_LABEL[id]}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="block text-sm font-semibold text-ink">
              Average daily steps <span className="text-ink/40 font-normal">(optional)</span>
              <input
                inputMode="numeric"
                className={inputClass}
                value={form.avgDailySteps}
                onChange={(e) => setForm((f) => ({ ...f, avgDailySteps: e.target.value }))}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold text-ink">
                Comfortable run (km)
                <input
                  inputMode="decimal"
                  className={inputClass}
                  value={form.runningAbilityKm}
                  onChange={(e) => setForm((f) => ({ ...f, runningAbilityKm: e.target.value }))}
                />
              </label>
              <label className="block text-sm font-semibold text-ink">
                Typical walk (km)
                <input
                  inputMode="decimal"
                  className={inputClass}
                  value={form.walkingDistanceKm}
                  onChange={(e) => setForm((f) => ({ ...f, walkingDistanceKm: e.target.value }))}
                />
              </label>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4" aria-labelledby="step-goals">
            <h2 id="step-goals" className="font-display text-2xl uppercase text-violet">
              Your goals
            </h2>
            <p className="text-sm text-ink/60">Pick one or more — we will cheer every win.</p>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map(({ value, label }) => {
                const on = form.goals.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleGoal(value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold border transition-colors ${
                      on
                        ? "bg-energy text-white border-transparent shadow-md"
                        : "bg-paper-raised border-magenta/30 text-ink hover:border-magenta"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {fieldErrors.goals ? (
              <p className="text-xs font-semibold text-magenta" role="alert">
                {fieldErrors.goals}
              </p>
            ) : (
              <p className="text-xs text-ink/50">Choose at least one goal before finishing.</p>
            )}
          </section>
        )}

        {error && (
          <p className="mt-4 text-sm font-semibold text-magenta" role="alert">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={back}
              disabled={loading}
              className="rounded-full px-5 py-2.5 text-sm font-bold text-violet border border-violet/30 disabled:opacity-40"
            >
              Back
            </button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              disabled={loading}
              className="rounded-full px-6 py-2.5 text-sm font-extrabold text-white bg-energy disabled:opacity-60"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="rounded-full px-6 py-2.5 text-sm font-extrabold text-white bg-energy disabled:opacity-60"
            >
              {loading ? "Saving…" : mode === "edit" ? "Save changes" : "Finish"}
            </button>
          )}
        </div>
        <p className="mt-3 text-xs text-ink/45" role="status" aria-live="polite">
          {draftNotice ?? (draftReady ? "Draft autosaves on this device." : "Preparing draft autosave…")}
        </p>
      </div>
    </div>
  );
}
