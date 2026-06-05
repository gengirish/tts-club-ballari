"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const MEMBER_APP_PREFIX = "/app";

function isMemberAppRoute(pathname: string) {
  return pathname === MEMBER_APP_PREFIX || pathname.startsWith(`${MEMBER_APP_PREFIX}/`);
}

export function PublicThemeToggle() {
  const pathname = usePathname();

  if (isMemberAppRoute(pathname)) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-40 sm:bottom-6 sm:right-6">
      <div className="pointer-events-auto">
        <ThemeToggle />
      </div>
    </div>
  );
}
