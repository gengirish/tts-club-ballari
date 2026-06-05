import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { isMemberOnboarded } from "@/lib/member/onboarding-status";
import { getMemberOnboardingForm } from "@/server/member/member-profile";
import { AppBackToHome } from "../app-back-to-home";
import { OnboardingStepper } from "../onboarding/onboarding-stepper";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!(await isMemberOnboarded(user.id))) redirect("/app/onboarding");

  const initialForm = await getMemberOnboardingForm(user.id);
  if (!initialForm) redirect("/app/onboarding");

  return (
    <main className="relative min-h-screen px-4 py-10 md:py-14 bg-paper text-ink overflow-hidden">
      <div className="absolute inset-0 bg-energy-soft opacity-[0.12] pointer-events-none" aria-hidden />
      <div className="relative max-w-2xl mx-auto">
        <AppBackToHome />
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-magenta mb-2">Your profile</p>
          <h1 className="font-display text-4xl md:text-5xl uppercase text-transparent bg-clip-text bg-energy leading-tight">
            Edit details
          </h1>
          <p className="text-ink/65 mt-3 text-sm md:text-base max-w-md mx-auto">
            Fix typos, update your fitness level, or change goals — saves to your existing account.
          </p>
        </div>
        <OnboardingStepper mode="edit" initialForm={initialForm} />
      </div>
    </main>
  );
}
