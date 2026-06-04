import { ok, unauthorized, forbidden, notFound, fail, validationError } from "@/lib/api-response";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({ passToken: z.string().min(10).max(200) });

// POST /api/events/:id/guest-check-in — HOST (own event) or ADMIN; marks guest pass used at gate
export async function POST(req: Request, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireRole("HOST");
  } catch (e) {
    if (e instanceof AuthError) return e.kind === "UNAUTHORIZED" ? unauthorized() : forbidden();
    throw e;
  }

  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event) return notFound("Event not found");
  if (user.role !== "ADMIN" && event.hostId !== user.id) return forbidden();

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const app = await prisma.eventApplication.findFirst({
    where: {
      eventId: params.id,
      passToken: parsed.data.passToken,
      status: "APPROVED",
    },
  });
  if (!app) return fail("INVALID_PASS", "No approved guest matches this pass.", 404);

  const updated = await prisma.eventApplication.update({
    where: { id: app.id },
    data: { checkedInAt: new Date() },
    select: { id: true, applicantName: true, phone: true, checkedInAt: true },
  });

  return ok(updated);
}
