import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
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
