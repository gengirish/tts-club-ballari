import { ok, unauthorized, validationError, forbidden } from "@/lib/api-response";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";
import { eventCreateSchema } from "@/lib/validation/events";
import { prisma } from "@/lib/prisma";

// GET /api/events — upcoming events (signed-in members) + registration counts + your registration
export async function GET() {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const now = new Date();
  const events = await prisma.event.findMany({
    where: { startsAt: { gte: now } },
    orderBy: { startsAt: "asc" },
    take: 50,
    include: {
      host: { select: { id: true, name: true } },
      _count: { select: { registrations: true } },
    },
  });

  const ids = events.map((e) => e.id);
  const myRegs =
    ids.length === 0
      ? []
      : await prisma.eventRegistration.findMany({
          where: { userId: user.id, eventId: { in: ids } },
          select: { id: true, eventId: true, checkedInAt: true },
        });
  const mineByEvent = new Map(myRegs.map((r) => [r.eventId, r]));

  const data = events.map((e) => {
    const mine = mineByEvent.get(e.id);
    const { _count, ...rest } = e;
    return {
      ...rest,
      registrationCount: _count.registrations,
      myRegistration: mine
        ? {
            id: mine.id,
            checkedInAt: mine.checkedInAt ? mine.checkedInAt.toISOString() : null,
          }
        : null,
    };
  });

  return ok(data);
}

// POST /api/events — HOST or ADMIN creates an event
export async function POST(req: Request) {
  let user;
  try {
    user = await requireRole("HOST");
  } catch (e) {
    if (e instanceof AuthError) return e.kind === "UNAUTHORIZED" ? unauthorized() : forbidden();
    throw e;
  }

  const json = await req.json().catch(() => null);
  const parsed = eventCreateSchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const {
    type,
    title,
    location,
    startsAt,
    capacity,
    lat,
    lng,
    publicRegistrationsOpen,
    paymentInstructions,
    whatsappGroupInviteUrl,
  } = parsed.data;

  const wa = whatsappGroupInviteUrl?.trim();
  const event = await prisma.event.create({
    data: {
      hostId: user.id,
      type,
      title,
      location,
      startsAt,
      capacity: capacity ?? null,
      lat: lat ?? null,
      lng: lng ?? null,
      publicRegistrationsOpen: publicRegistrationsOpen ?? false,
      paymentInstructions: paymentInstructions?.trim() || null,
      whatsappGroupInviteUrl: wa && wa.length > 0 ? wa : null,
    },
  });

  return ok(event, { status: 201 });
}
