import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/rbac";
import { isMemberOnboarded } from "@/lib/member/onboarding-status";
import { prisma } from "@/lib/prisma";
import { formatPaiseShort } from "@/lib/utils/money";
import { clampWeek } from "@/lib/programs/c25k-curriculum";
import { AppBackToHome } from "../../app-back-to-home";
import { C25kPaySection } from "./c25k-pay-section";
import { C25kHeroAndOverview } from "./c25k-hero-and-overview";
import { C25kWeekStack } from "./c25k-week-stack";
import { C25kSessionBlocks } from "./c25k-session-blocks";
import { C25kStrengthReference } from "./c25k-strength-reference";
import { C25kSafetyAndGraduation } from "./c25k-safety-and-graduation";
import { C25kRacePack } from "./c25k-race-pack";

export default async function CouchTo5kPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!(await isMemberOnboarded(user.id))) redirect("/app/onboarding");

  const program = await prisma.program.findUnique({ where: { slug: "couch-to-5k" } });
  if (!program) redirect("/app");

  const enrollment = await prisma.programEnrollment.findUnique({
    where: { programId_memberId: { programId: program.id, memberId: user.id } },
    include: { coach: { include: { user: { select: { name: true } } } } },
  });

  const maxWeeks = program.weeks;
  const isEnrolled = !!enrollment;
  const displayWeekNo = clampWeek(enrollment?.weekNo ?? 1, maxWeeks);
  const coachName = enrollment?.coach?.user?.name ?? null;

  return (
    <main className="min-h-screen bg-paper pb-12" data-testid="c25k-page">
      <div className="px-4 pt-6 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <AppBackToHome />
        </div>
      </div>
      <C25kHeroAndOverview
        title={program.title}
        description={program.description}
        priceLabel={`${formatPaiseShort(program.pricePaise)} · premium`}
        maxWeeks={maxWeeks}
        displayWeekNo={displayWeekNo}
        isEnrolled={isEnrolled}
      />

      <div className="relative z-10 mx-auto max-w-2xl space-y-8 px-4 sm:px-6">
        {!isEnrolled ? (
          <div
            className="rounded-card border border-energy/35 bg-paper-raised p-4 sm:p-5"
            role="region"
            aria-label="Walking to 5K registration"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-energy">Flagship cohort</p>
            <p className="mt-1 text-sm font-semibold text-ink">Walking to 5K — open for registration</p>
            <p className="mt-1 text-sm text-ink/65">
              Complete the Walking to 5K intake online. Submit once to join Couch to 5K in the app.
            </p>
            <div className="mt-4">
              <Link
                href="/walking-to-5k/register"
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-energy px-4 text-sm font-semibold text-white transition-[filter] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:w-auto"
                data-testid="c25k-walking-to-5k-register"
              >
                Register for Walking to 5K
              </Link>
            </div>
          </div>
        ) : null}
        {isEnrolled && (
          <p className="text-sm text-ink/70">
            <Link href="/walking-to-5k/register" className="font-bold text-violet-soft hover:underline">
              Update programme registration
            </Link>
            {" · "}
            <Link href="/app/profile" className="font-bold text-violet-soft hover:underline">
              Edit profile & fitness level
            </Link>
          </p>
        )}
        {isEnrolled && (
          <C25kWeekStack weekNo={displayWeekNo} coachName={coachName} />
        )}

        <C25kSessionBlocks weekNo={displayWeekNo} />

        <C25kRacePack weekNo={displayWeekNo} />

        <C25kStrengthReference weekNo={displayWeekNo} />

        <C25kSafetyAndGraduation weekNo={displayWeekNo} maxWeeks={maxWeeks} isEnrolled={isEnrolled} />

        <C25kPaySection amountPaise={program.pricePaise} hasEnrollment={isEnrolled} />
      </div>
    </main>
  );
}
