import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "You are offline — Sister Stride",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 py-16 text-center">
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-magenta">Offline</p>
      <h1 className="font-display mt-3 max-w-md text-3xl uppercase leading-tight text-ink">
        No network right now
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/65">
        Check your connection and try again. Anything you already opened may still be available from cache.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full bg-energy px-8 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg shadow-magenta/20"
      >
        Go home
      </Link>
    </main>
  );
}
