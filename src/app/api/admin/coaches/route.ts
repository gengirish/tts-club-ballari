import { ok, fail, unauthorized, forbidden, validationError, notFound } from "@/lib/api-response";
import { requireRole, AuthError } from "@/lib/rbac";
import { prisma, ensurePrismaConnected } from "@/lib/prisma";
import { adminCoachPostBodySchema } from "@/lib/validation/admin-coach";
import { hashPassword } from "@/server/auth/password";
import {
  getPrismaErrorMessageSnippet,
  getPrismaInitializationErrorCode,
  getPrismaKnownRequestCode,
  isPrismaInitializationError,
  isPrismaUnknownRequestError,
  isPrismaValidationError,
} from "@/lib/prisma-errors";

export const runtime = "nodejs";

/** ADMIN: create a new coach account or promote an existing user to coach + coach profile. */
export async function POST(req: Request) {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    if (e instanceof AuthError) return e.kind === "UNAUTHORIZED" ? unauthorized() : forbidden();
    throw e;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_JSON", "Request body must be valid JSON.", 400);
  }
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return fail("INVALID_JSON", "Request body must be a JSON object.", 400);
  }

  const parsed = adminCoachPostBodySchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const coachPayload = {
    type: parsed.data.type,
    bio: parsed.data.bio,
    sessionPaise: parsed.data.sessionPaise,
    qualification: parsed.data.qualification,
    experienceYrs: parsed.data.experienceYrs,
    specialty: parsed.data.specialty,
    available: parsed.data.available,
  };

  try {
    await ensurePrismaConnected();
  } catch {
    return fail("DATABASE_UNAVAILABLE", "Database is temporarily unavailable.", 503);
  }

  if (parsed.data.mode === "create") {
    const { email, username, name } = parsed.data;
    const password = parsed.data.password;
    if (!password) {
      return validationError({ formErrors: ["Password is required."], fieldErrors: {} });
    }
    const passwordHash = await hashPassword(password);
    try {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            ...(email ? { email } : {}),
            ...(username ? { username } : {}),
            passwordHash,
            role: "COACH",
            city: "Ballari",
            ...(name?.trim() ? { name: name.trim() } : {}),
          },
          select: { id: true },
        });
        const coach = await tx.coach.create({
          data: {
            userId: user.id,
            type: coachPayload.type,
            bio: coachPayload.bio,
            sessionPaise: coachPayload.sessionPaise,
            qualification: coachPayload.qualification,
            experienceYrs: coachPayload.experienceYrs,
            specialty: coachPayload.specialty,
            available: coachPayload.available,
            ratingBps: 0,
            ratingCount: 0,
          },
          select: { id: true },
        });
        return { userId: user.id, coachId: coach.id };
      });
      return ok(result, { status: 201 });
    } catch (e) {
      if (isPrismaInitializationError(e)) {
        return fail("DATABASE_UNAVAILABLE", "Could not reach the database.", 503, {
          prismaCode: getPrismaInitializationErrorCode(e),
        });
      }
      const prismaCode = getPrismaKnownRequestCode(e);
      if (prismaCode === "P2002") {
        return fail("DUPLICATE", "An account with this email or username already exists.", 409);
      }
      if (prismaCode) {
        return fail("DATABASE_ERROR", "Could not create coach (database issue).", 503, { prismaCode });
      }
      if (isPrismaUnknownRequestError(e)) {
        return fail("DATABASE_ERROR", getPrismaErrorMessageSnippet(e) ?? "Database error.", 503);
      }
      if (isPrismaValidationError(e)) {
        return fail("DATABASE_ERROR", "Invalid data for database.", 400);
      }
      throw e;
    }
  }

  // promote
  const { promoteEmail, promoteUserId } = parsed.data;
  const user = await prisma.user.findFirst({
    where: promoteUserId ? { id: promoteUserId } : { email: promoteEmail! },
    select: { id: true, role: true, email: true },
  });
  if (!user) return notFound("No user matches that email or id.");

  if (user.role === "ADMIN") {
    return fail(
      "INVALID_TARGET",
      "Cannot change an ADMIN account to coach from here — use a dedicated role tool or database if you must.",
      422
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { role: "COACH" },
    });
    await tx.coach.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        type: coachPayload.type,
        bio: coachPayload.bio,
        sessionPaise: coachPayload.sessionPaise,
        qualification: coachPayload.qualification,
        experienceYrs: coachPayload.experienceYrs,
        specialty: coachPayload.specialty,
        available: coachPayload.available,
        ratingBps: 0,
        ratingCount: 0,
      },
      update: {
        type: coachPayload.type,
        bio: coachPayload.bio,
        sessionPaise: coachPayload.sessionPaise,
        qualification: coachPayload.qualification,
        experienceYrs: coachPayload.experienceYrs,
        specialty: coachPayload.specialty,
        available: coachPayload.available,
      },
      select: { id: true },
    });
  });

  const coachRow = await prisma.coach.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  return ok({ userId: user.id, coachId: coachRow?.id ?? null, promoted: true as const });
}
