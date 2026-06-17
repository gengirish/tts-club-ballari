import Link from "next/link";

const linkClass =
  "rounded-full border border-violet/25 bg-paper-muted/60 px-3 py-1.5 text-sm font-bold text-violet-soft underline-offset-2 transition-colors hover:border-violet/45 hover:bg-paper-muted hover:underline";

export function AdminSubnav() {
  return (
    <nav aria-label="Admin sections" className="mb-8">
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/admin" className={linkClass}>
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/admin/members" className={linkClass}>
            Members
          </Link>
        </li>
        <li>
          <Link href="/admin/coaches" className={linkClass}>
            Coaches
          </Link>
        </li>
        <li>
          <Link href="/admin/event-registrations" className={linkClass}>
            Event registrations
          </Link>
        </li>
      </ul>
    </nav>
  );
}
