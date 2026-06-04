import { ok, notFound, fail, validationError } from "@/lib/api-response";
import { publicEventApplySchema } from "@/lib/validation/event-applications";
import { prisma } from "@/lib/prisma";
import { toE164 } from "@/lib/utils/phone";

const MAX_BYTES = 1_600_000; // ~1.5MB screenshot after decode

// POST /api/public/events/:id/apply — no auth
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: { id: true, publicRegistrationsOpen: true, startsAt: true, capacity: true },
  });

  if (!event) return notFound("Event not found");
  if (!event.publicRegistrationsOpen) {
    return fail("REGISTRATION_CLOSED", "Web registration is not open for this event.", 403);
  }
  if (event.startsAt.getTime() < Date.now()) {
    return fail("EVENT_ENDED", "This event has already started or finished.", 403);
  }

  const json = await req.json().catch(() => null);
  const parsed = publicEventApplySchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const phone = toE164(parsed.data.phone);
  if (!phone) return validationError({ fieldErrors: { phone: ["Invalid mobile number"] } }, "Invalid phone");

  let paymentBytes: Buffer;
  try {
    paymentBytes = Buffer.from(parsed.data.paymentScreenshotBase64, "base64");
  } catch {
    return validationError(
      { fieldErrors: { paymentScreenshotBase64: ["Invalid base64"] } },
      "Invalid screenshot encoding"
    );
  }

  if (paymentBytes.length < 200) {
    return validationError({ fieldErrors: { paymentScreenshotBase64: ["Image too small"] } }, "Invalid screenshot");
  }
  if (paymentBytes.length > MAX_BYTES) {
    return validationError(
      { fieldErrors: { paymentScreenshotBase64: ["Image too large (max ~1.5MB)"] } },
      "Screenshot too large"
    );
  }

  if (event.capacity != null) {
    const approved = await prisma.eventApplication.count({
      where: { eventId: event.id, status: "APPROVED" },
    });
    if (approved >= event.capacity) {
      return fail("EVENT_FULL", "This event is at capacity.", 409);
    }
  }

  const existingApproved = await prisma.eventApplication.findFirst({
    where: { eventId: event.id, phone, status: "APPROVED" },
  });
  if (existingApproved) {
    return fail("ALREADY_REGISTERED", "This number already has an approved pass for this event.", 409);
  }

  const pending = await prisma.eventApplication.findFirst({
    where: { eventId: event.id, phone, status: "PENDING_REVIEW" },
  });

  if (pending) {
    const updated = await prisma.eventApplication.update({
      where: { id: pending.id },
      data: {
        applicantName: parsed.data.applicantName.trim(),
        age: parsed.data.age,
        gender: parsed.data.gender,
        city: parsed.data.city.trim(),
        paymentScreenshot: paymentBytes as unknown as Uint8Array<ArrayBuffer>,
        paymentScreenshotMime: parsed.data.paymentScreenshotMime,
      },
      select: { id: true, status: true },
    });
    return ok({ applicationId: updated.id, status: updated.status, updated: true }, { status: 200 });
  }

  const created = await prisma.eventApplication.create({
    data: {
      eventId: event.id,
      applicantName: parsed.data.applicantName.trim(),
      phone,
      age: parsed.data.age,
      gender: parsed.data.gender,
      city: parsed.data.city.trim(),
      paymentScreenshot: paymentBytes as unknown as Uint8Array<ArrayBuffer>,
      paymentScreenshotMime: parsed.data.paymentScreenshotMime,
    },
    select: { id: true, status: true },
  });

  return ok({ applicationId: created.id, status: created.status, updated: false }, { status: 201 });
}
