import Link from "next/link";

export function AppBackToHome() {
  return (
    <p className="mb-4 text-sm font-bold uppercase tracking-wide text-magenta">
      <Link href="/app" className="text-violet-soft hover:underline" data-testid="app-back-to-home">
        ← Back to home
      </Link>
    </p>
  );
}
