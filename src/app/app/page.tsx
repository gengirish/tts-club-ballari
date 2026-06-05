import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { isMemberOnboarded } from "@/lib/member/onboarding-status";
import { prisma } from "@/lib/prisma";
import { istDayBucket, formatDateTimeIST } from "@/lib/utils/datetime";
import { formatBps } from "@/lib/utils/percent";

function StepsRing({ steps }: { steps: number }) {
  const target = 10000;
  const pct = Math.min(1, steps / target);
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = pct * c;
  return (
    <svg width="160" height="160" viewBox="0 0 140 140" aria-label={`Steps ${steps}`}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="#2a2438" strokeWidth="12" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="#13864f"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="74" textAnchor="middle" className="fill-ink font-display text-2xl">
        {steps.toLocaleString("en-IN")}
      </text>
    </svg>
  );
}

export default async function AppHome() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!(await isMemberOnboarded(user.id))) redirect("/app/onboarding");

  const day = istDayBucket();

  const [progressToday, latestScore, health, challengePart, nextReg] = await Promise.all([
    prisma.progressEntry.findUnique({ where: { userId_date: { userId: user.id, date: day } } }),
    prisma.fitnessScore.findFirst({ where: { userId: user.id }, orderBy: { computedAt: "desc" } }),
    prisma.healthProfile.findUnique({ where: { userId: user.id } }),
    prisma.challengeParticipant.findFirst({
      where: { userId: user.id, challenge: { endDate: { gte: new Date() } } },
      include: { challenge: true },
    }),
    prisma.eventRegistration.findFirst({
      where: { userId: user.id, event: { startsAt: { gte: new Date() } } },
      orderBy: { event: { startsAt: "asc" } },
      include: { event: true },
    }),
  ]);

  const steps = progressToday?.steps ?? 0;
  const weight = health?.weightKg ?? progressToday?.weightKg ?? null;

  return (
    <main className="min-h-screen bg-paper px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl uppercase text-transparent bg-clip-text bg-energy">
              Namaste, {user.name ?? "strider"}
            </h1>
            <p className="text-sm text-ink/60 mt-1">Ballari · today in IST</p>
            <Link
              href="/app/profile"
              className="inline-block mt-2 text-xs font-bold uppercase tracking-wide text-violet-soft hover:underline"
              data-testid="app-edit-profile"
            >
              Edit profile
            </Link>
          </div>
          <nav className="flex flex-wrap gap-2 text-xs font-bold">
            {[
              ["/app/score", "Score"],
              ["/app/progress", "Progress"],
              ["/app/challenges", "Challenges"],
              ["/app/programs/couch-to-5k", "C25K"],
              ["/app/coaches", "Coaches"],
              ["/app/community", "Community"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-full bg-paper-raised border border-paper-deep px-3 py-1.5 text-violet hover:border-magenta"
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>

        <section className="grid md:grid-cols-3 gap-4">
          <div className="rounded-card border border-paper-deep bg-paper-raised p-6 text-center md:col-span-1">
            <p className="text-xs font-bold uppercase text-magenta mb-2">Steps today</p>
            <StepsRing steps={steps} />
            <p className="text-xs text-ink/50 mt-2">Goal 10,000 · {formatBps(Math.round((steps / 10000) * 10000))} of goal</p>
          </div>
          <div className="rounded-card border border-paper-deep bg-paper-raised p-6">
            <p className="text-xs font-bold uppercase text-violet">Fitness score</p>
            {latestScore ? (
              <>
                <p className="font-display text-5xl text-violet mt-2">{latestScore.score}</p>
                <p className="text-sm capitalize text-ink/70">{latestScore.level.toLowerCase()}</p>
              </>
            ) : (
              <p className="text-sm text-ink/60 mt-4">Compute your score on the Score tab.</p>
            )}
          </div>
          <div className="rounded-card border border-paper-deep bg-paper-raised p-6">
            <p className="text-xs font-bold uppercase text-violet">Weight snapshot</p>
            <p className="font-display text-4xl text-magenta mt-2">{weight != null ? `${weight} kg` : "—"}</p>
            <p className="text-xs text-progress mt-2 font-semibold">Every healthy shift counts.</p>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="rounded-card border border-paper-deep bg-paper-raised p-6">
            <p className="text-xs font-bold uppercase text-magenta">Active challenge</p>
            {challengePart ? (
              <>
                <p className="font-bold text-ink mt-2">{challengePart.challenge.title}</p>
                <p className="text-sm text-ink/60 mt-1">
                  {challengePart.progress.toLocaleString("en-IN")} /{" "}
                  {challengePart.challenge.targetValue.toLocaleString("en-IN")} {challengePart.challenge.unit}
                </p>
              </>
            ) : (
              <p className="text-sm text-ink/60 mt-2">Join a challenge to see progress here.</p>
            )}
          </div>
          <div className="rounded-card border border-paper-deep bg-paper-raised p-6">
            <p className="text-xs font-bold uppercase text-magenta">Next event</p>
            {nextReg ? (
              <>
                <p className="font-bold text-ink mt-2">{nextReg.event.title}</p>
                <p className="text-sm text-ink/60 mt-1">{formatDateTimeIST(nextReg.event.startsAt)}</p>
                <p className="text-xs text-ink/50 mt-1">{nextReg.event.location}</p>
              </>
            ) : (
              <p className="text-sm text-ink/60 mt-2">Browse upcoming events from Community or Events API.</p>
            )}
          </div>
        </section>

        <p className="text-center text-sm text-ink/50 italic">
          Small steps in Ballari weather still build champions.
        </p>
      </div>
    </main>
  );
}
