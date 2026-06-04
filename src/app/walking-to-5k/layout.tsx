import type { ReactNode } from "react";
import { auth } from "@/auth";
import { WalkingSessionProvider } from "./walking-session-provider";

export default async function WalkingTo5kLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  return <WalkingSessionProvider session={session}>{children}</WalkingSessionProvider>;
}
