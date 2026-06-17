"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppMemberNav({ userLabel, isAdmin }: { userLabel: string; isAdmin?: boolean }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/app", label: "Home", exact: true },
    { href: "/app/progress", label: "Progress" },
    { href: "/app/challenges", label: "Challenges" },
    { href: "/app/events", label: "Events" },
    { href: "/app/community", label: "Community" },
    { href: "/app/programs/couch-to-5k", label: "C25K" },
  ] as const;

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

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
    <>
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
            <Link
              href="/app/help"
              data-testid="app-help-link"
              aria-current={pathname === "/app/help" || pathname.startsWith("/app/help/") ? "page" : undefined}
              className={`hidden shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:inline-flex ${
                pathname === "/app/help" || pathname.startsWith("/app/help/")
                  ? "border-violet/40 bg-paper-muted text-violet-soft ring-1 ring-violet/35"
                  : "border-steel/25 bg-paper-muted text-steel hover:border-magenta/40 hover:text-ink"
              }`}
            >
              Self-help
            </Link>
            {isAdmin ? (
              <>
                <Link
                  href="/admin"
                  data-testid="app-admin-dashboard-link"
                  className="hidden shrink-0 rounded-full border border-magenta/30 bg-paper-muted px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-magenta transition hover:border-magenta/50 hover:text-magenta sm:inline-flex"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/members"
                  data-testid="app-admin-members-link"
                  className="hidden max-w-[7rem] shrink-0 truncate rounded-full border border-magenta/30 bg-paper-muted px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-magenta transition hover:border-magenta/50 hover:text-magenta sm:inline-flex"
                >
                  Members
                </Link>
              </>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/app/help"
              data-testid="app-help-link-mobile"
              aria-current={pathname === "/app/help" || pathname.startsWith("/app/help/") ? "page" : undefined}
              className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border text-[10px] font-extrabold uppercase leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:hidden ${
                pathname === "/app/help" || pathname.startsWith("/app/help/")
                  ? "border-violet/40 bg-paper-muted text-violet-soft ring-1 ring-violet/35"
                  : "border-steel/25 bg-paper-muted text-steel hover:border-magenta/40 hover:text-ink"
              }`}
            >
              Help
            </Link>
            {isAdmin ? (
              <div className="flex shrink-0 gap-1 sm:hidden">
                <Link
                  href="/admin"
                  data-testid="app-admin-dashboard-link-mobile"
                  title="Admin dashboard"
                  className="inline-flex min-h-[44px] min-w-[3.25rem] items-center justify-center rounded-full border border-magenta/35 bg-paper-muted px-2 text-[10px] font-extrabold uppercase leading-none text-magenta transition hover:border-magenta/55"
                >
                  Admin
                </Link>
                <Link
                  href="/admin/members"
                  data-testid="app-admin-members-link-mobile"
                  className="inline-flex min-h-[44px] min-w-[3.25rem] items-center justify-center rounded-full border border-magenta/35 bg-paper-muted px-2 text-[10px] font-extrabold uppercase leading-none text-magenta transition hover:border-magenta/55"
                >
                  Members
                </Link>
              </div>
            ) : null}
            <ThemeToggle />
            <button
              type="button"
              data-testid="app-logout"
              onClick={() => void logOut()}
              className="rounded-full border border-steel/25 bg-paper-muted px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-ink transition hover:border-magenta/50 hover:text-magenta-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <nav
        aria-label="Member primary"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-steel/15 bg-paper-raised/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.2)] backdrop-blur-md supports-[backdrop-filter]:bg-paper-raised/80 md:hidden"
      >
        <div className="mx-auto grid max-w-4xl grid-cols-6 gap-0.5">
          {tabs.map((tab) => {
            const active = isActive(tab.href, ("exact" in tab && tab.exact) || false);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-xl px-1.5 py-2 text-center text-[10px] font-extrabold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:px-2 sm:text-[11px] ${
                  active
                    ? "bg-paper-muted text-violet-soft ring-1 ring-violet/35"
                    : "text-steel hover:bg-paper-muted/80 hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
