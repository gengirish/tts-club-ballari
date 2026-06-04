import type { Prisma } from "@prisma/client";
import { ok, unauthorized, validationError, fail, notFound } from "@/lib/api-response";
import { requireAuth, AuthError } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { c25kOrderBodySchema } from "@/lib/validation/program";
import { scheduleC25kSessionReminders } from "@/server/programs/schedule-c25k-reminders";

export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const json = await req.json().catch(() => null);
  const parsed = c25kOrderBodySchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const program = await prisma.program.findUnique({ where: { slug: "couch-to-5k" } });
  if (!program) return notFound("Program not found");

  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  const devBypass =
    process.env.NODE_ENV === "development" &&
    process.env.C25K_DEV_CHECKOUT === "1" &&
    (!keyId || !keySecret);

  if (devBypass) {
    const assessmentJson = parsed.data.assessment as unknown as Prisma.InputJsonValue;
    const coach = await prisma.coach.findFirst({ where: { available: true }, orderBy: { createdAt: "asc" } });
    await prisma.programEnrollment.upsert({
      where: { programId_memberId: { programId: program.id, memberId: user.id } },
      create: {
        programId: program.id,
        memberId: user.id,
        coachId: coach?.id ?? null,
        assessment: assessmentJson,
        status: "ACTIVE",
      },
      update: {
        assessment: assessmentJson,
        status: "ACTIVE",
        coachId: coach?.id ?? undefined,
      },
    });
    const enrollment = await prisma.programEnrollment.findUnique({
      where: { programId_memberId: { programId: program.id, memberId: user.id } },
    });
    if (enrollment) await scheduleC25kSessionReminders(enrollment.id);
    return ok({ devCheckout: true as const });
  }

  if (!keyId || !keySecret) {
    return fail(
      "PAYMENTS_DISABLED",
      "Online payment is not available right now. Please try again later or contact the club for help enrolling.",
      503
    );
  }

  const Razorpay = (await import("razorpay")).default;
  const rz = new Razorpay({ key_id: keyId, key_secret: keySecret });

  const order = await rz.orders.create({
    amount: program.pricePaise,
    currency: "INR",
    receipt: `c25k_${user.id.slice(0, 12)}_${Date.now()}`,
    notes: {
      userId: user.id,
      programSlug: program.slug,
      assessment: JSON.stringify(parsed.data.assessment),
    },
  });

  await prisma.payment.create({
    data: {
      userId: user.id,
      programId: program.id,
      amountPaise: program.pricePaise,
      razorpayOrderId: order.id as string,
      status: "created",
    },
  });

  return ok({
    orderId: order.id as string,
    amountPaise: program.pricePaise,
    currency: "INR",
    keyId,
  });
}
