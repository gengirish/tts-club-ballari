import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { isMemberOnboarded } from "@/lib/member/onboarding-status";
import { prisma } from "@/lib/prisma";
import { formatPaiseShort } from "@/lib/utils/money";
import { clampWeek } from "@/lib/programs/c25k-curriculum";
import { C25kPaySection } from "./c25k-pay-section";
import { C25kHeroAndOverview } from "./c25k-hero-and-overview";
import { C25kWeekStack } from "./c25k-week-stack";
import { C25kSessionBlocks } from "./c25k-session-blocks";
import { C25kStrengthReference } from "./c25k-strength-reference";
import { C25kSafetyAndGraduation } from "./c25k-safety-and-graduation";

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
      <C25kHeroAndOverview
        title={program.title}
        description={program.description}
        priceLabel={`${formatPaiseShort(program.pricePaise)} · premium`}
        maxWeeks={maxWeeks}
        displayWeekNo={displayWeekNo}
        isEnrolled={isEnrolled}
      />

      <div className="relative z-10 mx-auto max-w-2xl space-y-8 px-4 sm:px-6">
        {isEnrolled && (
          <C25kWeekStack weekNo={displayWeekNo} coachName={coachName} />
        )}

        <C25kSessionBlocks weekNo={displayWeekNo} />

        <C25kStrengthReference weekNo={displayWeekNo} />

        <C25kSafetyAndGraduation weekNo={displayWeekNo} maxWeeks={maxWeeks} isEnrolled={isEnrolled} />

        <C25kPaySection amountPaise={program.pricePaise} hasEnrollment={isEnrolled} />
      </div>
    </main>
  );
}
