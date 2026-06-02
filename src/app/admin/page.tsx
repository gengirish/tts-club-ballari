import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { formatStars } from "@/lib/utils/percent";

type StatCard = { label: string; value: string; footnote?: string };

function formatCommunityKm(walkKm: number, runKm: number): string {
  const total = walkKm + runKm;
  return `${total.toLocaleString("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })} km`;
}

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
    eventsWithRegistration,
    publishedArticles,
    newMembers30d,
    coachEnrollments,
    progressDistanceSums,
    communityPosts,
    communityLikes,
    communityComments,
    weightCheckIns30d,
    coachPerf,
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
    prisma.event.count({ where: { registrations: { some: {} } } }),
    prisma.wellnessArticle.count({ where: { published: true } }),
    prisma.user.count({ where: { createdAt: { gte: since30 } } }),
    prisma.programEnrollment.count({ where: { status: "ACTIVE" } }),
    prisma.progressEntry.aggregate({
      _sum: { walkKm: true, runKm: true },
    }),
    prisma.communityPost.count(),
    prisma.communityLike.count(),
    prisma.communityComment.count(),
    prisma.progressEntry.count({
      where: {
        date: { gte: since30 },
        weightKg: { not: null },
      },
    }),
    prisma.coach.findMany({
      take: 8,
      orderBy: { ratingBps: "desc" },
      include: { user: { select: { name: true } }, _count: { select: { enrollments: true, reviews: true } } },
    }),
  ]);

  const walkSum = progressDistanceSums._sum.walkKm ?? 0;
  const runSum = progressDistanceSums._sum.runKm ?? 0;

  const statCards: StatCard[] = [
    { label: "Members (role)", value: String(members) },
    { label: "Coaches listed", value: String(coaches) },
    { label: "Hosts (role)", value: String(hosts) },
    { label: "Active loggers (14d)", value: String(activeProgressUsers.length) },
    { label: "Challenge joins", value: String(challengeParticipants) },
    { label: "Event registrations", value: String(eventRegs) },
    {
      label: "Events with sign-ups",
      value: String(eventsWithRegistration),
      footnote: "Distinct events that have at least one registration.",
    },
    { label: "Published wellness", value: String(publishedArticles) },
    { label: "New accounts (30d)", value: String(newMembers30d) },
    { label: "Active program seats", value: String(coachEnrollments) },
    {
      label: "Total distance logged (walk + run)",
      value: formatCommunityKm(walkSum, runSum),
      footnote: "Sum of all progress entries (community). Nulls treated as zero.",
    },
    { label: "Community posts", value: String(communityPosts) },
    {
      label: "Community likes & comments",
      value: String(communityLikes + communityComments),
      footnote: `Plus ${String(communityPosts)} posts = ${String(communityPosts + communityLikes + communityComments)} total touches.`,
    },
    {
      label: "Weight check-ins (30d)",
      value: String(weightCheckIns30d),
      footnote:
        "Count of progress rows with a weight value in the last 30 days (not a clinical outcome — celebrates consistent tracking).",
    },
  ];

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-4xl uppercase text-violet">Admin</h1>
        <p className="text-sm text-ink/60 mt-2 mb-8">Operational snapshot — efficient counts, no N+1 loops.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-card border border-paper-deep bg-white p-4">
              <p className="text-xs font-bold uppercase text-magenta">{card.label}</p>
              <p className="text-3xl font-display text-violet mt-1">{card.value}</p>
              {card.footnote ? <p className="text-xs text-ink/55 mt-2 leading-snug">{card.footnote}</p> : null}
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
