import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Nodemailer from "next-auth/providers/nodemailer";
import type { User } from "next-auth";
import { z } from "zod";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { isPrismaInitializationError } from "@/lib/prisma-errors";
import { authConfig } from "@/auth.config";
import { verifyOtp } from "@/server/auth/otp";
import { isOtpVerifyBlocked, recordOtpVerifyFailure } from "@/server/auth/otp-rate-limit";
import { verifyPassword } from "@/server/auth/password";
import { verifyOtpSchema } from "@/lib/validation/auth";
import { toE164 } from "@/lib/utils/phone";
import { sendEmail } from "@/integrations/agentmail/client";

const authUrlForGuard = process.env.AUTH_URL?.trim() ?? "";
if (
  process.env.NODE_ENV === "production" &&
  process.env.VERCEL &&
  authUrlForGuard &&
  /localhost|127\.0\.0\.1/i.test(authUrlForGuard)
) {
  console.warn(
    "[auth] AUTH_URL points at localhost/127.0.0.1 on a Vercel deployment. Auth.js may set authjs.callback-url and redirects incorrectly. Set AUTH_URL to your public https origin (see docs/TROUBLESHOOTING_AUTH_HOST.md).",
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfig.callbacks,
    async jwt(params) {
      const { user } = params;
      let nextUser = user;
      if (user?.id && (user as { role?: unknown }).role === undefined) {
        try {
          const row = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
          });
          if (row) nextUser = { ...user, role: row.role };
        } catch (e) {
          console.error("[auth] jwt role lookup", e);
        }
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
        if (!process.env.AGENTMAIL_API_KEY?.trim()) {
          throw new Error("Configuration");
        }

        const existing = await prisma.user.findFirst({
          where: { email: { equals: identifier, mode: "insensitive" } },
          select: { id: true },
        });
        if (!existing) {
          throw new Error("EmailSignin");
        }

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
        try {
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
        } catch (e) {
          console.error("[auth] phone-otp authorize", e);
          return null;
        }
      },
    }),
    Credentials({
      id: "email-password",
      name: "Email or username",
      credentials: { identifier: {}, password: {} },
      async authorize(creds) {
        try {
          const identifier = String(creds?.identifier ?? "").trim();
          const password = String(creds?.password ?? "");
          if (!identifier || !password) return null;

          const asEmail = z.string().email().safeParse(identifier);
          let user = await prisma.user.findFirst({
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
          // Allow sign-in with exact display name (case-insensitive) when it uniquely matches —
          // members often try their name instead of their username.
          if (!user && !asEmail.success) {
            const byName = await prisma.user.findMany({
              where: { name: { equals: identifier, mode: "insensitive" } },
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                passwordHash: true,
              },
              take: 2,
            });
            if (byName.length === 1) user = byName[0]!;
          }
          if (!user?.passwordHash) return null;
          const valid = await verifyPassword(password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            name: user.name ?? undefined,
            email: user.email ?? undefined,
            role: user.role,
          } as User;
        } catch (e) {
          if (isPrismaInitializationError(e)) {
            console.error("[auth] email-password database unavailable", e);
          } else {
            console.error("[auth] email-password authorize", e);
          }
          return null;
        }
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
