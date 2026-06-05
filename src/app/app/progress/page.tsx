import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { isMemberOnboarded } from "@/lib/member/onboarding-status";
import { prisma } from "@/lib/prisma";
import { formatDateIST } from "@/lib/utils/datetime";
import { AppBackToHome } from "../app-back-to-home";
import { ProgressCharts, ProgressLogForm, type ProgressRow } from "./progress-charts";

export default async function ProgressPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!(await isMemberOnboarded(user.id))) redirect("/app/onboarding");

  const since = new Date(Date.now() - 45 * 86400000);
  const entries = await prisma.progressEntry.findMany({
    where: { userId: user.id, date: { gte: since } },
    orderBy: { date: "asc" },
  });

  const rows: ProgressRow[] = entries.map((e) => ({
    date: formatDateIST(e.date),
    weightKg: e.weightKg,
    steps: e.steps,
    waterMl: e.waterMl,
    sleepHrs: e.sleepHrs,
  }));

  return (
    <main className="min-h-screen bg-paper px-4 py-10 text-ink">
      <div className="max-w-3xl mx-auto">
        <AppBackToHome />
        <h1 className="font-display text-4xl uppercase text-transparent bg-clip-text bg-energy">
          Progress
        </h1>
        <p className="text-sm text-ink/60 mt-2 mb-8">
          Each log is stored against your IST day bucket. Weight down is framed as a win when you are chasing
          weight-loss goals.
        </p>
        <ProgressLogForm />
        <ProgressCharts rows={rows} />
      </div>
    </main>
  );
}
