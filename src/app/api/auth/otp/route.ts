import { ok, validationError, fail } from "@/lib/api-response";
import { getClientIp } from "@/lib/request-ip";
import { requestOtpSchema } from "@/lib/validation/auth";
import { toE164 } from "@/lib/utils/phone";
import { issueOtp } from "@/server/auth/otp";
import { consumeOtpIssueSlots } from "@/server/auth/otp-rate-limit";

// POST /api/auth/otp  -> sends a 6-digit OTP over WhatsApp
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = requestOtpSchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const phone = toE164(parsed.data.phone);
  if (!phone) return fail("INVALID_PHONE", "Enter a valid Indian mobile number", 422);

  const ip = getClientIp(req);
  const slot = await consumeOtpIssueSlots(ip, phone);
  if (!slot.allowed) {
    const hint =
      slot.reason === "PHONE"
        ? "Too many codes sent to this number. Try again later."
        : "Too many requests from this network. Try again later.";
    return fail("RATE_LIMITED", hint, 429);
  }

  const { sent } = await issueOtp(phone);
  if (!sent) return fail("OTP_SEND_FAILED", "Could not send OTP, try again", 502);

  return ok({ phone, ttlSeconds: 300 });
}
