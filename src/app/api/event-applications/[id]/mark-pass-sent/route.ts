import { ok, unauthorized, forbidden, notFound, fail } from "@/lib/api-response";
import { requireAuth, AuthError } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

async function assertCanReviewApplication(userId: string, role: string, applicationId: string) {
  const app = await prisma.eventApplication.findUnique({
    where: { id: applicationId },
    include: { event: { select: { hostId: true } } },
  });
  if (!app) return null;
  if (role === "ADMIN") return app;
  if (role === "HOST" && app.event.hostId === userId) return app;
  return "forbidden" as const;
}

// POST /api/event-applications/:id/mark-pass-sent
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  if (!["HOST", "ADMIN"].includes(user.role)) return forbidden();

  const gate = await assertCanReviewApplication(user.id, user.role, params.id);
  if (gate === "forbidden") return forbidden();
  if (!gate) return notFound("Application not found");

  if (gate.status !== "APPROVED") {
    return fail("INVALID_STATE", "Only approved applications can be marked as dispatched.", 409);
  }

  const updated = await prisma.eventApplication.update({
    where: { id: gate.id },
    data: { passDispatchedAt: new Date() },
    select: { passDispatchedAt: true },
  });

  return ok({ passDispatchedAt: updated.passDispatchedAt!.toISOString() });
}
