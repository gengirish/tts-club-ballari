import { ok, fail } from "@/lib/api-response";
import { handleInboundEmail, type InboundEmail } from "@/integrations/agentmail/handlers";

// POST /api/webhooks/agentmail  -> inbound email events
export async function POST(req: Request) {
  const secret = req.headers.get("x-agentmail-signature") ?? req.headers.get("x-webhook-secret");
  if (process.env.AGENTMAIL_WEBHOOK_SECRET && secret !== process.env.AGENTMAIL_WEBHOOK_SECRET) {
    return fail("UNAUTHORIZED", "Bad webhook signature", 401);
  }

  const evt = (await req.json().catch(() => null)) as { type?: string; data?: InboundEmail } | null;
  if (!evt?.data) return fail("BAD_PAYLOAD", "Missing event data", 400);

  if (evt.type === "message.received" || evt.type === "inbound") {
    await handleInboundEmail(evt.data);
  }
  return ok({ received: true });
}
