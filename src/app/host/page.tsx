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
    include: { _count: { select: { registrations: true } } },
  });

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="font-display text-3xl uppercase text-violet">Host hub</h1>
        <p className="text-sm text-ink/60 mt-1 mb-6">Create walks, runs, and meetups for Ballari sisters.</p>
        <HostEventForm />
        <ul className="space-y-3">
          {events.map((ev) => (
            <li key={ev.id} className="rounded-card border border-paper-deep bg-white p-4">
              <p className="font-bold text-ink">{ev.title}</p>
              <p className="text-xs text-ink/50 mt-1">{formatDateTimeIST(ev.startsAt)}</p>
              <p className="text-xs text-violet mt-1">{ev._count.registrations} registered</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
