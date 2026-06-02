// AISensy WhatsApp API client.
// Sends pre-approved template messages via API Campaigns.
// Endpoint + payload per AiSensy API Reference (backend.aisensy.com/campaign/t1/api/v2).
// NOTE: campaignName must map to a template already created + approved in the AiSensy dashboard.

const API_URL = process.env.AISENSY_API_URL ?? "https://backend.aisensy.com/campaign/t1/api/v2";

export interface AisensyParams {
  campaignName: string;        // approved campaign/template name
  destination: string;         // recipient phone, E.164 without "+" works; we pass full E.164
  userName: string;            // contact display name
  templateParams?: string[];   // ordered {{1}}, {{2}} ... values
  media?: { url: string; filename: string };
  tags?: string[];
  attributes?: Record<string, string>;
}

export interface AisensyResult {
  success: boolean;
  status: number;
  body: unknown;
}

export async function sendWhatsApp(params: AisensyParams): Promise<AisensyResult> {
  const apiKey = process.env.AISENSY_API_KEY;
  if (!apiKey) throw new Error("AISENSY_API_KEY is not set");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey,
      campaignName: params.campaignName,
      destination: params.destination,
      userName: params.userName,
      source: "sss-club-app",
      media: params.media,
      templateParams: params.templateParams ?? [],
      tags: params.tags ?? ["sss-club"],
      attributes: params.attributes ?? {},
    }),
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }
  return { success: res.ok, status: res.status, body };
}
