import { prisma } from "@/lib/prisma";
import { profileToOnboardingForm, type OnboardingFormState } from "@/lib/member/onboarding-form";

export async function getMemberOnboardingForm(userId: string): Promise<OnboardingFormState | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      dob: true,
      gender: true,
      occupation: true,
      city: true,
      healthProfile: true,
      goals: { select: { goal: true } },
    },
  });
  if (!user) return null;
  return profileToOnboardingForm(user);
}
