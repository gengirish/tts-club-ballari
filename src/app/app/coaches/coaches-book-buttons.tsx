"use client";

import { useState } from "react";

export function CoachesBookButtons({ coachId }: { coachId: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function book() {
    setMsg(null);
    setLoading(true);
    const res = await fetch(`/api/coaches/${coachId}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok || !body.ok) setMsg(body.error?.message ?? "Request failed");
    else setMsg("Request sent — we will reach out on email.");
  }

  return (
    <div className="shrink-0 flex flex-col gap-2">
      <button
        type="button"
        onClick={book}
        disabled={loading}
        className="rounded-full bg-energy px-5 py-2 text-sm font-extrabold text-white disabled:opacity-60"
      >
        {loading ? "Sending…" : "Book session"}
      </button>
      {msg && <p className="text-xs text-ink/70 max-w-[200px]">{msg}</p>}
    </div>
  );
}
