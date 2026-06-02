"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OnboardingInput } from "@/lib/validation/member";
import { onboardingSchema } from "@/lib/validation/member";

const STEPS = ["You", "Health", "Movement", "Goals"] as const;

const ACTIVITY_IDS = ["SEDENTARY", "WALKING", "RUNNING", "GYM", "YOGA", "SPORTS"] as const;

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

type FormState = {
  name: string;
  email: string;
  dob: string;
  gender: OnboardingInput["gender"];
  occupation: string;
  city: string;
  heightCm: string;
  weightKg: string;
  waistCm: string;
  bpSystolic: string;
  bpDiastolic: string;
  conditions: string;
  hasDiabetes: boolean;
  hasThyroid: boolean;
  injuryHistory: string;
  level: OnboardingInput["health"]["level"];
  currentActivity: string[];
  avgDailySteps: string;
  runningAbilityKm: string;
  walkingDistanceKm: string;
  goals: OnboardingInput["goals"];
};

const emptyForm = (): FormState => ({
  name: "",
  email: "",
  dob: "",
  gender: "FEMALE",
  occupation: "",
  city: "Ballari",
  heightCm: "",
  weightKg: "",
  waistCm: "",
  bpSystolic: "",
  bpDiastolic: "",
  conditions: "",
  hasDiabetes: false,
  hasThyroid: false,
  injuryHistory: "",
  level: "BEGINNER",
  currentActivity: [],
  avgDailySteps: "",
  runningAbilityKm: "",
  walkingDistanceKm: "",
  goals: [],
});

function numOrUndef(s: string): number | undefined {
  const t = s.trim();
  if (t === "") return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

function intOrUndef(s: string): number | undefined {
  const n = numOrUndef(s);
  if (n === undefined) return undefined;
  return Math.round(n);
}

function buildPayload(form: FormState): unknown {
  return {
    name: form.name.trim(),
    email: form.email.trim() === "" ? undefined : form.email.trim(),
    dob: form.dob.trim() === "" ? undefined : form.dob,
    gender: form.gender,
    occupation: form.occupation.trim() || undefined,
    city: form.city.trim() || "Ballari",
    health: {
      heightCm: intOrUndef(form.heightCm),
      weightKg: numOrUndef(form.weightKg),
      waistCm: intOrUndef(form.waistCm),
      bpSystolic: intOrUndef(form.bpSystolic),
      bpDiastolic: intOrUndef(form.bpDiastolic),
      conditions: form.conditions.trim() || undefined,
      hasDiabetes: form.hasDiabetes,
      hasThyroid: form.hasThyroid,
      injuryHistory: form.injuryHistory.trim() || undefined,
      level: form.level,
      currentActivity: form.currentActivity,
      avgDailySteps: intOrUndef(form.avgDailySteps),
      runningAbilityKm: numOrUndef(form.runningAbilityKm),
      walkingDistanceKm: numOrUndef(form.walkingDistanceKm),
    },
    goals: form.goals,
  };
}

export function OnboardingStepper() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const progressPct = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

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
        setError("Please add your name (at least 2 characters).");
        return;
      }
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
      const msg = parsed.error.flatten().formErrors[0] ?? "Please check the form.";
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

    router.push("/app");
    router.refresh();
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="h-2 rounded-full bg-paper-deep overflow-hidden mb-8">
        <div
          className="h-full bg-energy transition-[width] duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="rounded-card border border-paper-deep bg-white/80 backdrop-blur-sm p-6 shadow-sm">
        {step === 0 && (
          <section className="space-y-4" aria-labelledby="step-personal">
            <h2 id="step-personal" className="font-display text-2xl uppercase text-violet">
              About you
            </h2>
            <p className="text-sm text-ink/60">We use this to personalise your journey in Ballari.</p>
            <label className="block text-sm font-semibold text-ink">
              Name <span className="text-magenta">*</span>
              <input
                className="mt-1 w-full border border-paper-deep rounded-card px-4 py-3"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                autoComplete="name"
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Email <span className="text-ink/40 font-normal">(optional)</span>
              <input
                type="email"
                className="mt-1 w-full border border-paper-deep rounded-card px-4 py-3"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                autoComplete="email"
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Date of birth <span className="text-ink/40 font-normal">(optional)</span>
              <input
                type="date"
                className="mt-1 w-full border border-paper-deep rounded-card px-4 py-3"
                value={form.dob}
                onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Gender
              <select
                className="mt-1 w-full border border-paper-deep rounded-card px-4 py-3 bg-white"
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
                className="mt-1 w-full border border-paper-deep rounded-card px-4 py-3"
                value={form.occupation}
                onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))}
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              City
              <input
                className="mt-1 w-full border border-paper-deep rounded-card px-4 py-3"
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
                  inputMode="numeric"
                  className="mt-1 w-full border border-paper-deep rounded-card px-4 py-3"
                  value={form.heightCm}
                  onChange={(e) => setForm((f) => ({ ...f, heightCm: e.target.value }))}
                />
              </label>
              <label className="block text-sm font-semibold text-ink col-span-2 sm:col-span-1">
                Weight (kg)
                <input
                  inputMode="decimal"
                  className="mt-1 w-full border border-paper-deep rounded-card px-4 py-3"
                  value={form.weightKg}
                  onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))}
                />
              </label>
              <label className="block text-sm font-semibold text-ink col-span-2">
                Waist (cm) <span className="text-ink/40 font-normal">(optional)</span>
                <input
                  inputMode="numeric"
                  className="mt-1 w-full border border-paper-deep rounded-card px-4 py-3"
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
                  className="mt-1 w-full border border-paper-deep rounded-card px-4 py-3"
                  value={form.bpSystolic}
                  onChange={(e) => setForm((f) => ({ ...f, bpSystolic: e.target.value }))}
                />
              </label>
              <label className="block text-sm font-semibold text-ink">
                BP diastolic
                <input
                  inputMode="numeric"
                  className="mt-1 w-full border border-paper-deep rounded-card px-4 py-3"
                  value={form.bpDiastolic}
                  onChange={(e) => setForm((f) => ({ ...f, bpDiastolic: e.target.value }))}
                />
              </label>
            </div>
            <label className="block text-sm font-semibold text-ink">
              Conditions or notes <span className="text-ink/40 font-normal">(optional)</span>
              <textarea
                className="mt-1 w-full border border-paper-deep rounded-card px-4 py-3 min-h-[88px]"
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
                className="mt-1 w-full border border-paper-deep rounded-card px-4 py-3 min-h-[72px]"
                value={form.injuryHistory}
                onChange={(e) => setForm((f) => ({ ...f, injuryHistory: e.target.value }))}
              />
            </label>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4" aria-labelledby="step-activity">
            <h2 id="step-activity" className="font-display text-2xl uppercase text-violet">
              How you move today
            </h2>
            <p className="text-sm text-ink/60">No judgement — we meet you where you are.</p>
            <label className="block text-sm font-semibold text-ink">
              Fitness level
              <select
                className="mt-1 w-full border border-paper-deep rounded-card px-4 py-3 bg-white"
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
                      {id.charAt(0) + id.slice(1).toLowerCase().replace("_", " ")}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="block text-sm font-semibold text-ink">
              Average daily steps <span className="text-ink/40 font-normal">(optional)</span>
              <input
                inputMode="numeric"
                className="mt-1 w-full border border-paper-deep rounded-card px-4 py-3"
                value={form.avgDailySteps}
                onChange={(e) => setForm((f) => ({ ...f, avgDailySteps: e.target.value }))}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold text-ink">
                Comfortable run (km)
                <input
                  inputMode="decimal"
                  className="mt-1 w-full border border-paper-deep rounded-card px-4 py-3"
                  value={form.runningAbilityKm}
                  onChange={(e) => setForm((f) => ({ ...f, runningAbilityKm: e.target.value }))}
                />
              </label>
              <label className="block text-sm font-semibold text-ink">
                Typical walk (km)
                <input
                  inputMode="decimal"
                  className="mt-1 w-full border border-paper-deep rounded-card px-4 py-3"
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
                        : "bg-white border-magenta/30 text-ink hover:border-magenta"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {error && (
          <p className="mt-4 text-sm font-semibold text-magenta" role="alert">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={back}
            disabled={step === 0 || loading}
            className="rounded-full px-5 py-2.5 text-sm font-bold text-violet border border-violet/30 disabled:opacity-40"
          >
            Back
          </button>
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
              {loading ? "Saving…" : "Finish"}
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-ink/40 mt-6">
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </p>
    </div>
  );
}
