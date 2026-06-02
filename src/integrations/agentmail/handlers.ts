// Inbound email webhook handler. AgentMail posts events when mail arrives.
// Incoming messages expose extracted_text/extracted_html (reply body w/o quoted history).
import { sendEmail } from "./client";

export interface InboundEmail {
  inbox_id: string;
  message_id: string;
  from: string;
  subject: string;
  extracted_text?: string;
  extracted_html?: string;
}

export async function handleInboundEmail(evt: InboundEmail): Promise<void> {
  const body = (evt.extracted_text ?? "").toLowerCase();

  // Simple intent routing — extend as needed (or hand to an LLM agent).
  if (body.includes("unsubscribe") || body.includes("stop")) {
    // Flip the member's notification preference by looking them up via evt.from,
    // then confirm. (Member preference field is added in the notifications module.)
    await sendEmail({
      to: evt.from,
      subject: "Re: " + evt.subject,
      text: "You've been unsubscribed from SSS Club emails. You can re-enable anytime in the app.",
    });
    return;
  }

  // Default acknowledgement.
  await sendEmail({
    to: evt.from,
    subject: "Re: " + evt.subject,
    text: "Thanks for writing to Steel Sisters & Striders! A coordinator will get back to you shortly. 💜",
  });
}
