"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDateTimeIST } from "@/lib/utils/datetime";

function formatEventType(t: string) {
  return t.charAt(0) + t.slice(1).toLowerCase();
}

export type EventDetailPayload = {
  id: string;
  title: string;
  location: string;
  type: string;
  startsAt: string;
  capacity: number | null;
  registrationCount: number;
  hostName: string | null;
  lat: number | null;
  lng: number | null;
  myRegistration: { id: string; checkedInAt: string | null } | null;
};

export function EventDetailClient({ event }: { event: EventDetailPayload }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"register" | "checkin" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const registered = !!event.myRegistration;
  const checkedIn = !!event.myRegistration?.checkedInAt;
  const full = event.capacity != null && event.registrationCount >= event.capacity && !registered;
  const mapsUrl =
    event.lat != null && event.lng != null
      ? `https://www.google.com/maps/search/?api=1&query=${event.lat},${event.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;

  async function register() {
    setMsg(null);
    setBusy("register");
    try {
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = (await res.json()) as { ok?: boolean; error?: { message?: string } };
      if (!res.ok || !body.ok) {
        setMsg(body.error?.message ?? "Could not register");
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function checkIn() {
    setMsg(null);
    setBusy("checkin");
    try {
      const res = await fetch(`/api/events/${event.id}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = (await res.json()) as { ok?: boolean; error?: { message?: string } };
      if (!res.ok || !body.ok) {
        setMsg(body.error?.message ?? "Could not check in");
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      {msg && (
        <p className="rounded-lg border border-magenta/40 bg-magenta/10 px-3 py-2 text-sm text-ink" role="alert">
          {msg}
        </p>
      )}

      <div className="rounded-card border border-paper-deep bg-paper-raised p-6 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-energy">{formatEventType(event.type)}</p>
        <h1 className="font-display text-3xl uppercase text-violet">{event.title}</h1>
        <p className="text-sm text-ink/70">{formatDateTimeIST(event.startsAt)}</p>
        <p className="text-sm text-ink/80">{event.location}</p>
        {event.hostName && (
          <p className="text-xs text-ink/50">
            Host · <span className="text-ink/70">{event.hostName}</span>
          </p>
        )}
        <p className="text-xs text-ink/50">
          {event.capacity == null
            ? `${event.registrationCount} registered`
            : `${Math.max(0, event.capacity - event.registrationCount)} spots left · ${event.registrationCount}/${event.capacity}`}
        </p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-bold text-violet-soft hover:underline"
        >
          Open in Maps →
        </a>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {!registered ? (
          <button
            type="button"
            disabled={full || busy === "register"}
            onClick={() => void register()}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-magenta px-6 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:bg-ink/25"
            data-testid="event-detail-register"
          >
            {full ? "Event is full" : busy === "register" ? "Saving…" : "Register for this event"}
          </button>
        ) : (
          <>
            <p className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-ink/10 px-6 text-sm font-bold text-ink/80">
              You are on the roster
            </p>
            {!checkedIn ? (
              <button
                type="button"
                disabled={busy === "checkin"}
                onClick={() => void checkIn()}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full border-2 border-progress bg-paper-muted px-6 text-sm font-extrabold text-progress hover:bg-progress/10"
                data-testid="event-detail-checkin"
              >
                {busy === "checkin" ? "Saving…" : "Check in (I am here)"}
              </button>
            ) : (
              <p
                className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-progress/15 px-6 text-sm font-bold text-progress"
                data-testid="event-detail-checked-in"
              >
                Checked in
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
