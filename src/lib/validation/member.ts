import { z } from "zod";

export const onboardingSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  dob: z.coerce.date().optional(),
  gender: z.enum(["FEMALE", "MALE", "OTHER", "UNDISCLOSED"]).default("FEMALE"),
  occupation: z.string().optional(),
  city: z.string().default("Ballari"),
  health: z.object({
    heightCm: z.number().int().min(80).max(250).optional(),
    weightKg: z.number().min(20).max(300).optional(),
    waistCm: z.number().int().optional(),
    bpSystolic: z.number().int().optional(),
    bpDiastolic: z.number().int().optional(),
    conditions: z.string().optional(),
    hasDiabetes: z.boolean().default(false),
    hasThyroid: z.boolean().default(false),
    injuryHistory: z.string().optional(),
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
    currentActivity: z.array(z.string()).default([]),
    avgDailySteps: z.number().int().optional(),
    runningAbilityKm: z.number().optional(),
    walkingDistanceKm: z.number().optional(),
  }),
  goals: z
    .array(
      z.enum([
        "WEIGHT_LOSS", "WEIGHT_GAIN", "FITNESS_IMPROVEMENT", "WALKING_HABIT",
        "COUCH_TO_5K", "RUNNER_5K", "RUNNER_10K", "HALF_MARATHON",
        "STRENGTH_TRAINING", "WOMENS_WELLNESS", "HEALTHY_LIFESTYLE",
      ])
    )
    .min(1, "Pick at least one goal"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
