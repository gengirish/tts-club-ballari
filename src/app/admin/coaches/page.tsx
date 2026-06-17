import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { formatPaiseShort } from "@/lib/utils/money";
import { formatStars } from "@/lib/utils/percent";
import { AdminSubnav } from "../admin-subnav";
import { AdminAddCoachForm } from "./admin-add-coach-form";

export default async function AdminCoachesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/app");

  const coaches = await prisma.coach.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    include: {
      user: { select: { id: true, email: true, username: true, name: true, role: true, phone: true } },
    },
  });

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-10">
        <AdminSubnav />
        <div>
          <h1 className="font-display text-3xl uppercase text-violet sm:text-4xl">Coaches</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink/60">
            Create a dedicated coach login or promote an existing member. Coaches appear on{" "}
            <code className="rounded bg-paper-muted px-1 py-0.5 text-xs">/app/coaches</code> when{" "}
            <strong className="text-ink/80">available</strong> is on. Admins cannot be promoted from this form.
          </p>
        </div>

        <AdminAddCoachForm />

        <section>
          <h2 className="font-display text-lg uppercase text-magenta">Current coach profiles</h2>
          <div className="mt-4 overflow-x-auto rounded-card border border-paper-deep bg-paper-raised shadow-sm">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">Coach profiles</caption>
              <thead>
                <tr className="border-b border-paper-deep bg-paper-muted/80">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink/55">Name</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink/55">Email</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink/55">Username</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink/55">Type</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink/55">Role</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink/55">Price</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink/55">Listed</th>
                </tr>
              </thead>
              <tbody>
                {coaches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-ink/60">
                      No coach profiles yet.
                    </td>
                  </tr>
                ) : (
                  coaches.map((c) => (
                    <tr key={c.id} className="border-b border-paper-deep/80 last:border-0 hover:bg-paper-muted/40">
                      <td className="px-4 py-3 font-medium text-ink">{c.user.name ?? "—"}</td>
                      <td className="max-w-[180px] truncate px-4 py-3 font-mono text-xs" title={c.user.email ?? ""}>
                        {c.user.email ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{c.user.username ?? "—"}</td>
                      <td className="px-4 py-3 text-xs">{c.type}</td>
                      <td className="px-4 py-3 text-xs">{c.user.role}</td>
                      <td className="px-4 py-3 text-xs">
                        {formatStars(c.ratingBps)}★ · {formatPaiseShort(c.sessionPaise)}
                      </td>
                      <td className="px-4 py-3 text-xs">{c.available ? "Yes" : "No"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
