import { Prisma } from "@prisma/client";
import { ok, fail, validationError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation/auth";
import { hashPassword } from "@/server/auth/password";

// POST /api/auth/register — create member with email and/or username + password
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const email = parsed.data.email?.trim().toLowerCase();
  const username = parsed.data.username;
  const passwordHash = await hashPassword(parsed.data.password);
  const name = parsed.data.name?.trim();

  try {
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
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return fail("DUPLICATE", "An account with this email or username already exists", 409);
      }
      return fail(
        "DATABASE_ERROR",
        "Could not save your account (database issue). Try again in a moment or contact support if it continues.",
        503,
        { prismaCode: e.code }
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
