import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTimeIST } from "@/lib/utils/datetime";
import { PublicEventRegisterForm } from "./public-register-form";

type Props = { params: { eventId: string } };

export default async function PublicRegisterPage({ params }: Props) {
  const event = await prisma.event.findUnique({
    where: { id: params.eventId },
    select: {
      id: true,
      title: true,
      location: true,
      startsAt: true,
      type: true,
      publicRegistrationsOpen: true,
      paymentInstructions: true,
    },
  });

  if (!event) notFound();
  if (!event.publicRegistrationsOpen) {
    return (
      <main className="min-h-screen bg-paper px-4 py-12">
        <div className="max-w-lg mx-auto rounded-card border border-paper-deep bg-paper-raised p-8 text-center">
          <h1 className="font-display text-2xl uppercase text-violet">Registration closed</h1>
          <p className="text-sm text-ink/60 mt-3">
            Web registration is not open for this event. Contact your SSS Club host if you need help.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-lg mx-auto">
        <header className="mb-6">
          <p className="text-xs font-bold uppercase text-magenta">Event registration</p>
          <h1 className="font-display text-3xl uppercase text-violet mt-1">{event.title}</h1>
          <p className="text-sm text-ink/60 mt-2">{formatDateTimeIST(event.startsAt)}</p>
          <p className="text-sm text-ink/70 mt-1">{event.location}</p>
        </header>
        <PublicEventRegisterForm
          eventId={event.id}
          paymentInstructions={event.paymentInstructions}
        />
      </div>
    </main>
  );
}
