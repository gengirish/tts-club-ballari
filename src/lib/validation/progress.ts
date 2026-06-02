import { z } from "zod";

export const progressEntrySchema = z.object({
  date: z.coerce.date().optional(),
  weightKg: z.number().min(20).max(300).optional(),
  waistCm: z.number().int().optional(),
  steps: z.number().int().min(0).optional(),
  walkKm: z.number().min(0).optional(),
  runKm: z.number().min(0).optional(),
  workoutMins: z.number().int().min(0).optional(),
  waterMl: z.number().int().min(0).optional(),
  sleepHrs: z.number().min(0).max(24).optional(),
});

export type ProgressEntryInput = z.infer<typeof progressEntrySchema>;
