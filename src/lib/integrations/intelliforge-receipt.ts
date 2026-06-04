/**
 * Mint a signed event entry ticket via IntelliForge Certificates (POST /api/receipt).
 * @see https://certs.intelliforge.tech/docs
 */

export type MintIntelliforgeTicketInput = {
  payerName: string;
  participantPhone: string;
  eventName: string;
  eventStartsAt: Date;
  venueName: string;
  /** Optional Google Maps URL (short link or place URL). */
  mapsUrl?: string | null;
  /** Synthetic stable id for receipt payload (unique per application). */
  transactionId: string;
  /** SSS Club pass URL shown on the ticket description. */
  sssPassUrl: string;
  /** Idempotency for IntelliForge (safe retries). */
  idempotencyKey: string;
};

export type MintIntelliforgeTicketResult =
  | { ok: true; receiptId: string; url: string; downloadUrl: string; whatsappSent: boolean; emailSent: boolean }
  | { ok: false; error: string };

function baseUrl(): string {
  const raw = process.env.INTELLIFORGE_CERTS_BASE_URL?.trim() || "https://certs.intelliforge.tech";
  return raw.replace(/\/$/, "");
}

function apiKey(): string | null {
  const k = process.env.INTELLIFORGE_API_KEY?.trim();
  return k || null;
}

export function isIntelliforgeTicketMintingConfigured(): boolean {
  return Boolean(apiKey());
}

export async function mintIntelliforgeEntryTicket(input: MintIntelliforgeTicketInput): Promise<MintIntelliforgeTicketResult> {
  const key = apiKey();
  if (!key) {
    return { ok: false, error: "INTELLIFORGE_API_KEY is not set" };
  }

  const eventDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(input.eventStartsAt);

  const eventTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(input.eventStartsAt);

  const paymentDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const body: Record<string, string> = {
    payer_name: input.payerName.trim(),
    event_name: input.eventName.trim(),
    event_date: eventDate,
    event_time: eventTime,
    venue_name: input.venueName.trim(),
    address: "",
    maps_url: (input.mapsUrl ?? "").trim(),
    amount: "Host-verified payment",
    currency: "",
    payment_date: paymentDate,
    payment_method: "UPI / screenshot (SSS Club host approved)",
    transaction_id: input.transactionId.trim(),
    description: `SSS Club check-in pass: ${input.sssPassUrl}`,
    participant_phone: input.participantPhone.trim(),
    participant_email: "",
    idempotency_key: input.idempotencyKey,
  };

  const url = `${baseUrl()}/api/receipt`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": key,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25_000),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Request failed";
    return { ok: false, error: msg };
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return { ok: false, error: `IntelliForge returned non-JSON (HTTP ${res.status})` };
  }

  if (!res.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : JSON.stringify(data).slice(0, 500);
    return { ok: false, error: `HTTP ${res.status}: ${detail}` };
  }

  if (typeof data !== "object" || data === null) {
    return { ok: false, error: "Invalid IntelliForge response" };
  }

  const o = data as Record<string, unknown>;
  const receiptId = typeof o.receipt_id === "string" ? o.receipt_id : "";
  const ticketUrl = typeof o.url === "string" ? o.url : "";
  const downloadUrl = typeof o.download_url === "string" ? o.download_url : "";
  if (!receiptId || !ticketUrl || !downloadUrl) {
    return { ok: false, error: "IntelliForge response missing receipt fields" };
  }

  return {
    ok: true,
    receiptId,
    url: ticketUrl,
    downloadUrl,
    whatsappSent: Boolean(o.whatsapp_sent),
    emailSent: Boolean(o.email_sent),
  };
}
