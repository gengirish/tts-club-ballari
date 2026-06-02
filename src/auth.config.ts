import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

// Edge-safe config (no Prisma / Node APIs here) — used by middleware.
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [], // declared in auth.ts (Node runtime)
  callbacks: {
    // Put role + id on the token, then expose on the session.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const u = user as { role?: Role };
        token.role = u.role ?? "MEMBER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role | undefined) ?? "MEMBER";
      }
      return session;
    },
  },
};
