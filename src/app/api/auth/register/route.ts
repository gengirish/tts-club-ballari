import { ok, fail, validationError } from "@/lib/api-response";
import {
  getPrismaErrorMessageSnippet,
  getPrismaInitializationErrorCode,
  getPrismaKnownRequestCode,
  isPrismaInitializationError,
  isPrismaUnknownRequestError,
  isPrismaValidationError,
} from "@/lib/prisma-errors";
import { prisma, ensurePrismaConnected } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation/auth";
import { hashPassword } from "@/server/auth/password";

export const runtime = "nodejs";

// POST /api/auth/register — create member with email and/or username + password
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(
      "INVALID_JSON",
      "Request body must be valid JSON with a password and an email and/or username.",
      400
    );
  }
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return fail(
      "INVALID_JSON",
      "Request body must be a JSON object with a password and an email and/or username.",
      400
    );
  }
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const email = parsed.data.email?.trim().toLowerCase();
  const username = parsed.data.username;
  const passwordHash = await hashPassword(parsed.data.password);
  const name = parsed.data.name?.trim();

  try {
    await ensurePrismaConnected();
    const user = await prisma.user.create({
      data: {
        ...(email ? { email } : {}),
        ...(username ? { username } : {}),
        passwordHash,
        ...(name ? { name } : {}),
        role: "MEMBER",
        city: "Ballari",
      },
      select: { id: true },
    });
    return ok({ userId: user.id }, { status: 201 });
  } catch (e) {
    if (isPrismaInitializationError(e)) {
      return fail(
        "DATABASE_UNAVAILABLE",
        "We couldn't create your account right now. Please try again in a few minutes.",
        503,
        { prismaCode: getPrismaInitializationErrorCode(e) }
      );
    }

    const prismaCode = getPrismaKnownRequestCode(e);
    if (prismaCode === "P2002") {
      return fail("DUPLICATE", "An account with this email or username already exists", 409);
    }
    if (prismaCode) {
      return fail(
        "DATABASE_ERROR",
        "Could not save your account (database issue). Try again in a moment or contact support if it continues.",
        503,
        { prismaCode }
      );
    }

    if (isPrismaUnknownRequestError(e)) {
      return fail(
        "DATABASE_ERROR",
        "Could not save your account (database issue). Try again in a moment or contact support if it continues.",
        503,
        { prismaMessage: getPrismaErrorMessageSnippet(e) }
      );
    }

    if (isPrismaValidationError(e)) {
      return fail(
        "REGISTRATION_INVALID",
        "Your sign-up data could not be applied. Check the fields and try again.",
        400,
        { prismaMessage: getPrismaErrorMessageSnippet(e) }
      );
    }

    console.error("[register]", e);
    return fail(
      "REGISTRATION_FAILED",
      "Could not create your account. Please try again.",
      500
    );
  }
}
