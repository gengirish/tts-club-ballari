"use client";

import type { Session } from "next-auth";
import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

/**
 * Walking to 5K subtree needs session on the register wizard. Pass `session` from the
 * server layout so the first paint is not stuck on `useSession()` loading (bad UX / SEO).
 */
export function WalkingSessionProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
