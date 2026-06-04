import { ok, unauthorized, validationError, forbidden } from "@/lib/api-response";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";
import { eventCreateSchema } from "@/lib/validation/events";
import { prisma } from "@/lib/prisma";

// GET /api/events — upcoming events (signed-in members)
export async function GET() {
  try {
    await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const now = new Date();
  const events = await prisma.event.findMany({
    where: { startsAt: { gte: now } },
    orderBy: { startsAt: "asc" },
    take: 50,
    include: { host: { select: { id: true, name: true } }, registrations: { select: { id: true } } },
  });
  return ok(events);
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
