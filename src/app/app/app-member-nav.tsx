"use client";

import { signOut } from "next-auth/react";

export function AppMemberNav({ userLabel }: { userLabel: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-paper-deep bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <p className="min-w-0 truncate text-xs font-bold text-ink/80">
          <span className="text-ink/50">Signed in as</span>{" "}
          <span className="text-violet">{userLabel}</span>
        </p>
        <button
          type="button"
          data-testid="app-logout"
          onClick={() => void signOut({ callbackUrl: "/login" })}
          className="shrink-0 rounded-full border border-paper-deep bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-ink transition hover:border-magenta hover:text-magenta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
