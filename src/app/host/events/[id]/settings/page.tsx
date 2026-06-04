import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { formatDateTimeIST } from "@/lib/utils/datetime";
import { HostEventSettingsForm } from "./host-event-settings-form";

type Props = { params: { id: string } };

export default async function HostEventSettingsPage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!["HOST", "ADMIN"].includes(user.role)) redirect("/app");

  const ev = await prisma.event.findUnique({ where: { id: params.id } });
  if (!ev) notFound();
  if (user.role !== "ADMIN" && ev.hostId !== user.id) redirect("/host");

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-xl mx-auto">
        <p className="text-sm mb-4">
          <Link href="/host" className="text-violet font-bold underline">
            ← Host hub
          </Link>
        </p>
        <h1 className="font-display text-2xl uppercase text-violet">Registration settings</h1>
        <p className="text-sm text-ink/60 mt-1 mb-6">{ev.title} · {formatDateTimeIST(ev.startsAt)}</p>
        <HostEventSettingsForm
          eventId={ev.id}
          initial={{
            title: ev.title,
            location: ev.location,
            startsAt: ev.startsAt.toISOString(),
            type: ev.type,
            capacity: ev.capacity,
            publicRegistrationsOpen: ev.publicRegistrationsOpen,
            paymentInstructions: ev.paymentInstructions ?? "",
            whatsappGroupInviteUrl: ev.whatsappGroupInviteUrl ?? "",
          }}
        />
      </div>
    </main>
  );
}
