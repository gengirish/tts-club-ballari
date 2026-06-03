import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Nodemailer from "next-auth/providers/nodemailer";
import type { User } from "next-auth";
import { z } from "zod";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { verifyOtp } from "@/server/auth/otp";
import { isOtpVerifyBlocked, recordOtpVerifyFailure } from "@/server/auth/otp-rate-limit";
import { verifyPassword } from "@/server/auth/password";
import { verifyOtpSchema } from "@/lib/validation/auth";
import { toE164 } from "@/lib/utils/phone";
import { sendEmail } from "@/integrations/agentmail/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfig.callbacks,
    async jwt(params) {
      const { user } = params;
      let nextUser = user;
      if (user?.id && (user as { role?: unknown }).role === undefined) {
        const row = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        if (row) nextUser = { ...user, role: row.role };
      }
      return (await authConfig.callbacks?.jwt?.({ ...params, user: nextUser })) ?? params.token;
    },
  },
  providers: [
    Nodemailer({
      id: "magic-link",
      server: { host: "localhost", port: 587, auth: { user: "", pass: "" } },
      from: process.env.AUTH_EMAIL_FROM ?? "SSS Club <alerts@intelliforge.tech>",
      async sendVerificationRequest({ identifier, url, theme }) {
        const existing = await prisma.user.findFirst({
          where: { email: { equals: identifier, mode: "insensitive" } },
          select: { id: true },
        });
        if (!existing) return;

        const host = new URL(url).host;
        const bodyHtml = magicLinkHtmlBody(url, host, theme);
        const bodyText = magicLinkTextBody(url, host);
        const result = await sendEmail({
          to: identifier,
          subject: "Sign in to SSS Club",
          html: bodyHtml,
          text: bodyText,
        });
        if (!result.success) {
          throw new Error(result.error ?? "Could not send sign-in email");
        }
      },
    }),
    Credentials({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: { phone: {}, code: {} },
      async authorize(creds) {
        const parsed = verifyOtpSchema.safeParse({
          phone: String(creds?.phone ?? ""),
          code: String(creds?.code ?? ""),
        });
        if (!parsed.success) return null;

        const phone = toE164(parsed.data.phone);
        const code = parsed.data.code;
        if (!phone) return null;

        if (await isOtpVerifyBlocked(phone)) return null;

        const valid = await verifyOtp(phone, code);
        if (!valid) {
          await recordOtpVerifyFailure(phone);
          return null;
        }

        // Upsert member on first successful login.
        const user = await prisma.user.upsert({
          where: { phone },
          update: {},
          create: { phone, role: "MEMBER", city: "Ballari" },
        });

        return {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email ?? undefined,
          role: user.role,
        } as User;
      },
    }),
    Credentials({
      id: "email-password",
      name: "Email or username",
      credentials: { identifier: {}, password: {} },
      async authorize(creds) {
        const identifier = String(creds?.identifier ?? "").trim();
        const password = String(creds?.password ?? "");
        if (!identifier || !password) return null;

        const asEmail = z.string().email().safeParse(identifier);
        const user = await prisma.user.findFirst({
          where: asEmail.success
            ? { email: identifier.toLowerCase() }
            : { username: identifier.toLowerCase() },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            passwordHash: true,
          },
        });
        if (!user?.passwordHash) return null;
        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email ?? undefined,
          role: user.role,
        } as User;
      },
    }),
  ],
});

/** Same structure as Auth.js default magic-link template (@auth/core/lib/utils/email). */
function magicLinkHtmlBody(
  url: string,
  host: string,
  theme: { brandColor?: string; buttonText?: string }
) {
  const brandColor = theme.brandColor || "#346df1";
  const buttonText = theme.buttonText || "#fff";
  const escapedHost = host.replace(/\./g, "&#8203;.");
  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText,
  };
  return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Sign in to <strong>${escapedHost}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}

function magicLinkTextBody(url: string, host: string) {
  return `Sign in to ${host}\n${url}\n\n`;
}
