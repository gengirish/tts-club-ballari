import type { HealthProfile, ProgressEntry, User as PrismaUser } from "@prisma/client";
import type { ScoreInputs } from "@/server/fitness/score";

const ACTIVITY_PRIORITY: ScoreInputs["activityLevel"][] = [
  "RUNNING",
  "GYM",
  "SPORTS",
  "YOGA",
  "WALKING",
  "SEDENTARY",
];

function pickActivity(current: string[]): ScoreInputs["activityLevel"] {
  for (const a of ACTIVITY_PRIORITY) {
    if (current.includes(a)) return a;
  }
  return "SEDENTARY";
}

function ageFromDob(dob: Date | null | undefined): number {
  if (!dob) return 30;
  const y = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - y.getFullYear();
  const m = now.getMonth() - y.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < y.getDate())) age -= 1;
  return Math.max(18, Math.min(90, age));
}

function startOfDayUtc(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

/** Count distinct UTC calendar days in the window where the member had meaningful movement. */
function workoutDaysPerWeek(entries: ProgressEntry[]): number {
  const days = new Set<string>();
  for (const e of entries) {
    const steps = e.steps ?? 0;
    const mins = e.workoutMins ?? 0;
    if (steps >= 4000 || mins >= 15) {
      days.add(startOfDayUtc(e.date).toISOString());
    }
  }
  return Math.min(7, days.size);
}

function avgSteps(entries: ProgressEntry[]): number {
  if (entries.length === 0) return 0;
  const sum = entries.reduce((a, e) => a + (e.steps ?? 0), 0);
  return Math.round(sum / entries.length);
}

export type BuildScoreProfile = Pick<PrismaUser, "dob"> & {
  healthProfile: HealthProfile | null;
};

/**
 * Returns null when height and weight are insufficient to compute BMI-based inputs.
 */
export function buildScoreInputs(
  user: BuildScoreProfile,
  progressLast7Days: ProgressEntry[]
): ScoreInputs | null {
  const hp = user.healthProfile;
  if (!hp?.heightCm || hp.heightCm < 80 || hp.heightCm > 250) return null;

  const fromProgress = [...progressLast7Days]
    .reverse()
    .find((p) => p.weightKg != null && p.weightKg >= 20 && p.weightKg <= 300);
  const weightKg = hp.weightKg ?? fromProgress?.weightKg;
  if (weightKg == null || weightKg < 20 || weightKg > 300) return null;

  const avgDailySteps = hp.avgDailySteps ?? avgSteps(progressLast7Days);
  const workoutDays = workoutDaysPerWeek(progressLast7Days);

  return {
    age: ageFromDob(user.dob),
    weightKg,
    heightCm: hp.heightCm,
    activityLevel: pickActivity(hp.currentActivity ?? []),
    avgDailySteps,
    workoutDaysPerWeek: workoutDays,
  };
}
