"use client";

import { useState } from "react";

export function SosClientButton() {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function trigger() {
    if (!confirming) {
      setConfirming(true);
      setMsg("Press confirm again to trigger SOS, or cancel.");
      return;
    }

    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) setMsg(body.error?.message ?? "Failed");
      else setMsg("Alert logged. Stay safe — help is on the way.");
    } catch {
      setMsg("Failed");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  function cancelConfirmation() {
    if (loading) return;
    setConfirming(false);
    setMsg("SOS canceled.");
  }

  return (
    <div className="rounded-card border-2 border-magenta bg-magenta/5 p-4 text-center">
      <button
        type="button"
        onClick={trigger}
        disabled={loading}
        className="w-full rounded-full bg-magenta py-3 text-sm font-extrabold text-white disabled:opacity-60"
      >
        {loading ? "Sending…" : confirming ? "Confirm SOS alert" : "SOS — alert crew"}
      </button>
      {confirming && !loading ? (
        <button
          type="button"
          onClick={cancelConfirmation}
          className="mt-2 w-full rounded-full border border-magenta py-2 text-xs font-bold text-magenta"
        >
          Cancel
        </button>
      ) : null}
      {msg && <p className="mt-2 text-xs text-ink/80">{msg}</p>}
    </div>
  );
}
