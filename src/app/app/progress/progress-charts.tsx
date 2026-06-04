"use client";

import { useMemo, useState } from "react";

export type ProgressRow = {
  date: string;
  weightKg: number | null;
  steps: number | null;
  waterMl: number | null;
  sleepHrs: number | null;
};

function BarChart({
  title,
  rows,
  accessor,
  positiveDown,
}: {
  title: string;
  rows: ProgressRow[];
  accessor: keyof Pick<ProgressRow, "weightKg" | "steps" | "waterMl" | "sleepHrs">;
  positiveDown?: boolean;
}) {
  const values = rows.map((r) => r[accessor]).filter((v): v is number => v != null && !Number.isNaN(v));
  if (values.length === 0) {
    return (
      <div className="rounded-card border border-paper-deep bg-paper-raised p-4">
        <h3 className="font-display text-lg uppercase text-violet mb-2">{title}</h3>
        <p className="text-sm text-ink/50">No entries in this range yet.</p>
      </div>
    );
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;

  return (
    <div className="rounded-card border border-paper-deep bg-paper-raised p-4">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="font-display text-lg uppercase text-violet">{title}</h3>
        {positiveDown && accessor === "weightKg" && (
          <span className="text-xs font-semibold text-progress">Down = celebration</span>
        )}
      </div>
      <div className="flex items-end gap-1 h-40">
        {rows.map((r) => {
          const v = r[accessor];
          const px = v == null ? 6 : 8 + ((v - min) / span) * 120;
          return (
            <div key={r.date} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0 h-full">
              <div
                className={`w-full rounded-t-md ${positiveDown && accessor === "weightKg" ? "bg-progress/80" : "bg-energy"}`}
                style={{ height: `${Math.min(120, Math.max(6, px))}px` }}
                title={v != null ? String(v) : "—"}
              />
              <span className="text-[10px] text-ink/40 truncate w-full text-center">
                {r.date.slice(0, 5)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const logLabelClass = "block text-xs font-extrabold uppercase tracking-wide text-ink/70";
const logInputClass =
  "mt-1.5 w-full rounded-card border border-paper-deep bg-paper-muted px-3 py-2.5 text-ink outline-none transition placeholder:text-ink/40 focus:border-violet focus:ring-2 focus:ring-violet/20";

export function ProgressLogForm() {
  const [weightKg, setWeightKg] = useState("");
  const [steps, setSteps] = useState("");
  const [waterMl, setWaterMl] = useState("");
  const [sleepHrs, setSleepHrs] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setMsg(null);
    const body: Record<string, number> = {};
    const w = weightKg.trim();
    const s = steps.trim();
    const wa = waterMl.trim();
    const sl = sleepHrs.trim();
    if (w) body.weightKg = Number(w);
    if (s) body.steps = Number(s);
    if (wa) body.waterMl = Number(wa);
    if (sl) body.sleepHrs = Number(sl);
    if (Object.keys(body).length === 0) {
      setMsg("Enter at least one value.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.ok) {
      setMsg(data.error?.message ?? "Save failed");
      return;
    }
    setWeightKg("");
    setSteps("");
    setWaterMl("");
    setSleepHrs("");
    setMsg("Saved for today (IST).");
    window.location.reload();
  }

  return (
    <div className="rounded-card border border-paper-deep bg-paper-raised p-6 mb-8">
      <h2 className="font-display text-xl uppercase text-violet mb-4">Log today</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={logLabelClass}>
          Weight (kg)
          <input
            className={logInputClass}
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            inputMode="decimal"
            placeholder="e.g. 62.5"
          />
        </label>
        <label className={logLabelClass}>
          Steps
          <input
            className={logInputClass}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            inputMode="numeric"
            placeholder="e.g. 8000"
          />
        </label>
        <label className={logLabelClass}>
          Water (ml)
          <input
            className={logInputClass}
            value={waterMl}
            onChange={(e) => setWaterMl(e.target.value)}
            inputMode="numeric"
            placeholder="e.g. 2000"
          />
        </label>
        <label className={logLabelClass}>
          Sleep (hrs)
          <input
            className={logInputClass}
            value={sleepHrs}
            onChange={(e) => setSleepHrs(e.target.value)}
            inputMode="decimal"
            placeholder="e.g. 7.5"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={save}
        disabled={loading}
        className="mt-4 w-full rounded-full bg-energy py-3 text-sm font-extrabold text-white disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save progress"}
      </button>
      {msg && <p className="mt-2 text-sm text-ink/70">{msg}</p>}
    </div>
  );
}

export function ProgressCharts({ rows }: { rows: ProgressRow[] }) {
  const [mode, setMode] = useState<"week" | "month">("week");

  const slice = useMemo(() => {
    const n = mode === "week" ? 7 : 30;
    return rows.slice(-n);
  }, [rows, mode]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 justify-center">
        {(["week", "month"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${
              mode === m ? "bg-magenta text-white" : "bg-paper-deep text-ink/70"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      <BarChart title="Weight" rows={slice} accessor="weightKg" positiveDown />
      <BarChart title="Steps" rows={slice} accessor="steps" />
      <div className="grid md:grid-cols-2 gap-4">
        <BarChart title="Water (ml)" rows={slice} accessor="waterMl" />
        <BarChart title="Sleep (hrs)" rows={slice} accessor="sleepHrs" />
      </div>
    </div>
  );
}
