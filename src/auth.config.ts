import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

// Edge-safe config (no Prisma / Node APIs here) — used by middleware.
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login", verifyRequest: "/login/verify-request" },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [], // declared in auth.ts (Node runtime)
  callbacks: {
    // Put role + id on the token, then expose on the session.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const u = user as { role?: Role; email?: string | null };
        token.role = u.role ?? "MEMBER";
        token.email = typeof u.email === "string" ? u.email : undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role | undefined) ?? "MEMBER";
        if (typeof token.email === "string") {
          session.user.email = token.email;
        }
      }
      return session;
    },
  },
};
