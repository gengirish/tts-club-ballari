import { z } from "zod";

export const c25kAssessmentSchema = z.object({
  currentWeightKg: z
    .number({ invalid_type_error: "Enter your current weight in kg (a number)." })
    .min(20, "Weight must be at least 20 kg.")
    .max(200, "Weight must be at most 200 kg.")
    .optional(),
  age: z
    .number({ invalid_type_error: "Enter your age (a whole number)." })
    .int("Age must be a whole number.")
    .min(16, "Age must be at least 16.")
    .max(90, "Age must be at most 90.")
    .optional(),
  activityLevel: z.string().max(120, "Keep activity note to 120 characters or less.").optional(),
  dailySteps: z
    .number({ invalid_type_error: "Enter average daily steps (a number)." })
    .int("Daily steps must be a whole number.")
    .min(0, "Daily steps cannot be negative.")
    .optional(),
  injuryHistory: z.string().max(2000, "Injury history is too long (max 2000 characters).").optional(),
  prevRunning: z.boolean().optional(),
});

export const c25kOrderBodySchema = z.object({
  assessment: c25kAssessmentSchema,
});
