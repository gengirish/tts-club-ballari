import { requireAuth, AuthError } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function assertCanReviewApplication(userId: string, role: string, applicationId: string) {
  const app = await prisma.eventApplication.findUnique({
    where: { id: applicationId },
    include: { event: { select: { hostId: true } } },
  });
  if (!app) return null;
  if (role === "ADMIN") return app;
  if (role === "HOST" && app.event.hostId === userId) return app;
  return "forbidden" as const;
}

// GET /api/event-applications/:id/payment-proof — raw image bytes
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
    throw e;
  }

  if (!["HOST", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } }, { status: 403 });
  }

  const gate = await assertCanReviewApplication(user.id, user.role, params.id);
  if (gate === "forbidden") {
    return NextResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } }, { status: 403 });
  }
  if (!gate) {
    return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Not found" } }, { status: 404 });
  }

  const buf = Buffer.from(gate.paymentScreenshot);
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": gate.paymentScreenshotMime,
      "Cache-Control": "private, no-store",
    },
  });
}
