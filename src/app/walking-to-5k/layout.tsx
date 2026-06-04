"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

export default function WalkingTo5kLayout({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
