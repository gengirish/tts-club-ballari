import { ok, unauthorized, validationError, forbidden, notFound } from "@/lib/api-response";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";
import { eventPatchSchema } from "@/lib/validation/events";
import { prisma } from "@/lib/prisma";

async function loadEventForManager(eventId: string, userId: string, role: string) {
  const ev = await prisma.event.findUnique({ where: { id: eventId } });
  if (!ev) return null;
  if (role === "ADMIN" || ev.hostId === userId) return ev;
  return "forbidden" as const;
}

// GET /api/events/:id — host (own) or admin
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const gate = await loadEventForManager(params.id, user.id, user.role);
  if (gate === "forbidden") return forbidden();
  if (!gate) return notFound("Event not found");

  const [pending, approved, rejected, dispatched] = await Promise.all([
    prisma.eventApplication.count({ where: { eventId: params.id, status: "PENDING_REVIEW" } }),
    prisma.eventApplication.count({ where: { eventId: params.id, status: "APPROVED" } }),
    prisma.eventApplication.count({ where: { eventId: params.id, status: "REJECTED" } }),
    prisma.eventApplication.count({
      where: { eventId: params.id, status: "APPROVED", passDispatchedAt: { not: null } },
    }),
  ]);

  return ok({
    event: gate,
    applicationStats: { pending, approved, rejected, passDispatched: dispatched },
  });
}

// PATCH /api/events/:id — host (own) or admin
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireRole("HOST");
  } catch (e) {
    if (e instanceof AuthError) return e.kind === "UNAUTHORIZED" ? unauthorized() : forbidden();
    throw e;
  }

  const gate = await loadEventForManager(params.id, user.id, user.role);
  if (gate === "forbidden") return forbidden();
  if (!gate) return notFound("Event not found");

  const json = await req.json().catch(() => null);
  const parsed = eventPatchSchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const d = parsed.data;
  const wa = d.whatsappGroupInviteUrl !== undefined ? d.whatsappGroupInviteUrl?.trim() : undefined;

  const data: Record<string, unknown> = {};
  if (d.type !== undefined) data.type = d.type;
  if (d.title !== undefined) data.title = d.title;
  if (d.location !== undefined) data.location = d.location;
  if (d.startsAt !== undefined) data.startsAt = d.startsAt;
  if (d.capacity !== undefined) data.capacity = d.capacity;
  if (d.lat !== undefined) data.lat = d.lat;
  if (d.lng !== undefined) data.lng = d.lng;
  if (d.publicRegistrationsOpen !== undefined) data.publicRegistrationsOpen = d.publicRegistrationsOpen;
  if (d.paymentInstructions !== undefined) {
    data.paymentInstructions = d.paymentInstructions?.trim() || null;
  }
  if (wa !== undefined) {
    data.whatsappGroupInviteUrl = wa && wa.length > 0 ? wa : null;
  }

  const updated = await prisma.event.update({
    where: { id: params.id },
    data,
  });

  return ok(updated);
}
