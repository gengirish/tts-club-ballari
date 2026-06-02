import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { isMemberOnboarded } from "@/lib/member/onboarding-status";
import { prisma } from "@/lib/prisma";
import { formatPaiseShort } from "@/lib/utils/money";
import { formatStars } from "@/lib/utils/percent";
import { CoachesBookButtons } from "./coaches-book-buttons";

export default async function CoachesMarketplacePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!(await isMemberOnboarded(user.id))) redirect("/app/onboarding");

  const coaches = await prisma.coach.findMany({
    where: { available: true },
    orderBy: { ratingBps: "desc" },
    take: 40,
    include: { user: { select: { name: true, city: true } } },
  });

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="font-display text-4xl uppercase text-transparent bg-clip-text bg-energy">Coaches</h1>
        <p className="text-sm text-ink/60">Running, yoga, strength, and more — book through the crew inbox.</p>
        <ul className="space-y-4">
          {coaches.map((c) => (
            <li key={c.id} className="rounded-card border border-paper-deep bg-white p-5 flex flex-col md:flex-row md:justify-between gap-4">
              <div>
                <p className="font-display text-xl uppercase text-violet">{c.user.name ?? "Coach"}</p>
                <p className="text-xs text-ink/50 mt-1">
                  {c.type} · {c.user.city ?? "Ballari"}
                </p>
                <p className="text-sm text-ink/70 mt-2 line-clamp-3">{c.bio ?? c.specialty ?? ""}</p>
                <p className="text-sm font-bold text-magenta mt-2">
                  {formatStars(c.ratingBps)}★ · {formatPaiseShort(c.sessionPaise)}
                </p>
              </div>
              <CoachesBookButtons coachId={c.id} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
