"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HostEventForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [type, setType] = useState("WALK");
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
