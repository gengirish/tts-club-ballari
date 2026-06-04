import { ok, unauthorized, forbidden, notFound, fail, validationError } from "@/lib/api-response";
import { requireAuth, AuthError } from "@/lib/rbac";
import { rejectApplicationSchema } from "@/lib/validation/event-applications";
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

// POST /api/event-applications/:id/reject
export async function POST(req: Request, { params }: { params: { id: string } }) {
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

  if (gate.status !== "PENDING_REVIEW") {
    return fail("INVALID_STATE", "Only pending applications can be rejected.", 409);
  }

  const json = await req.json().catch(() => ({}));
  const parsed = rejectApplicationSchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  await prisma.eventApplication.update({
    where: { id: gate.id },
    data: {
      status: "REJECTED",
      rejectedReason: parsed.data.reason?.trim() ?? "Rejected",
      passToken: null,
      approvedAt: null,
      approvedById: null,
    },
  });

  return ok({ rejected: true });
}
