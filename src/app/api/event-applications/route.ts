import { ok, unauthorized, forbidden, validationError } from "@/lib/api-response";
import { requireAuth, AuthError } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  eventId: z.string().cuid().optional(),
});

// GET /api/event-applications — ADMIN all; HOST only own events (optionally filter eventId)
export async function GET(req: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  if (!["HOST", "ADMIN"].includes(user.role)) return forbidden();

  const { searchParams } = new URL(req.url);
  const q = querySchema.safeParse({ eventId: searchParams.get("eventId") ?? undefined });
  if (!q.success) return validationError(q.error.flatten());

  const where: {
    eventId?: string;
    event?: { hostId: string };
  } = {};

  if (user.role === "HOST") {
    where.event = { hostId: user.id };
  }
  if (q.data.eventId) {
    if (user.role === "HOST") {
      const ev = await prisma.event.findFirst({
        where: { id: q.data.eventId, hostId: user.id },
        select: { id: true },
      });
      if (!ev) return forbidden("Not your event");
    }
    where.eventId = q.data.eventId;
  }

  const [rows, pending, approved, rejected, dispatched] = await Promise.all([
    prisma.eventApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        eventId: true,
        applicantName: true,
        phone: true,
        age: true,
        gender: true,
        city: true,
        status: true,
        passToken: true,
        approvedAt: true,
        passDispatchedAt: true,
        checkedInAt: true,
        intelliforgeReceiptId: true,
        intelliforgeTicketUrl: true,
        intelliforgeTicketDownloadUrl: true,
        createdAt: true,
        event: { select: { title: true, startsAt: true, whatsappGroupInviteUrl: true } },
      },
    }),
    prisma.eventApplication.count({ where: { ...where, status: "PENDING_REVIEW" } }),
    prisma.eventApplication.count({ where: { ...where, status: "APPROVED" } }),
    prisma.eventApplication.count({ where: { ...where, status: "REJECTED" } }),
    prisma.eventApplication.count({
      where: { ...where, status: "APPROVED", passDispatchedAt: { not: null } },
    }),
  ]);

  const totals = {
    pending,
    approved,
    rejected,
    passDispatched: dispatched,
    listed: rows.length,
  };

  return ok({ applications: rows, totals });
}
