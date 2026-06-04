import type { Prisma } from "@prisma/client";
import { ok, fail, unauthorized, validationError, notFound } from "@/lib/api-response";
import { requireAuth, AuthError } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import {
  walkingTo5kEnrollSchema,
  type WalkingTo5kEnrollInput,
} from "@/lib/validation/walking-to-5k";
import { toE164 } from "@/lib/utils/phone";
import { scheduleC25kSessionReminders } from "@/server/programs/schedule-c25k-reminders";

export const runtime = "nodejs";

function parqSummary(data: WalkingTo5kEnrollInput): string {
  const lines = [
    `Heart condition (PAR-Q): ${data.parqHeartCondition ? "Yes" : "No"}`,
    `Chest pain during activity: ${data.parqChestPainDuringActivity ? "Yes" : "No"}`,
    `Recent surgery: ${data.parqRecentSurgery ? "Yes" : "No"}`,
    `Regular medication: ${data.parqRegularMedication ? "Yes" : "No"}`,
  ];
  if (data.parqOtherConcerns?.trim()) lines.push(`Other concerns: ${data.parqOtherConcerns.trim()}`);
  return lines.join("\n");
}

/** POST — authenticated Walking to 5K registration; enrolls in flagship Couch to 5K programme. */
export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const json = await req.json().catch(() => null);
  const parsed = walkingTo5kEnrollSchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const data = parsed.data;
  const phoneE164 = toE164(data.mobile);
  const emergencyE164 = toE164(data.emergencyContactPhone);
  if (!phoneE164 || !emergencyE164) {
    return fail("INVALID_PHONE", "Could not normalise one or more phone numbers.", 422);
  }

  const emailNorm = data.email?.trim() ? data.email.trim().toLowerCase() : undefined;

  const program = await prisma.program.findUnique({ where: { slug: "couch-to-5k" } });
  if (!program) return notFound("Programme is not available yet. Please try again later.");

  const dob = new Date(`${data.dateOfBirth}T00:00:00.000Z`);

  const assessment: Prisma.InputJsonValue = {
    walkingTo5KFormVersion: 1,
    submittedAt: new Date().toISOString(),
    parq: {
      heartCondition: data.parqHeartCondition,
      chestPainDuringActivity: data.parqChestPainDuringActivity,
      recentSurgery: data.parqRecentSurgery,
      regularMedication: data.parqRegularMedication,
      otherConcerns: data.parqOtherConcerns?.trim() ?? "",
    },
    emergencyContact: {
      name: data.emergencyContactName.trim(),
      phoneE164: emergencyE164,
      relationship: data.emergencyRelationship.trim(),
    },
    orientation: {
      whatsAppGroupJoined: data.orientationWhatsAppJoined ?? false,
      registrationComplete: true,
      medicalFormSubmitted: data.orientationMedicalSubmitted,
    },
    consent: {
      voluntary: data.consentVoluntary,
      withinLimits: data.consentWithinLimits,
      acceptedAt: new Date().toISOString(),
    },
    registrationChannel: "walking-to-5k-web",
  };

  const coach = await prisma.coach.findFirst({
    where: { available: true },
    orderBy: { createdAt: "asc" },
  });

  try {
    await prisma.$transaction(async (tx) => {
      const otherWithPhone = await tx.user.findFirst({
        where: { phone: phoneE164, NOT: { id: user.id } },
        select: { id: true },
      });
      if (otherWithPhone) {
        throw new Error("PHONE_TAKEN");
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          name: data.fullName.trim(),
          phone: phoneE164,
          dob,
          ...(emailNorm ? { email: emailNorm } : {}),
        },
      });

      await tx.healthProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          conditions: parqSummary(data),
          level: "BEGINNER",
        },
        update: {
          conditions: parqSummary(data),
        },
      });

      await tx.memberGoal.upsert({
        where: { userId_goal: { userId: user.id, goal: "COUCH_TO_5K" } },
        create: { userId: user.id, goal: "COUCH_TO_5K" },
        update: {},
      });

      await tx.programEnrollment.upsert({
        where: { programId_memberId: { programId: program.id, memberId: user.id } },
        create: {
          programId: program.id,
          memberId: user.id,
          coachId: coach?.id ?? null,
          assessment,
          status: "ACTIVE",
          weekNo: 1,
        },
        update: {
          assessment,
          status: "ACTIVE",
          coachId: coach?.id ?? undefined,
        },
      });
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "PHONE_TAKEN") {
      return fail("DUPLICATE_PHONE", "This mobile number is already linked to another account.", 409);
    }
    const code = (e as { code?: string })?.code;
    if (code === "P2002") {
      return fail("DUPLICATE", "Email or phone conflicts with another account.", 409);
    }
    console.error("[walking-to-5k enroll]", e);
    return fail("ENROLL_FAILED", "Could not complete registration. Try again or contact the team.", 500);
  }

  const enrollment = await prisma.programEnrollment.findUnique({
    where: { programId_memberId: { programId: program.id, memberId: user.id } },
    select: { id: true },
  });
  if (enrollment?.id) {
    void scheduleC25kSessionReminders(enrollment.id).catch((err) => {
      console.warn("[walking-to-5k enroll] scheduleC25kSessionReminders:", err);
    });
  }

  return ok({ redirectTo: "/app/programs/couch-to-5k" as const });
}
