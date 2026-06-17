import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { AdminSubnav } from "../admin-subnav";
import { EventApplicationsBoard } from "./event-applications-board";

export default async function AdminEventRegistrationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/app");

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <AdminSubnav />
        <h1 className="font-display text-3xl uppercase text-violet">Event registrations</h1>
        <p className="text-sm text-ink/60 mt-2 mb-8 max-w-2xl">
          Review payment screenshots, approve participants, then use the WhatsApp shortcut to send the pass link and
          group invite. No Google Forms or Sheets required — everything stays in this portal.
        </p>
        <EventApplicationsBoard />
      </div>
    </main>
  );
}
