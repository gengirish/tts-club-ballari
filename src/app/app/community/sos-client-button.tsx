"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SosClientButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function trigger() {
    if (!window.confirm("Trigger SOS? We will alert the ops inbox if configured.")) return;
    setMsg(null);
    setLoading(true);
    const res = await fetch("/api/sos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok || !body.ok) setMsg(body.error?.message ?? "Failed");
    else setMsg("Alert logged. Stay safe — help is on the way.");
  }

  return (
    <div className="rounded-card border-2 border-magenta bg-magenta/5 p-4 text-center">
      <button
        type="button"
        onClick={trigger}
        disabled={loading}
        className="w-full rounded-full bg-magenta py-3 text-sm font-extrabold text-white disabled:opacity-60"
      >
        {loading ? "Sending…" : "SOS — alert crew"}
      </button>
      {msg && <p className="mt-2 text-xs text-ink/80">{msg}</p>}
    </div>
  );
}
