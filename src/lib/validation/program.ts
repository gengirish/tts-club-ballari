import { z } from "zod";

export const c25kAssessmentSchema = z.object({
  currentWeightKg: z.number().min(20).max(200).optional(),
  age: z.number().int().min(16).max(90).optional(),
  activityLevel: z.string().max(120).optional(),
  dailySteps: z.number().int().min(0).optional(),
  injuryHistory: z.string().max(2000).optional(),
  prevRunning: z.boolean().optional(),
});

export const c25kOrderBodySchema = z.object({
  assessment: c25kAssessmentSchema,
});
