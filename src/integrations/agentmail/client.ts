// AgentMail email client (two-way). Docs: https://docs.agentmail.to
// SDK: `agentmail` (AgentMailClient). One shared inbox for the club.
import { AgentMailClient } from "agentmail";

let _client: AgentMailClient | null = null;
function client(): AgentMailClient {
  if (!_client) {
    const apiKey = process.env.AGENTMAIL_API_KEY;
    if (!apiKey) throw new Error("AGENTMAIL_API_KEY is not set");
    _client = new AgentMailClient({ apiKey });
  }
  return _client;
}

const INBOX_ID = () => {
  const id = process.env.AGENTMAIL_INBOX_ID;
  if (!id) throw new Error("AGENTMAIL_INBOX_ID is not set");
  return id;
};

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<EmailResult> {
  try {
    const res = await client().inboxes.messages.send(INBOX_ID(), {
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text ?? stripHtml(input.html ?? ""),
    });
    return { success: true, id: (res as { id?: string })?.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "send failed" };
  }
}

/** Reply within an existing thread (two-way conversations). */
export async function replyToThread(messageId: string, text: string, html?: string) {
  return client().inboxes.messages.reply(INBOX_ID(), messageId, { text, html });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
