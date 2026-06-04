import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { EventApplicationsBoard } from "@/app/admin/event-registrations/event-applications-board";

export default async function HostEventRegistrationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!["HOST", "ADMIN"].includes(user.role)) redirect("/app");

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-3xl uppercase text-violet">Your event registrations</h1>
        <p className="text-sm text-ink/60 mt-2 mb-8 max-w-2xl">
          Applications for events you host. Approve payments, then send the pass link via WhatsApp using the
          prefilled message button.
        </p>
        <EventApplicationsBoard />
      </div>
    </main>
  );
}
