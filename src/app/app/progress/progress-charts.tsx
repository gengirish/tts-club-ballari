"use client";

import { useCallback, useMemo, useState } from "react";

export type ProgressRow = {
  date: string;
  weightKg: number | null;
  steps: number | null;
  waterMl: number | null;
  sleepHrs: number | null;
};

type ProgressApiRow = {
  date: string;
  weightKg: number | null;
  steps: number | null;
  waterMl: number | null;
  sleepHrs: number | null;
};

type SaveProgressResponse =
  | { ok: true; data: ProgressApiRow }
  | { ok: false; error?: { code?: string; message?: string } };

const IST_TIMEZONE = "Asia/Kolkata";

function formatDateIST(d: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(d));
}

function parseDateLabelToEpoch(label: string): number {
  const [day, month, year] = label.split("/").map((part) => Number(part));
  if (!day || !month || !year) return 0;
  return new Date(year, month - 1, day).getTime();
}

function toProgressRow(row: ProgressApiRow): ProgressRow {
  return {
    date: formatDateIST(row.date),
    weightKg: row.weightKg,
    steps: row.steps,
    waterMl: row.waterMl,
    sleepHrs: row.sleepHrs,
  };
}

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

export function ProgressLogForm({ onSaved }: { onSaved?: (row: ProgressRow) => void }) {
  const [weightKg, setWeightKg] = useState("");
  const [steps, setSteps] = useState("");
  const [waterMl, setWaterMl] = useState("");
  const [sleepHrs, setSleepHrs] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "validation" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setFeedback(null);
    const body: Record<string, number> = {};
    const invalidFields: string[] = [];
    const w = weightKg.trim();
    const s = steps.trim();
    const wa = waterMl.trim();
    const sl = sleepHrs.trim();

    if (w) {
      const parsed = Number(w);
      if (Number.isFinite(parsed)) body.weightKg = parsed;
      else invalidFields.push("weight");
    }
    if (s) {
      const parsed = Number(s);
      if (Number.isFinite(parsed)) body.steps = parsed;
      else invalidFields.push("steps");
    }
    if (wa) {
      const parsed = Number(wa);
      if (Number.isFinite(parsed)) body.waterMl = parsed;
      else invalidFields.push("water");
    }
    if (sl) {
      const parsed = Number(sl);
      if (Number.isFinite(parsed)) body.sleepHrs = parsed;
      else invalidFields.push("sleep");
    }

    if (invalidFields.length > 0) {
      setFeedback({
        type: "validation",
        message: `Please enter valid numbers for: ${invalidFields.join(", ")}.`,
      });
      return;
    }

    if (Object.keys(body).length === 0) {
      setFeedback({ type: "validation", message: "Enter at least one value before saving." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let data: SaveProgressResponse | null = null;
      try {
        data = (await res.json()) as SaveProgressResponse;
      } catch {
        data = null;
      }

      if (!res.ok || !data?.ok) {
        const errorPayload = data && !data.ok ? data.error : undefined;
        const isValidation = res.status === 422 || errorPayload?.code === "VALIDATION";
        setFeedback({
          type: isValidation ? "validation" : "error",
          message:
            errorPayload?.message ??
            (isValidation
              ? "Please review your values and try again."
              : "Could not save progress right now. Please try again."),
        });
        return;
      }

      setWeightKg("");
      setSteps("");
      setWaterMl("");
      setSleepHrs("");
      onSaved?.(toProgressRow(data.data));
      setFeedback({ type: "success", message: "Saved for today (IST). Charts updated." });
    } catch {
      setFeedback({
        type: "error",
        message: "Network error while saving. Check your connection and retry.",
      });
    } finally {
      setLoading(false);
    }
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
      {feedback && (
        <p
          className={`mt-2 text-sm ${
            feedback.type === "success"
              ? "text-progress"
              : feedback.type === "validation"
                ? "text-magenta"
                : "text-ink/70"
          }`}
        >
          {feedback.message}
        </p>
      )}
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

export function ProgressSection({ initialRows }: { initialRows: ProgressRow[] }) {
  const [rows, setRows] = useState<ProgressRow[]>(() => initialRows);

  const handleSaved = useCallback((savedRow: ProgressRow) => {
    setRows((prev) => {
      const next = [...prev];
      const existingIdx = next.findIndex((row) => row.date === savedRow.date);
      if (existingIdx >= 0) next[existingIdx] = savedRow;
      else next.push(savedRow);
      next.sort((a, b) => parseDateLabelToEpoch(a.date) - parseDateLabelToEpoch(b.date));
      return next;
    });
  }, []);

  return (
    <>
      <ProgressLogForm onSaved={handleSaved} />
      <ProgressCharts rows={rows} />
    </>
  );
}
