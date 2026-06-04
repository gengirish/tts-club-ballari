import { ok, notFound, fail } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

// GET /api/public/events/:id — no auth; only when public registrations are open
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      location: true,
      startsAt: true,
      type: true,
      publicRegistrationsOpen: true,
      paymentInstructions: true,
    },
  });

  if (!event) return notFound("Event not found");
  if (!event.publicRegistrationsOpen) {
    return fail("REGISTRATION_CLOSED", "Web registration is not open for this event.", 403);
  }

  return ok({
    id: event.id,
    title: event.title,
    location: event.location,
    startsAt: event.startsAt,
    type: event.type,
    paymentInstructions: event.paymentInstructions,
  });
}
