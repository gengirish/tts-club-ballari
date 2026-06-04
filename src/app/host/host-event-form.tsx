"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HostEventForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [type, setType] = useState("WALK");
  const [publicRegistrationsOpen, setPublicRegistrationsOpen] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const [whatsappGroupInviteUrl, setWhatsappGroupInviteUrl] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title,
        location,
        startsAt: new Date(startsAt).toISOString(),
        publicRegistrationsOpen,
        paymentInstructions: paymentInstructions.trim() || null,
        whatsappGroupInviteUrl: whatsappGroupInviteUrl.trim() || null,
      }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok || !body.ok) {
      setMsg(body.error?.message ?? "Could not create");
      return;
    }
    setTitle("");
    setLocation("");
    setStartsAt("");
    setPublicRegistrationsOpen(false);
    setPaymentInstructions("");
    setWhatsappGroupInviteUrl("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-card border border-paper-deep bg-paper-raised p-6 space-y-3 mb-8">
      <h2 className="font-display text-xl uppercase text-violet">New event</h2>
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
      <details className="rounded-lg border border-paper-deep p-3 bg-paper/50">
        <summary className="text-sm font-bold text-violet cursor-pointer">Web registration (optional)</summary>
        <div className="mt-3 space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={publicRegistrationsOpen}
              onChange={(e) => setPublicRegistrationsOpen(e.target.checked)}
            />
            Open public registration immediately
          </label>
          <textarea
            className="w-full border rounded-card px-3 py-2 text-sm min-h-[80px]"
            placeholder="Payment instructions (UPI, amount…)"
            value={paymentInstructions}
            onChange={(e) => setPaymentInstructions(e.target.value)}
          />
          <input
            className="w-full border rounded-card px-3 py-2 text-xs font-mono"
            placeholder="WhatsApp group invite URL (https://chat.whatsapp.com/…)"
            value={whatsappGroupInviteUrl}
            onChange={(e) => setWhatsappGroupInviteUrl(e.target.value)}
          />
        </div>
      </details>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-energy py-3 text-sm font-extrabold text-white disabled:opacity-60"
      >
        {loading ? "Saving…" : "Publish event"}
      </button>
      {msg && <p className="text-sm text-magenta font-semibold">{msg}</p>}
    </form>
  );
}
