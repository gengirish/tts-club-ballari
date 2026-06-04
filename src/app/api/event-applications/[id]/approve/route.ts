import { randomBytes } from "crypto";
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
    include: {
      event: { select: { hostId: true, title: true, startsAt: true, location: true, lat: true, lng: true } },
    },
  });
  if (!app) return null;
  if (role === "ADMIN") return app;
  if (role === "HOST" && app.event.hostId === userId) return app;
  return "forbidden" as const;
}

function newPassToken(): string {
  return randomBytes(20).toString("base64url");
}

function mapsUrlForEvent(event: { lat: number | null; lng: number | null }): string {
  if (event.lat != null && event.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.lat},${event.lng}`)}`;
  }
  return "";
}

// POST /api/event-applications/:id/approve
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  if (!["HOST", "ADMIN"].includes(user.role)) return forbidden();

  const gate = await assertCanReviewApplication(user.id, user.role, params.id);
  if (gate === "forbidden") return forbidden();
  if (!gate) return notFound("Application not found");

  if (gate.status !== "PENDING_REVIEW") {
    return fail("INVALID_STATE", "Only pending applications can be approved.", 409);
  }

  const passToken = newPassToken();

  const updated = await prisma.eventApplication.update({
    where: { id: gate.id },
    data: {
      status: "APPROVED",
      passToken,
      approvedAt: new Date(),
      approvedById: user.id,
      rejectedReason: null,
    },
    select: {
      id: true,
      passToken: true,
      phone: true,
      applicantName: true,
      event: {
        select: {
          id: true,
          title: true,
          startsAt: true,
          location: true,
          lat: true,
          lng: true,
          whatsappGroupInviteUrl: true,
        },
      },
    },
  });

  const origin = getPublicAppOrigin();
  const passUrl = `${origin}/e/pass/${encodeURIComponent(updated.passToken!)}`;

  type IntelliforgePayload =
    | { status: "not_configured" }
    | {
        status: "issued";
        receiptId: string;
        url: string;
        downloadUrl: string;
        whatsappSent: boolean;
        emailSent: boolean;
      }
    | { status: "error"; message: string };

  let intelliforge: IntelliforgePayload = { status: "not_configured" };

  if (isIntelliforgeTicketMintingConfigured()) {
    const mapsUrl = mapsUrlForEvent(updated.event);
    const minted = await mintIntelliforgeEntryTicket({
      payerName: updated.applicantName,
      participantPhone: updated.phone,
      eventName: updated.event.title,
      eventStartsAt: updated.event.startsAt,
      venueName: updated.event.location,
      mapsUrl: mapsUrl || undefined,
      transactionId: `SSS-EVT-${updated.id}`,
      sssPassUrl: passUrl,
      idempotencyKey: `sss-club-event-app-${updated.id}`,
    });

    if (minted.ok) {
      await prisma.eventApplication.update({
        where: { id: updated.id },
        data: {
          intelliforgeReceiptId: minted.receiptId,
          intelliforgeTicketUrl: minted.url,
          intelliforgeTicketDownloadUrl: minted.downloadUrl,
        },
      });
      intelliforge = {
        status: "issued",
        receiptId: minted.receiptId,
        url: minted.url,
        downloadUrl: minted.downloadUrl,
        whatsappSent: minted.whatsappSent,
        emailSent: minted.emailSent,
      };
    } else {
      intelliforge = { status: "error", message: minted.error };
    }
  }

  return ok({
    applicationId: updated.id,
    passToken: updated.passToken,
    phone: updated.phone,
    applicantName: updated.applicantName,
    event: updated.event,
    passUrl,
    intelliforge,
  });
}
