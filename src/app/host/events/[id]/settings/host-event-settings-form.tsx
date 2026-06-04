"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export type HostEventSettingsInitial = {
  title: string;
  location: string;
  startsAt: string;
  type: string;
  capacity: number | null;
  publicRegistrationsOpen: boolean;
  paymentInstructions: string;
  whatsappGroupInviteUrl: string;
};

type Props = { eventId: string; initial: HostEventSettingsInitial };

export function HostEventSettingsForm({ eventId, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [location, setLocation] = useState(initial.location);
  const [startsAt, setStartsAt] = useState(isoToDatetimeLocalValue(initial.startsAt));
  const [type, setType] = useState(initial.type);
  const [capacity, setCapacity] = useState(initial.capacity != null ? String(initial.capacity) : "");
  const [publicRegistrationsOpen, setPublicRegistrationsOpen] = useState(initial.publicRegistrationsOpen);
  const [paymentInstructions, setPaymentInstructions] = useState(initial.paymentInstructions);
  const [whatsappGroupInviteUrl, setWhatsappGroupInviteUrl] = useState(initial.whatsappGroupInviteUrl);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    const cap = capacity.trim();
    const res = await fetch(`/api/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title,
        location,
        startsAt: new Date(startsAt).toISOString(),
        capacity: cap ? Number.parseInt(cap, 10) : null,
        publicRegistrationsOpen,
        paymentInstructions: paymentInstructions.trim() || null,
        whatsappGroupInviteUrl: whatsappGroupInviteUrl.trim() || "",
      }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok || !body.ok) {
      setMsg(body.error?.message ?? "Could not save");
      return;
    }
    setMsg("Saved.");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-card border border-paper-deep bg-paper-raised p-6 space-y-4">
      <h2 className="font-display text-xl uppercase text-violet">Event details</h2>
      <input
        className="w-full border rounded-card px-3 py-2"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        className="w-full border rounded-card px-3 py-2"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />
      <input
        className="w-full border rounded-card px-3 py-2"
        type="datetime-local"
        value={startsAt}
        onChange={(e) => setStartsAt(e.target.value)}
        required
      />
      <select className="w-full border rounded-card px-3 py-2" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="WALK">Walk</option>
        <option value="RUN">Run</option>
        <option value="YOGA">Yoga</option>
        <option value="MEETUP">Meetup</option>
        <option value="CYCLING">Cycling</option>
        <option value="TREKKING">Trekking</option>
      </select>
      <label className="block text-xs font-bold uppercase text-magenta">
        Capacity (optional — max approved paid registrations)
        <input
          className="mt-1 w-full border rounded-card px-3 py-2 font-normal"
          inputMode="numeric"
          placeholder="Leave empty for no limit"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
      </label>

      <hr className="border-paper-deep" />

      <h3 className="font-display text-lg uppercase text-violet">Web registration &amp; payment</h3>
      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input
          type="checkbox"
          checked={publicRegistrationsOpen}
          onChange={(e) => setPublicRegistrationsOpen(e.target.checked)}
        />
        Open public registration page
      </label>
      <p className="text-xs text-ink/55">
        Public path: <span className="font-mono break-all text-violet">/register/{eventId}</span> (share full URL with
        your site domain)
      </p>
      <label className="block text-xs font-bold uppercase text-magenta">
        Payment instructions (UPI ID, amount, payee name…)
        <textarea
          className="mt-1 w-full border rounded-card px-3 py-2 text-sm font-normal min-h-[100px]"
          value={paymentInstructions}
          onChange={(e) => setPaymentInstructions(e.target.value)}
          placeholder="e.g. Pay ₹200 to clubname@upi — upload screenshot below after payment."
        />
      </label>
      <label className="block text-xs font-bold uppercase text-magenta">
        WhatsApp group invite link (sent after approval)
        <input
          className="mt-1 w-full border rounded-card px-3 py-2 font-normal font-mono text-xs"
          value={whatsappGroupInviteUrl}
          onChange={(e) => setWhatsappGroupInviteUrl(e.target.value)}
          placeholder="https://chat.whatsapp.com/…"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-energy py-3 text-sm font-extrabold text-white disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save settings"}
      </button>
      {msg ? <p className="text-sm text-violet font-semibold">{msg}</p> : null}
    </form>
  );
}
