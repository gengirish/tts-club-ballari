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

  const [progressToday, latestScore, health, challengePart, nextReg, walkingTo5kEnrollment] = await Promise.all([
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
    prisma.programEnrollment.findFirst({
      where: { memberId: user.id, program: { slug: "couch-to-5k" } },
      select: { id: true },
    }),
  ]);
  const walkingTo5kEnrolled = !!walkingTo5kEnrollment;

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
              ["/app/events", "Events"],
              ["/app/programs/couch-to-5k", "C25K"],
              ["/app/coaches", "Coaches"],
              ["/app/community", "Community"],
              ["/app/help", "Self-help"],
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

        <section
          className="rounded-card border border-energy/35 bg-gradient-to-br from-paper-raised to-violet/5 p-5 shadow-sm sm:p-6"
          aria-labelledby="walking-to-5k-home-heading"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-energy">Happening now</p>
              <h2 id="walking-to-5k-home-heading" className="mt-1 font-display text-xl font-bold uppercase text-ink sm:text-2xl">
                Walking to 5K
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                {walkingTo5kEnrolled
                  ? "You are on the roster. Update your medical / consent form or jump into Couch to 5K whenever you like."
                  : "Our flagship Ballari cohort — complete registration online in a few minutes."}
              </p>
            </div>
            <div className="flex shrink-0 sm:min-w-[11rem]">
              <Link
                href="/walking-to-5k/register"
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-energy px-5 text-center text-sm font-semibold text-white transition-[filter] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:w-auto"
                data-testid="app-home-walking-to-5k-register"
              >
                {walkingTo5kEnrolled ? "Update registration" : "Register online"}
              </Link>
            </div>
          </div>
        </section>

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
                <Link
                  href="/app/events"
                  className="mt-3 inline-block text-xs font-bold uppercase tracking-wide text-violet-soft hover:underline"
                  data-testid="app-home-next-event-link"
                >
                  Events hub →
                </Link>
              </>
            ) : (
              <p className="text-sm text-ink/60 mt-2">
                <Link href="/app/events" className="font-bold text-violet-soft hover:underline" data-testid="app-home-events-empty">
                  Browse upcoming events
                </Link>{" "}
                and register when a session opens.
              </p>
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
