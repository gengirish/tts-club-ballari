import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { formatDateTimeIST } from "@/lib/utils/datetime";
import { HostEventForm } from "./host-event-form";

export default async function HostDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!["HOST", "ADMIN"].includes(user.role)) redirect("/app");

  const events = await prisma.event.findMany({
    where: { hostId: user.id },
    orderBy: { startsAt: "desc" },
    take: 30,
    include: {
      _count: { select: { registrations: true, applications: true } },
    },
  });

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="font-display text-3xl uppercase text-violet">Host hub</h1>
        <p className="text-sm text-ink/60 mt-1 mb-6">Create walks, runs, and meetups for Ballari sisters.</p>
        <HostEventForm />
        <p className="text-sm text-ink/60 mb-4">
          After publishing, open{" "}
          <span className="font-semibold text-violet">Registration settings</span> on an event to enable the public web
          form and payment instructions.
        </p>
        <p className="text-sm mb-6">
          <a href="/host/event-registrations" className="text-violet font-bold underline">
            Review registrations &amp; approve payments →
          </a>
        </p>
        <ul className="space-y-3">
          {events.map((ev) => (
            <li key={ev.id} className="rounded-card border border-paper-deep bg-paper-raised p-4">
              <p className="font-bold text-ink">{ev.title}</p>
              <p className="text-xs text-ink/50 mt-1">{formatDateTimeIST(ev.startsAt)}</p>
              <p className="text-xs text-violet mt-1">
                {ev._count.registrations} member sign-ups · {ev._count.applications} paid applications
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <a
                  href={`/host/events/${ev.id}/settings`}
                  className="rounded-full border border-violet px-3 py-1 font-bold text-violet"
                >
                  Registration settings
                </a>
                <a
                  href={`/register/${ev.id}`}
                  className="rounded-full border border-paper-deep px-3 py-1 font-bold text-ink/80"
                  target="_blank"
                  rel="noreferrer"
                >
                  Public form (preview)
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
