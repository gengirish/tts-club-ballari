"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";

export function AppMemberNav({ userLabel }: { userLabel: string }) {
  async function logOut() {
    const loginUrl = `${window.location.origin}/login`;
    try {
      // `redirect: false` avoids following Auth.js `data.url`, which can be built from
      // misconfigured `AUTH_URL` (e.g. localhost) and would send production users to the wrong host.
      await signOut({ redirect: false, callbackUrl: loginUrl });
    } catch {
      // Still leave the member area so the user is not stuck if the sign-out POST fails.
    }
    // Hard navigation on the **current browser origin** — never trust server-built absolute URLs here.
    window.location.assign(loginUrl);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-steel/15 bg-paper-raised/95 shadow-chrome backdrop-blur-md supports-[backdrop-filter]:bg-paper-raised/80">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link href="/app" className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-steel/20">
            <Image src="/brand/logo-full.jpg" alt="" fill className="object-cover object-top" sizes="36px" />
          </Link>
          <p className="min-w-0 truncate text-xs font-bold text-steel">
            <span className="text-steel-dim">Signed in as</span>{" "}
            <span className="text-violet-soft">{userLabel}</span>
          </p>
        </div>
        <button
          type="button"
          data-testid="app-logout"
          onClick={() => void logOut()}
          className="shrink-0 rounded-full border border-steel/25 bg-paper-muted px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-ink transition hover:border-magenta/50 hover:text-magenta-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
