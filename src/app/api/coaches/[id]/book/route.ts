import { z } from "zod";
import { enqueueNotification } from "@/queue/queues";
import { ok, unauthorized, notFound, validationError } from "@/lib/api-response";
import { requireAuth, AuthError } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

const bookBodySchema = z.object({}).strict();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const json = await req.json().catch(() => ({}));
  const parsed = bookBodySchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const coach = await prisma.coach.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true, phone: true, email: true } } },
  });
  if (!coach) return notFound("Coach not found");

  const member = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, phone: true, email: true },
  });
  const inbox = process.env.COACH_BOOKING_INBOX ?? process.env.SOS_FORWARD_EMAIL;
  if (inbox) {
    await enqueueNotification({
      kind: "email",
      to: inbox,
      subject: `Coach booking request — ${coach.user.name ?? "Coach"}`,
      html: `<p>Member: ${member?.name ?? ""} (${member?.phone ?? member?.email ?? "—"})</p><p>Coach: ${coach.user.name} (${coach.user.phone ?? coach.user.email ?? "—"})</p><p>Coach id: ${coach.id}</p>`,
    });
  }

  return ok({ requested: true });
}
