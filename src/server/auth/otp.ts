import { createHash, randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/integrations/aisensy/client";
import { AisensyTemplates } from "@/integrations/aisensy/templates";

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

const hash = (code: string) => createHash("sha256").update(code).digest("hex");

/** Generate + persist an OTP and deliver it over WhatsApp (AISensy auth template). */
export async function issueOtp(phone: string): Promise<{ sent: boolean }> {
  const code = String(randomInt(100000, 999999));
  await prisma.otpCode.create({
    data: { phone, codeHash: hash(code), expiresAt: new Date(Date.now() + OTP_TTL_MS) },
  });

  const tpl = AisensyTemplates.otpLogin(code);
  const res = await sendWhatsApp({
    campaignName: tpl.campaignName,
    destination: phone,
    userName: "SSS Member",
    templateParams: tpl.templateParams,
    tags: ["otp"],
  });

  await prisma.notificationLog.create({
    data: {
      channel: "WHATSAPP",
      to: phone,
      template: tpl.campaignName,
      status: res.success ? "SENT" : "FAILED",
      error: res.success ? null : JSON.stringify(res.body),
    },
  });

  return { sent: res.success };
}

/** Verify the latest unconsumed OTP for a phone. Consumes on success. */
export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const otp = await prisma.otpCode.findFirst({
    where: { phone, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return false;
  if (otp.attempts >= MAX_ATTEMPTS) return false;

  const match = otp.codeHash === hash(code);
  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { attempts: { increment: 1 }, consumed: match ? true : otp.consumed },
  });
  return match;
}
