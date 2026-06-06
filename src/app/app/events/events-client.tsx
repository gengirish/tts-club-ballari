"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDateTimeIST } from "@/lib/utils/datetime";

export type EventsListItem = {
  id: string;
  title: string;
  location: string;
  type: string;
  startsAt: string;
  capacity: number | null;
  registrationCount: number;
  hostName: string | null;
  myRegistration: { id: string; checkedInAt: string | null } | null;
};

function spotsLabel(capacity: number | null, count: number) {
  if (capacity == null) return `${count} registered`;
  const left = Math.max(0, capacity - count);
  return left === 0 ? "Full" : `${left} spot${left === 1 ? "" : "s"} left · ${count}/${capacity}`;
}

function formatEventType(t: string) {
  return t.charAt(0) + t.slice(1).toLowerCase();
}

export function EventsClient({ events }: { events: EventsListItem[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function register(eventId: string) {
    setMsg(null);
    setBusyId(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = (await res.json()) as { ok?: boolean; error?: { message?: string; code?: string } };
      if (!res.ok || !body.ok) {
        setMsg(body.error?.message ?? "Could not register");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {msg && (
        <p className="rounded-lg border border-magenta/40 bg-magenta/10 px-3 py-2 text-sm text-ink" role="alert">
          {msg}
        </p>
      )}

      {events.length === 0 ? (
        <p className="rounded-card border border-paper-deep bg-paper-raised p-6 text-sm text-ink/70">
          No upcoming events right now. When hosts publish sessions, they will show up here so you can register and
          track your spot.
        </p>
      ) : (
        <ul className="space-y-4">
          {events.map((ev) => {
            const registered = !!ev.myRegistration;
            const checkedIn = !!ev.myRegistration?.checkedInAt;
            const full = ev.capacity != null && ev.registrationCount >= ev.capacity && !registered;

            return (
              <li
                key={ev.id}
                className="rounded-card border border-paper-deep bg-paper-raised p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-energy">{formatEventType(ev.type)}</p>
                  <h2 className="font-display text-xl uppercase text-violet mt-1">{ev.title}</h2>
                  <p className="text-sm text-ink/70 mt-1">{formatDateTimeIST(ev.startsAt)}</p>
                  <p className="text-sm text-ink/60 mt-0.5">{ev.location}</p>
                  {ev.hostName && (
                    <p className="text-xs text-ink/50 mt-2">
                      Host · <span className="text-ink/70">{ev.hostName}</span>
                    </p>
                  )}
                  <p className="text-xs text-ink/50 mt-1">{spotsLabel(ev.capacity, ev.registrationCount)}</p>
                  {registered && (
                    <p className="text-xs font-semibold text-progress mt-2">
                      {checkedIn ? "Checked in for this event" : "You are registered"}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <Link
                    href={`/app/events/${ev.id}`}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-steel/30 bg-paper-muted px-5 text-sm font-bold text-ink hover:border-violet/50"
                  >
                    Details
                  </Link>
                  {!registered ? (
                    <button
                      type="button"
                      disabled={full || busyId === ev.id}
                      onClick={() => void register(ev.id)}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-magenta px-5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:bg-ink/25"
                      data-testid={`events-register-${ev.id}`}
                    >
                      {full ? "Full" : busyId === ev.id ? "Saving…" : "Register"}
                    </button>
                  ) : (
                    <span className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink/10 px-5 text-sm font-bold text-ink/70">
                      Registered
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
