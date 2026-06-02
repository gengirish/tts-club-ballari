import { ok, unauthorized, notFound, validationError } from "@/lib/api-response";
import { requireAuth, AuthError } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const checkInBodySchema = z.object({}).strict();

// POST /api/events/:id/check-in — member marks attendance
export async function POST(req: Request, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const json = await req.json().catch(() => ({}));
  const parsed = checkInBodySchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const reg = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId: params.id, userId: user.id } },
  });
  if (!reg) return notFound("Registration not found");

  const updated = await prisma.eventRegistration.update({
    where: { id: reg.id },
    data: { checkedInAt: new Date() },
  });

  return ok({ checkedInAt: updated.checkedInAt });
}
