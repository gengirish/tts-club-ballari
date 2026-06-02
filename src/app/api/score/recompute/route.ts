import { ok, unauthorized, validationError, fail } from "@/lib/api-response";
import { requireAuth, AuthError } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { computeFitnessScore } from "@/server/fitness/score";
import { buildScoreInputs } from "@/server/fitness/build-score-inputs";

export async function POST() {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const since = new Date(Date.now() - 7 * 86400000);

  const full = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      healthProfile: true,
      progress: {
        where: { date: { gte: since } },
        orderBy: { date: "asc" },
      },
    },
  });

  if (!full) return fail("NOT_FOUND", "User not found", 404);

  const inputs = buildScoreInputs(full, full.progress);
  if (!inputs) {
    return fail(
      "NEEDS_HEALTH_DATA",
      "Add height and weight in your health profile (or log weight in progress) to compute your fitness score.",
      422
    );
  }

  const result = computeFitnessScore(inputs);

  const row = await prisma.fitnessScore.create({
    data: {
      userId: user.id,
      score: result.score,
      level: result.level,
      stepsBps: result.stepsBps,
      consistencyBps: result.consistencyBps,
      bmiBps: result.bmiBps,
      activityBps: result.activityBps,
    },
  });

  return ok(row, { status: 201 });
}
