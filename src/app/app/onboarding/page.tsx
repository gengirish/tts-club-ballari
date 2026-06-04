import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { isMemberOnboarded } from "@/lib/member/onboarding-status";
import { OnboardingStepper } from "./onboarding-stepper";

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (await isMemberOnboarded(user.id)) {
    redirect("/app");
  }

  return (
    <main className="relative min-h-screen px-4 py-10 md:py-14 bg-paper text-ink overflow-hidden">
      <div className="absolute inset-0 bg-energy-soft opacity-[0.12] pointer-events-none" aria-hidden />
      <div className="relative max-w-2xl mx-auto text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-magenta mb-2">Steel Sisters & Striders</p>
        <h1 className="font-display text-4xl md:text-5xl uppercase text-transparent bg-clip-text bg-energy leading-tight">
          Welcome home
        </h1>
        <p className="text-ink/65 mt-3 text-sm md:text-base max-w-md mx-auto">
          A quick setup so your Ballari crew can support you — personal, health, movement, then goals.
        </p>
      </div>
      <OnboardingStepper />
    </main>
  );
}
