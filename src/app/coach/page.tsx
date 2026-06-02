import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { formatPaiseShort } from "@/lib/utils/money";
import { formatStars } from "@/lib/utils/percent";

export default async function CoachDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!["COACH", "ADMIN"].includes(user.role)) redirect("/app");

  const coach = await prisma.coach.findUnique({
    where: { userId: user.id },
  });

  if (!coach) {
    return (
      <main className="min-h-screen p-6">
        <p className="text-ink/70">No coach profile is linked to this account yet.</p>
      </main>
    );
  }

  const enrollments = await prisma.programEnrollment.findMany({
    where: { coachId: coach.id },
    take: 40,
    orderBy: { startedAt: "desc" },
    include: { member: { select: { name: true, phone: true } }, program: { select: { title: true, slug: true } } },
  });

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl uppercase text-violet">Coach desk</h1>
        <p className="text-sm text-ink/60 mt-1">
          {coach.type} · {formatStars(coach.ratingBps)}★ ({coach.ratingCount}) · {formatPaiseShort(coach.sessionPaise)}{" "}
          / session
        </p>
        <h2 className="font-display text-lg uppercase text-magenta mt-8 mb-3">Your enrollees</h2>
        <ul className="space-y-3">
          {enrollments.map((e) => (
            <li key={e.id} className="rounded-card border border-paper-deep bg-white p-4">
              <p className="font-bold">{e.member.name ?? "Member"}</p>
              <p className="text-xs text-ink/50">{e.program.title}</p>
              <p className="text-xs text-violet mt-1">
                Week {e.weekNo} · {e.status}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
