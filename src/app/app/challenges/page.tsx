import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { isMemberOnboarded } from "@/lib/member/onboarding-status";
import { prisma } from "@/lib/prisma";
import { ChallengesClient } from "./challenges-client";

export default async function ChallengesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!(await isMemberOnboarded(user.id))) redirect("/app/onboarding");

  const now = new Date();
  const challenges = await prisma.challenge.findMany({
    where: { endDate: { gte: now } },
    orderBy: { startDate: "desc" },
    include: {
      participants: {
        include: { user: { select: { name: true } } },
      },
    },
  });

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl uppercase text-transparent bg-clip-text bg-energy">Challenges</h1>
        <p className="text-sm text-ink/60 mt-2 mb-8">Active challenges and live leaderboards.</p>
        <ChallengesClient challenges={challenges} userId={user.id} />
      </div>
    </main>
  );
}
