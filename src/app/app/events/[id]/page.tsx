import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { isMemberOnboarded } from "@/lib/member/onboarding-status";
import { prisma } from "@/lib/prisma";
import { EventDetailClient, type EventDetailPayload } from "./event-detail-client";

type Props = { params: { id: string } };

export default async function EventDetailPage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!(await isMemberOnboarded(user.id))) redirect("/app/onboarding");

  const now = new Date();
  const row = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      host: { select: { name: true } },
      _count: { select: { registrations: true } },
      registrations: {
        where: { userId: user.id },
        select: { id: true, checkedInAt: true },
      },
    },
  });

  if (!row) notFound();

  const mine = row.registrations[0];
  const isUpcoming = row.startsAt >= now;
  if (!isUpcoming && !mine) notFound();

  const payload: EventDetailPayload = {
    id: row.id,
    title: row.title,
    location: row.location,
    type: row.type,
    startsAt: row.startsAt.toISOString(),
    capacity: row.capacity,
    registrationCount: row._count.registrations,
    hostName: row.host.name,
    lat: row.lat,
    lng: row.lng,
    myRegistration: mine
      ? {
          id: mine.id,
          checkedInAt: mine.checkedInAt ? mine.checkedInAt.toISOString() : null,
        }
      : null,
  };

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <p className="mb-4 text-sm font-bold uppercase tracking-wide text-magenta">
          <Link href="/app/events" className="text-violet-soft hover:underline" data-testid="event-back-to-list">
            ← Back to events
          </Link>
        </p>
        <EventDetailClient event={payload} />
      </div>
    </main>
  );
}
