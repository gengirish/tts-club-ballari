import { NextResponse } from "next/server";
import crypto from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { scheduleC25kSessionReminders } from "@/server/programs/schedule-c25k-reminders";

export const runtime = "nodejs";

type RazorpayWebhook = {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; notes?: Record<string, string> } };
  };
};

function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: { code: "CONFIG", message: "Webhook secret missing" } },
      { status: 503 }
    );
  }

  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  if (!verifySignature(raw, signature, secret)) {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_SIGNATURE", message: "Bad signature" } },
      { status: 400 }
    );
  }

  let body: RazorpayWebhook;
  try {
    body = JSON.parse(raw) as RazorpayWebhook;
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_JSON", message: "Invalid JSON" } },
      { status: 400 }
    );
  }

  if (body.event !== "payment.captured") {
    return NextResponse.json({ ok: true, data: { ignored: true } });
  }

  const entity = body.payload?.payment?.entity;
  const paymentId = entity?.id;
  const orderId = entity?.order_id;
  const notes = entity?.notes ?? {};
  if (!paymentId || !orderId) {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_PAYLOAD", message: "Missing ids" } },
      { status: 422 }
    );
  }

  const existingPaid = await prisma.payment.findFirst({
    where: { razorpayPaymentId: paymentId, status: "paid" },
  });
  if (existingPaid) {
    return NextResponse.json({ ok: true, data: { idempotent: true } });
  }

  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } });
  if (!payment) {
    return NextResponse.json(
      { ok: false, error: { code: "UNKNOWN_ORDER", message: "Order not found" } },
      { status: 404 }
    );
  }

  if (payment.status === "paid") {
    return NextResponse.json({ ok: true, data: { idempotent: true } });
  }

  const userId = notes.userId;
  const programSlug = notes.programSlug;
  if (!userId || programSlug !== "couch-to-5k") {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_NOTES", message: "Bad metadata" } },
      { status: 422 }
    );
  }

  let assessment: unknown = null;
  try {
    if (notes.assessment) assessment = JSON.parse(notes.assessment) as unknown;
  } catch {
    assessment = null;
  }

  const program = await prisma.program.findUnique({ where: { slug: "couch-to-5k" } });
  if (!program) {
    return NextResponse.json(
      { ok: false, error: { code: "NO_PROGRAM", message: "Program missing" } },
      { status: 500 }
    );
  }

  const coach = await prisma.coach.findFirst({ where: { available: true }, orderBy: { createdAt: "asc" } });

  const assessmentJson: Prisma.InputJsonValue | undefined =
    assessment === null || assessment === undefined ? undefined : (assessment as Prisma.InputJsonValue);

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "paid", razorpayPaymentId: paymentId },
    }),
    prisma.programEnrollment.upsert({
      where: { programId_memberId: { programId: program.id, memberId: userId } },
      create: {
        programId: program.id,
        memberId: userId,
        coachId: coach?.id ?? null,
        assessment: assessmentJson,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        status: "ACTIVE",
      },
      update: {
        assessment: assessmentJson,
        razorpayPaymentId: paymentId,
        status: "ACTIVE",
        coachId: coach?.id ?? undefined,
      },
    }),
  ]);

  const enrollment = await prisma.programEnrollment.findUnique({
    where: { programId_memberId: { programId: program.id, memberId: userId } },
  });
  if (enrollment) {
    await scheduleC25kSessionReminders(enrollment.id);
  }

  return NextResponse.json({ ok: true, data: { processed: true } });
}
