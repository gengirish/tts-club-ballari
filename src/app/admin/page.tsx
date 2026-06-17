import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminSubnav } from "./admin-subnav";
import { getAisensyOtpCampaignName } from "@/integrations/aisensy/templates";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { formatDateTimeIST } from "@/lib/utils/datetime";
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
  const since7 = new Date(Date.now() - 7 * 86400000);
  const otpCampaignName = getAisensyOtpCampaignName();

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
    otpSendFailures7d,
    otpSendFailureRows,
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
    prisma.notificationLog.count({
      where: {
        channel: "WHATSAPP",
        status: "FAILED",
        template: otpCampaignName,
        createdAt: { gte: since7 },
      },
    }),
    prisma.notificationLog.findMany({
      where: {
        channel: "WHATSAPP",
        status: "FAILED",
        template: otpCampaignName,
        createdAt: { gte: since7 },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, to: true, error: true, createdAt: true },
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
        <p className="text-sm text-ink/60 mt-2 mb-6">Operational snapshot — efficient counts, no N+1 loops.</p>
        <AdminSubnav />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-card border border-paper-deep bg-paper-raised p-4">
              <p className="text-xs font-bold uppercase text-magenta">{card.label}</p>
              <p className="text-3xl font-display text-violet mt-1">{card.value}</p>
              {card.footnote ? <p className="text-xs text-ink/55 mt-2 leading-snug">{card.footnote}</p> : null}
            </div>
          ))}
        </div>

        <section className="mt-10 rounded-card border border-paper-deep bg-paper-raised p-6">
          <h2 className="font-display text-xl uppercase text-violet mb-2">Event paid registrations</h2>
          <p className="text-sm text-ink/60 mb-4">
            Web form, payment proof, approvals, QR passes, and WhatsApp handoff — all in-product (no Google Form /
            Sheet).
          </p>
          <Link
            href="/admin/event-registrations"
            className="inline-flex rounded-full bg-energy px-5 py-2 text-sm font-extrabold text-white"
          >
            Open registration desk
          </Link>
        </section>

        <section className="mt-10 rounded-card border border-paper-deep bg-paper-raised p-6">
          <h2 className="font-display text-xl uppercase text-violet mb-2">WhatsApp OTP (AISensy)</h2>
          <p className="text-xs text-ink/55 mb-4">
            Failed sends for campaign <span className="font-mono">{otpCampaignName}</span> in the last 7 days (login
            path). Spikes usually mean template or API key drift.
          </p>
          <p className="text-2xl font-display text-violet">{String(otpSendFailures7d)}</p>
          <p className="text-xs text-ink/55 mt-1 mb-4">Failed OTP notifications (7d)</p>
          {otpSendFailureRows.length === 0 ? (
            <p className="text-sm text-ink/60">No failures in this window.</p>
          ) : (
            <ul className="divide-y divide-paper-deep text-sm max-h-72 overflow-y-auto">
              {otpSendFailureRows.map((row) => (
                <li key={row.id} className="py-2 flex flex-col gap-0.5">
                  <span className="font-mono text-xs text-ink/80">{row.to}</span>
                  <span className="text-xs text-ink/55">{formatDateTimeIST(row.createdAt)}</span>
                  {row.error ? (
                    <span className="text-xs text-magenta break-all line-clamp-2" title={row.error}>
                      {row.error}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10 rounded-card border border-paper-deep bg-paper-raised p-6">
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
