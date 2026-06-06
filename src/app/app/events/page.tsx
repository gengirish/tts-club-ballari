import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/rbac";
import { isMemberOnboarded } from "@/lib/member/onboarding-status";
import { prisma } from "@/lib/prisma";
import { AppBackToHome } from "../app-back-to-home";
import { EventsClient, type EventsListItem } from "./events-client";
import { formatDateTimeIST } from "@/lib/utils/datetime";

export default async function EventsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!(await isMemberOnboarded(user.id))) redirect("/app/onboarding");

  const now = new Date();

  const [upcomingRows, pastRegs] = await Promise.all([
    prisma.event.findMany({
      where: { startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
      take: 50,
      include: {
        host: { select: { name: true } },
        _count: { select: { registrations: true } },
        registrations: {
          where: { userId: user.id },
          select: { id: true, checkedInAt: true },
        },
      },
    }),
    prisma.eventRegistration.findMany({
      where: { userId: user.id, event: { startsAt: { lt: now } } },
      orderBy: { event: { startsAt: "desc" } },
      take: 15,
      include: {
        event: {
          include: {
            host: { select: { name: true } },
            _count: { select: { registrations: true } },
          },
        },
      },
    }),
  ]);

  const upcoming: EventsListItem[] = upcomingRows.map((e) => {
    const mine = e.registrations[0];
    return {
      id: e.id,
      title: e.title,
      location: e.location,
      type: e.type,
      startsAt: e.startsAt.toISOString(),
      capacity: e.capacity,
      registrationCount: e._count.registrations,
      hostName: e.host.name,
      myRegistration: mine
        ? {
            id: mine.id,
            checkedInAt: mine.checkedInAt ? mine.checkedInAt.toISOString() : null,
          }
        : null,
    };
  });

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <AppBackToHome />
        <h1 className="font-display text-4xl uppercase text-transparent bg-clip-text bg-energy" data-testid="events-page-title">
          Events
        </h1>
        <p className="text-sm text-ink/60 mt-2 mb-8">
          Register for club sessions and see events you have joined. Hosts still manage schedules from the host
          dashboard; this is your member view.
        </p>

        <EventsClient events={upcoming} />

        {pastRegs.length > 0 && (
          <section className="mt-12" aria-labelledby="past-events-heading">
            <h2 id="past-events-heading" className="font-display text-lg uppercase text-magenta mb-4">
              Your past events
            </h2>
            <ul className="space-y-3">
              {pastRegs.map((r) => (
                <li
                  key={r.id}
                  className="rounded-lg border border-paper-deep bg-paper-muted/50 px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div>
                    <p className="font-bold text-ink">{r.event.title}</p>
                    <p className="text-ink/60">{formatDateTimeIST(r.event.startsAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {r.checkedInAt ? (
                      <span className="text-xs font-bold uppercase text-progress">Checked in</span>
                    ) : (
                      <span className="text-xs font-bold uppercase text-ink/50">No check-in</span>
                    )}
                    <Link href={`/app/events/${r.event.id}`} className="text-xs font-bold uppercase text-violet-soft hover:underline">
                      Open
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
