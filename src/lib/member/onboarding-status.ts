import { prisma } from "@/lib/prisma";

/** True when the member has finished the onboarding flow (name, health profile, ≥1 goal). */
export async function isMemberOnboarded(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  if (!user?.name || user.name.trim().length < 2) return false;

  const [profile, goalCount] = await Promise.all([
    prisma.healthProfile.findUnique({ where: { userId }, select: { id: true } }),
    prisma.memberGoal.count({ where: { userId } }),
  ]);

  return profile !== null && goalCount > 0;
}
