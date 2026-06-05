import type { Gender, Goal } from "@prisma/client";
import type { OnboardingInput } from "@/lib/validation/member";

export type OnboardingFormState = {
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

export function emptyOnboardingForm(): OnboardingFormState {
  return {
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
  };
}

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

function strOrEmpty(n: number | null | undefined): string {
  return n == null ? "" : String(n);
}

function isoDateOrEmpty(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

/** Build API payload from wizard form state. */
export function onboardingFormToPayload(form: OnboardingFormState): unknown {
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

type ProfileRow = {
  name: string | null;
  email: string | null;
  dob: Date | null;
  gender: Gender | null;
  occupation: string | null;
  city: string | null;
  healthProfile: {
    heightCm: number | null;
    weightKg: number | null;
    waistCm: number | null;
    bpSystolic: number | null;
    bpDiastolic: number | null;
    conditions: string | null;
    hasDiabetes: boolean;
    hasThyroid: boolean;
    injuryHistory: string | null;
    level: OnboardingInput["health"]["level"];
    currentActivity: string[];
    avgDailySteps: number | null;
    runningAbilityKm: number | null;
    walkingDistanceKm: number | null;
  } | null;
  goals: { goal: Goal }[];
};

/** Hydrate the onboarding stepper from persisted member data. */
export function profileToOnboardingForm(user: ProfileRow): OnboardingFormState {
  const hp = user.healthProfile;
  return {
    name: user.name ?? "",
    email: user.email ?? "",
    dob: isoDateOrEmpty(user.dob),
    gender: user.gender ?? "FEMALE",
    occupation: user.occupation ?? "",
    city: user.city ?? "Ballari",
    heightCm: strOrEmpty(hp?.heightCm),
    weightKg: strOrEmpty(hp?.weightKg),
    waistCm: strOrEmpty(hp?.waistCm),
    bpSystolic: strOrEmpty(hp?.bpSystolic),
    bpDiastolic: strOrEmpty(hp?.bpDiastolic),
    conditions: hp?.conditions ?? "",
    hasDiabetes: hp?.hasDiabetes ?? false,
    hasThyroid: hp?.hasThyroid ?? false,
    injuryHistory: hp?.injuryHistory ?? "",
    level: hp?.level ?? "BEGINNER",
    currentActivity: hp?.currentActivity ?? [],
    avgDailySteps: strOrEmpty(hp?.avgDailySteps),
    runningAbilityKm: strOrEmpty(hp?.runningAbilityKm),
    walkingDistanceKm: strOrEmpty(hp?.walkingDistanceKm),
    goals: user.goals.map((g) => g.goal) as OnboardingInput["goals"],
  };
}
