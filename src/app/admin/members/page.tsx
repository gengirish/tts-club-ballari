import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { AdminSubnav } from "../admin-subnav";
import { listAdminMemberDirectory, ADMIN_MEMBER_DIRECTORY_LIMIT } from "@/server/admin/member-directory";
import { formatDateTimeIST } from "@/lib/utils/datetime";

export default async function AdminMembersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/app");

  const rows = await listAdminMemberDirectory();

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <AdminSubnav />
        <h1 className="font-display text-3xl uppercase text-violet sm:text-4xl">Members</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          Latest {ADMIN_MEMBER_DIRECTORY_LIMIT} accounts with role <strong className="text-ink/80">MEMBER</strong>{" "}
          (newest first). Same data as <code className="rounded bg-paper-muted px-1 py-0.5 text-xs">GET /api/members</code>
          .
        </p>

        <div className="mt-8 overflow-x-auto rounded-card border border-paper-deep bg-paper-raised shadow-sm">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <caption className="sr-only">Registered members, newest first</caption>
            <thead>
              <tr className="border-b border-paper-deep bg-paper-muted/80">
                <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink/55">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink/55">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink/55">
                  Username
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink/55">
                  Phone
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink/55">
                  City
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink/55">
                  Joined (IST)
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink/60">
                    No member accounts yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-paper-deep/80 last:border-0 hover:bg-paper-muted/40">
                    <td className="px-4 py-3 font-medium text-ink">{r.name ?? "—"}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-ink/85" title={r.email ?? ""}>
                      {r.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink/80">{r.username ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink/80">{r.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-ink/80">{r.city ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-ink/70">{formatDateTimeIST(r.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
