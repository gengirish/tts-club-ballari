"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error: { message?: string } };

export function RecomputeScoreButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/score/recompute", { method: "POST" });
    const body = (await res.json()) as ApiEnvelope<{ score: number }>;
    setLoading(false);
    if (!res.ok || !body.ok) {
      setErr("error" in body ? (body.error?.message ?? "Could not recompute") : "Could not recompute");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="rounded-full bg-energy px-6 py-2.5 text-sm font-extrabold text-white disabled:opacity-60"
      >
        {loading ? "Computing…" : "Recompute score"}
      </button>
      {err && <p className="mt-2 text-sm font-semibold text-magenta">{err}</p>}
    </div>
  );
}
