import { ok, forbidden, unauthorized, validationError, fail } from "@/lib/api-response";
import { requireRole, requireAuth, AuthError } from "@/lib/rbac";
import { onboardingSchema } from "@/lib/validation/member";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { listAdminMemberDirectory } from "@/server/admin/member-directory";

// GET /api/members  -> ADMIN only: list members
export async function GET() {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    if (e instanceof AuthError) return e.kind === "UNAUTHORIZED" ? unauthorized() : forbidden();
    throw e;
  }

  const members = await listAdminMemberDirectory();
  return ok(members);
}

// POST /api/members  -> signed-in user completes onboarding (self)
export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const json = await req.json().catch(() => null);
  const parsed = onboardingSchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const { name, email, dob, gender, occupation, city, health, goals } = parsed.data;
  const uniqueGoals = [...new Set(goals)];

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { name, email, dob, gender, occupation, city },
      }),
      prisma.healthProfile.upsert({
        where: { userId: user.id },
        update: health,
        create: { userId: user.id, ...health },
      }),
      prisma.memberGoal.deleteMany({ where: { userId: user.id } }),
      prisma.memberGoal.createMany({
        data: uniqueGoals.map((goal) => ({ userId: user.id, goal })),
      }),
    ]);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return fail("CONFLICT", "That email is already linked to another account.", 409);
    }
    throw e;
  }

  return ok({ onboarded: true }, { status: 201 });
}
