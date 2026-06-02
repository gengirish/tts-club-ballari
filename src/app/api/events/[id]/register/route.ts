import { ok, unauthorized, notFound, validationError, fail } from "@/lib/api-response";
import { requireAuth, AuthError } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { scheduleEventReminderForRegistrant } from "@/server/notifications/event-reminder";
import { z } from "zod";

const registerBodySchema = z.object({}).strict();

// POST /api/events/:id/register
export async function POST(req: Request, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const json = await req.json().catch(() => ({}));
  const parsed = registerBodySchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event) return notFound("Event not found");

  if (event.capacity != null) {
    const count = await prisma.eventRegistration.count({ where: { eventId: event.id } });
    if (count >= event.capacity) {
      return fail("EVENT_FULL", "This event is at capacity.", 409);
    }
  }

  const reg = await prisma.eventRegistration.upsert({
    where: { eventId_userId: { eventId: event.id, userId: user.id } },
    update: {},
    create: { eventId: event.id, userId: user.id },
  });

  await scheduleEventReminderForRegistrant(event.id, user.id);

  return ok({ registered: true, registrationId: reg.id }, { status: 201 });
}
