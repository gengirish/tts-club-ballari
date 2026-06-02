import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { isMemberOnboarded } from "@/lib/member/onboarding-status";
import { prisma } from "@/lib/prisma";
import { formatPaiseShort } from "@/lib/utils/money";
import { C25kPaySection } from "./c25k-pay-section";

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

  const weeks = Array.from({ length: program.weeks }, (_, i) => i + 1);

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <header>
          <p className="text-xs font-bold uppercase tracking-widest text-magenta">Flagship program</p>
          <h1 className="font-display text-4xl uppercase text-transparent bg-clip-text bg-energy">{program.title}</h1>
          <p className="text-ink/65 mt-2">{program.description}</p>
          <p className="mt-3 text-lg font-bold text-violet">{formatPaiseShort(program.pricePaise)} premium</p>
        </header>

        <section className="rounded-card border border-paper-deep bg-white p-6">
          <h2 className="font-display text-xl uppercase text-violet mb-3">12-week arc</h2>
          <ol className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs font-semibold text-center">
            {weeks.map((w) => (
              <li
                key={w}
                className={`rounded-lg py-2 ${enrollment && w <= enrollment.weekNo ? "bg-progress text-white" : "bg-paper-deep text-ink/60"}`}
              >
                W{w}
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-card border border-paper-deep bg-white p-6">
          <h2 className="font-display text-xl uppercase text-violet mb-2">Today&apos;s session</h2>
          <p className="text-sm text-ink/70">
            Week {enrollment?.weekNo ?? 1}: follow your plan in the app; WhatsApp reminders fire weekly after
            enrollment.
          </p>
          {enrollment?.coach && (
            <p className="mt-3 text-sm font-semibold text-ink">
              Coach: <span className="text-magenta">{enrollment.coach.user.name ?? "Assigned coach"}</span>
            </p>
          )}
        </section>

        <C25kPaySection amountPaise={program.pricePaise} hasEnrollment={!!enrollment} />
      </div>
    </main>
  );
}
