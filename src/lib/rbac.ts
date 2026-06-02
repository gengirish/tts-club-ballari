import { auth } from "@/auth";
import type { Role } from "@prisma/client";

export type SessionUser = { id: string; role: Role; name?: string | null };

// Role hierarchy weight. ADMIN sees everything.
const RANK: Record<Role, number> = { MEMBER: 0, COACH: 1, HOST: 1, ADMIN: 9 };

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    role: (session.user as { role?: Role }).role ?? "MEMBER",
    name: session.user.name,
  };
}

export class AuthError extends Error {
  constructor(public kind: "UNAUTHORIZED" | "FORBIDDEN", message: string) {
    super(message);
  }
}

/** Throws AuthError if not signed in. */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError("UNAUTHORIZED", "Authentication required");
  return user;
}

/** Throws AuthError if the user lacks the minimum role (ADMIN always passes). */
export async function requireRole(min: Role): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role === "ADMIN") return user;
  if (RANK[user.role] < RANK[min]) {
    throw new AuthError("FORBIDDEN", `Requires ${min} role`);
  }
  return user;
}

export const isAdmin = (u: SessionUser) => u.role === "ADMIN";
export const isCoach = (u: SessionUser) => u.role === "COACH" || u.role === "ADMIN";
export const isHost = (u: SessionUser) => u.role === "HOST" || u.role === "ADMIN";
