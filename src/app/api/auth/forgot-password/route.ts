import { ok, validationError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { forgotPasswordRequestSchema } from "@/lib/validation/auth";
import { getPublicAppOrigin } from "@/lib/public-app-url";
import { sendEmail } from "@/integrations/agentmail/client";
import { issuePasswordResetToken, passwordResetTtlMinutes } from "@/server/auth/password-reset";

export const runtime = "nodejs";

const GENERIC_RESPONSE =
  "If an account with that email exists, we sent a password reset link. Please check your inbox.";

function resetPasswordHtmlBody(url: string, ttlMinutes: number) {
  return `
<body style="background:#f5f6fb;margin:0;padding:24px 0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:620px;margin:auto;background:#ffffff;border-radius:12px;border:1px solid #ece8f5;">
    <tr>
      <td style="padding:28px 28px 12px;font-family:Inter,Helvetica,Arial,sans-serif;color:#1f2937;">
        <h1 style="margin:0;font-size:22px;line-height:1.3;">Reset your SSS Club password</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:0 28px 10px;font-family:Inter,Helvetica,Arial,sans-serif;color:#4b5563;font-size:15px;line-height:1.6;">
        We received a request to reset your password. Use the button below to create a new one.
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:16px 28px 10px;">
        <a href="${url}" target="_blank" style="display:inline-block;background:#6d28d9;color:#ffffff;text-decoration:none;font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;padding:12px 22px;border-radius:999px;">
          Reset password
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 28px 24px;font-family:Inter,Helvetica,Arial,sans-serif;color:#6b7280;font-size:13px;line-height:1.6;">
        This link expires in ${ttlMinutes} minutes. If you did not request this, you can ignore this email safely.
      </td>
    </tr>
  </table>
</body>
`;
}

function resetPasswordTextBody(url: string, ttlMinutes: number) {
  return `Reset your SSS Club password:\n${url}\n\nThis link expires in ${ttlMinutes} minutes. If you did not request this, you can ignore this email.`;
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = forgotPasswordRequestSchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const email = parsed.data.email;
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, email: true, passwordHash: true },
  });

  if (!user?.email || !user.passwordHash) {
    return ok({ message: GENERIC_RESPONSE });
  }

  try {
    const ttlMinutes = passwordResetTtlMinutes();
    const { token } = await issuePasswordResetToken(user.id);
    const resetUrl = `${getPublicAppOrigin()}/login/reset-password?token=${encodeURIComponent(token)}`;
    const mail = await sendEmail({
      to: user.email,
      subject: "Reset your SSS Club password",
      html: resetPasswordHtmlBody(resetUrl, ttlMinutes),
      text: resetPasswordTextBody(resetUrl, ttlMinutes),
    });

    if (!mail.success) {
      console.error("[forgot-password] sendEmail failed", mail.error);
    }
  } catch (e) {
    console.error("[forgot-password] issue/send failed", e);
  }

  return ok({ message: GENERIC_RESPONSE });
}
