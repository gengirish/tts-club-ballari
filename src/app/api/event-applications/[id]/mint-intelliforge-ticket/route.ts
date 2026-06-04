import { ok, unauthorized, forbidden, notFound, fail } from "@/lib/api-response";
import { requireAuth, AuthError } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getPublicAppOrigin } from "@/lib/public-app-url";
import {
  isIntelliforgeTicketMintingConfigured,
  mintIntelliforgeEntryTicket,
} from "@/lib/integrations/intelliforge-receipt";

async function assertCanReviewApplication(userId: string, role: string, applicationId: string) {
  const app = await prisma.eventApplication.findUnique({
    where: { id: applicationId },
    include: { event: { select: { hostId: true, title: true, startsAt: true, location: true, lat: true, lng: true } } },
  });
  if (!app) return null;
  if (role === "ADMIN") return app;
  if (role === "HOST" && app.event.hostId === userId) return app;
  return "forbidden" as const;
}

function mapsUrlForEvent(event: { lat: number | null; lng: number | null }): string {
  if (event.lat != null && event.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.lat},${event.lng}`)}`;
  }
  return "";
}

// POST /api/event-applications/:id/mint-intelliforge-ticket — retry or refresh signed entry ticket
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  if (!["HOST", "ADMIN"].includes(user.role)) return forbidden();

  if (!isIntelliforgeTicketMintingConfigured()) {
    return fail("NOT_CONFIGURED", "Set INTELLIFORGE_API_KEY to mint tickets.", 503);
  }

  const gate = await assertCanReviewApplication(user.id, user.role, params.id);
  if (gate === "forbidden") return forbidden();
  if (!gate) return notFound("Application not found");

  if (gate.status !== "APPROVED" || !gate.passToken) {
    return fail("INVALID_STATE", "Only approved applications with a pass can mint a ticket.", 409);
  }

  const origin = getPublicAppOrigin();
  const passUrl = `${origin}/e/pass/${encodeURIComponent(gate.passToken)}`;
  const mapsUrl = mapsUrlForEvent(gate.event);

  const minted = await mintIntelliforgeEntryTicket({
    payerName: gate.applicantName,
    participantPhone: gate.phone,
    eventName: gate.event.title,
    eventStartsAt: gate.event.startsAt,
    venueName: gate.event.location,
    mapsUrl: mapsUrl || undefined,
    transactionId: `SSS-EVT-${gate.id}`,
    sssPassUrl: passUrl,
    idempotencyKey: `sss-club-event-app-${gate.id}`,
  });

  if (!minted.ok) {
    return fail("INTELLIFORGE_ERROR", minted.error, 502);
  }

  await prisma.eventApplication.update({
    where: { id: gate.id },
    data: {
      intelliforgeReceiptId: minted.receiptId,
      intelliforgeTicketUrl: minted.url,
      intelliforgeTicketDownloadUrl: minted.downloadUrl,
    },
  });

  return ok({
    receiptId: minted.receiptId,
    url: minted.url,
    downloadUrl: minted.downloadUrl,
    whatsappSent: minted.whatsappSent,
    emailSent: minted.emailSent,
  });
}
