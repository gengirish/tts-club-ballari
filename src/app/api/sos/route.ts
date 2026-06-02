import { ok, unauthorized, validationError } from "@/lib/api-response";
import { requireAuth, AuthError } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { sosCreateSchema } from "@/lib/validation/sos";
import { enqueueNotification } from "@/queue/queues";

export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const json = await req.json().catch(() => null);
  const parsed = sosCreateSchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const alert = await prisma.sosAlert.create({
    data: {
      userId: user.id,
      lat: parsed.data.lat ?? null,
      lng: parsed.data.lng ?? null,
      eventId: parsed.data.eventId ?? null,
    },
  });

  const forward = process.env.SOS_FORWARD_EMAIL;
  if (forward) {
    const u = await prisma.user.findUnique({ where: { id: user.id }, select: { name: true, phone: true } });
    await enqueueNotification({
      kind: "email",
      to: forward,
      subject: "SSS SOS alert",
      html: `<p><b>SOS</b> from ${u?.name ?? "member"} (${u?.phone}).</p><p>Alert id: ${alert.id}</p>`,
    });
  }

  return ok({ alertId: alert.id }, { status: 201 });
}
