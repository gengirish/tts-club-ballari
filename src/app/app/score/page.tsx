import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { isMemberOnboarded } from "@/lib/member/onboarding-status";
import { prisma } from "@/lib/prisma";
import { formatBps } from "@/lib/utils/percent";
import { formatDateTimeIST } from "@/lib/utils/datetime";
import { RecomputeScoreButton } from "./recompute-button";

const LEVEL_ORDER = ["BEGINNER", "ACTIVE", "STRONG", "ATHLETE", "CHAMPION"] as const;

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <svg width="200" height="200" viewBox="0 0 140 140" className="mx-auto drop-shadow-md" aria-hidden>
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6320b3" />
          <stop offset="100%" stopColor="#ec0f8c" />
        </linearGradient>
      </defs>
      <circle cx="70" cy="70" r={r} fill="none" stroke="#ece4f3" strokeWidth="12" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="76" textAnchor="middle" className="fill-ink font-display text-3xl">
        {score}
      </text>
    </svg>
  );
}

export default async function ScorePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!(await isMemberOnboarded(user.id))) redirect("/app/onboarding");

  const latest = await prisma.fitnessScore.findFirst({
    where: { userId: user.id },
    orderBy: { computedAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="font-display text-4xl uppercase text-transparent bg-clip-text bg-energy">
          Fitness score
        </h1>
        <p className="text-sm text-ink/60 mt-2 mb-8">
          Blended from your steps, consistency, BMI band, and movement style — last computed{" "}
          {latest ? formatDateTimeIST(latest.computedAt) : "—"}.
        </p>

        {latest ? (
          <>
            <div className="rounded-card border border-paper-deep bg-white p-8 mb-6 text-center">
              <ScoreRing score={latest.score} />
              <p className="mt-4 text-lg font-bold text-violet capitalize">{latest.level.toLowerCase()}</p>
            </div>

            <div className="rounded-card border border-paper-deep bg-white p-6 mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-magenta mb-4">Your mix</p>
              <ul className="space-y-3">
                {(
                  [
                    ["Steps", latest.stepsBps],
                    ["Consistency", latest.consistencyBps],
                    ["Healthy range (BMI)", latest.bmiBps],
                    ["Activity style", latest.activityBps],
                  ] as const
                ).map(([label, bps]) => (
                  <li key={label}>
                    <div className="flex justify-between text-sm font-semibold text-ink mb-1">
                      <span>{label}</span>
                      <span>{formatBps(bps)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-paper-deep overflow-hidden">
                      <div
                        className="h-full bg-energy rounded-full transition-all"
                        style={{ width: `${Math.min(100, bps / 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-card border border-paper-deep bg-white p-6 mb-8">
              <p className="text-xs font-bold uppercase tracking-wider text-violet mb-4">Beginner → Champion</p>
              <ol className="flex flex-wrap gap-2">
                {LEVEL_ORDER.map((lv) => {
                  const active = latest.level === lv;
                  return (
                    <li
                      key={lv}
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        active ? "bg-magenta text-white" : "bg-paper-deep text-ink/50"
                      }`}
                    >
                      {lv}
                    </li>
                  );
                })}
              </ol>
            </div>
          </>
        ) : (
          <p className="text-ink/70 mb-6">You have not computed a score yet. Add health metrics, then tap below.</p>
        )}

        <RecomputeScoreButton />
      </div>
    </main>
  );
}
