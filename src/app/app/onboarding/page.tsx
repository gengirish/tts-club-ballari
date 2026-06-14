import Link from "next/link";
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
        <p className="mt-4 text-sm">
          <Link
            href="/app/help"
            className="font-bold uppercase tracking-wide text-violet-soft underline-offset-2 hover:underline"
            data-testid="onboarding-self-help-link"
          >
            Self-help guide
          </Link>
          <span className="text-ink/50"> · how the app works</span>
        </p>
      </div>

      <section
        className="relative mx-auto mb-10 max-w-2xl rounded-card border border-energy/35 bg-paper-raised p-4 text-left shadow-sm sm:p-5"
        aria-labelledby="onboarding-walking-to-5k-heading"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-energy">Happening now</p>
        <h2 id="onboarding-walking-to-5k-heading" className="mt-1 font-display text-lg font-bold uppercase text-ink sm:text-xl">
          Walking to 5K
        </h2>
        <p className="mt-2 text-sm text-ink/70">
          Register for the flagship cohort anytime — or finish this welcome flow first and open it from Home.
        </p>
        <div className="mt-4">
          <Link
            href="/walking-to-5k/register"
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-energy px-4 text-sm font-semibold text-white transition-[filter] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:w-auto"
            data-testid="onboarding-walking-to-5k-register"
          >
            Register online
          </Link>
        </div>
      </section>

      <OnboardingStepper />
    </main>
  );
}
