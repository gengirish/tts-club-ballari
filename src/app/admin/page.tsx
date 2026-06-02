import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { formatStars } from "@/lib/utils/percent";

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/app");

  const since30 = new Date(Date.now() - 30 * 86400000);
  const since14 = new Date(Date.now() - 14 * 86400000);

  const [
    members,
    coaches,
    hosts,
    activeProgressUsers,
    challengeParticipants,
    eventRegs,
    publishedArticles,
    newMembers30d,
    coachEnrollments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "MEMBER" } }),
    prisma.coach.count(),
    prisma.user.count({ where: { role: "HOST" } }),
    prisma.progressEntry.groupBy({
      by: ["userId"],
      where: { date: { gte: since14 } },
    }),
    prisma.challengeParticipant.count(),
    prisma.eventRegistration.count(),
    prisma.wellnessArticle.count({ where: { published: true } }),
    prisma.user.count({ where: { createdAt: { gte: since30 } } }),
    prisma.programEnrollment.count({ where: { status: "ACTIVE" } }),
  ]);

  const coachPerf = await prisma.coach.findMany({
    take: 8,
    orderBy: { ratingBps: "desc" },
    include: { user: { select: { name: true } }, _count: { select: { enrollments: true, reviews: true } } },
  });

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-4xl uppercase text-violet">Admin</h1>
        <p className="text-sm text-ink/60 mt-2 mb-8">Operational snapshot — efficient counts, no N+1 loops.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            ["Members (role)", members],
            ["Coaches listed", coaches],
            ["Hosts (role)", hosts],
            ["Active loggers (14d)", activeProgressUsers.length],
            ["Challenge joins", challengeParticipants],
            ["Event registrations", eventRegs],
            ["Published wellness", publishedArticles],
            ["New accounts (30d)", newMembers30d],
            ["Active program seats", coachEnrollments],
          ].map(([label, val]) => (
            <div key={String(label)} className="rounded-card border border-paper-deep bg-white p-4">
              <p className="text-xs font-bold uppercase text-magenta">{label}</p>
              <p className="text-3xl font-display text-violet mt-1">{String(val)}</p>
            </div>
          ))}
        </div>

        <section className="mt-10 rounded-card border border-paper-deep bg-white p-6">
          <h2 className="font-display text-xl uppercase text-violet mb-4">Coach signal</h2>
          <ul className="space-y-2 text-sm">
            {coachPerf.map((c) => (
              <li key={c.id} className="flex justify-between border-b border-paper-deep pb-2">
                <span className="font-semibold">{c.user.name ?? "Coach"}</span>
                <span className="text-ink/70">
                  {formatStars(c.ratingBps)}★ · {c._count.enrollments} seats · {c._count.reviews} reviews
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
