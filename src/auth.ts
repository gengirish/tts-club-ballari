import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { verifyOtp } from "@/server/auth/otp";
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
        const phone = toE164(String(creds?.phone ?? ""));
        const code = String(creds?.code ?? "");
        if (!phone || !code) return null;

        const valid = await verifyOtp(phone, code);
        if (!valid) return null;

        // Upsert member on first successful login.
        const user = await prisma.user.upsert({
          where: { phone },
          update: {},
          create: { phone, role: "MEMBER", city: "Ballari" },
        });

        return { id: user.id, name: user.name ?? undefined, role: user.role } as any;
      },
    }),
  ],
});
