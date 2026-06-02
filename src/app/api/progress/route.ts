import { ok, unauthorized, validationError } from "@/lib/api-response";
import { requireAuth, AuthError } from "@/lib/rbac";
import { progressEntrySchema } from "@/lib/validation/progress";
import { prisma } from "@/lib/prisma";
import { istDayBucket } from "@/lib/utils/datetime";
import type { Prisma } from "@prisma/client";

function toUpdateData(input: {
  weightKg?: number;
  waistCm?: number;
  steps?: number;
  walkKm?: number;
  runKm?: number;
  workoutMins?: number;
  waterMl?: number;
  sleepHrs?: number;
}): Prisma.ProgressEntryUpdateInput {
  const u: Prisma.ProgressEntryUpdateInput = {};
  if (input.weightKg !== undefined) u.weightKg = input.weightKg;
  if (input.waistCm !== undefined) u.waistCm = input.waistCm;
  if (input.steps !== undefined) u.steps = input.steps;
  if (input.walkKm !== undefined) u.walkKm = input.walkKm;
  if (input.runKm !== undefined) u.runKm = input.runKm;
  if (input.workoutMins !== undefined) u.workoutMins = input.workoutMins;
  if (input.waterMl !== undefined) u.waterMl = input.waterMl;
  if (input.sleepHrs !== undefined) u.sleepHrs = input.sleepHrs;
  return u;
}

export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const json = await req.json().catch(() => null);
  const parsed = progressEntrySchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const bucket =
    parsed.data.date != null ? istDayBucket(new Date(parsed.data.date)) : istDayBucket();

  const patch = toUpdateData(parsed.data);

  const row = await prisma.progressEntry.upsert({
    where: { userId_date: { userId: user.id, date: bucket } },
    create: {
      userId: user.id,
      date: bucket,
      weightKg: parsed.data.weightKg ?? null,
      waistCm: parsed.data.waistCm ?? null,
      steps: parsed.data.steps ?? null,
      walkKm: parsed.data.walkKm ?? null,
      runKm: parsed.data.runKm ?? null,
      workoutMins: parsed.data.workoutMins ?? null,
      waterMl: parsed.data.waterMl ?? null,
      sleepHrs: parsed.data.sleepHrs ?? null,
    },
    update: patch,
  });

  return ok(row, { status: 201 });
}
