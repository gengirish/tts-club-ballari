import type { ScoreLevel } from "@prisma/client";
import { fractionToBps } from "@/lib/utils/percent";

export interface ScoreInputs {
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: "SEDENTARY" | "WALKING" | "RUNNING" | "GYM" | "YOGA" | "SPORTS";
  avgDailySteps: number;
  workoutDaysPerWeek: number; // 0-7
}

export interface ScoreResult {
  score: number; // 0-100
  level: ScoreLevel;
  stepsBps: number;
  consistencyBps: number;
  bmiBps: number;
  activityBps: number;
}

const ACTIVITY_WEIGHT: Record<ScoreInputs["activityLevel"], number> = {
  SEDENTARY: 0.2, WALKING: 0.5, YOGA: 0.6, GYM: 0.8, SPORTS: 0.9, RUNNING: 1.0,
};

function bmiScore(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  const bmi = weightKg / (m * m);
  // Healthy band 18.5–24.9 scores highest; taper outside.
  if (bmi >= 18.5 && bmi <= 24.9) return 1;
  const dist = bmi < 18.5 ? 18.5 - bmi : bmi - 24.9;
  return Math.max(0, 1 - dist / 12);
}

/** Weighted 0-100 fitness score. Components also returned in basis points. */
export function computeFitnessScore(i: ScoreInputs): ScoreResult {
  const stepsFrac = Math.min(1, i.avgDailySteps / 10000);
  const consistencyFrac = Math.min(1, i.workoutDaysPerWeek / 5);
  const bmiFrac = bmiScore(i.weightKg, i.heightCm);
  const activityFrac = ACTIVITY_WEIGHT[i.activityLevel];
  const ageFrac = i.age <= 30 ? 1 : Math.max(0.6, 1 - (i.age - 30) / 100);

  const score = Math.round(
    100 *
      (0.30 * stepsFrac +
        0.25 * consistencyFrac +
        0.20 * bmiFrac +
        0.15 * activityFrac +
        0.10 * ageFrac)
  );

  return {
    score,
    level: toLevel(score),
    stepsBps: fractionToBps(stepsFrac),
    consistencyBps: fractionToBps(consistencyFrac),
    bmiBps: fractionToBps(bmiFrac),
    activityBps: fractionToBps(activityFrac),
  };
}

export function toLevel(score: number): ScoreLevel {
  if (score >= 85) return "CHAMPION";
  if (score >= 70) return "ATHLETE";
  if (score >= 55) return "STRONG";
  if (score >= 35) return "ACTIVE";
  return "BEGINNER";
}
