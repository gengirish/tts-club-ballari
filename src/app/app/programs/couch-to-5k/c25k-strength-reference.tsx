"use client";

import { useEffect, useState } from "react";
import { STRENGTH_PHASES, defaultStrengthTabForWeek } from "@/lib/programs/c25k-curriculum";

type TabId = (typeof STRENGTH_PHASES)[number]["id"];

export function C25kStrengthReference({ weekNo }: { weekNo: number }) {
  const [tab, setTab] = useState<TabId>(() => defaultStrengthTabForWeek(weekNo));

  useEffect(() => {
    setTab(defaultStrengthTabForWeek(weekNo));
  }, [weekNo]);

  const active = STRENGTH_PHASES.find((p) => p.id === tab) ?? STRENGTH_PHASES[0]!;

  return (
    <section className="rounded-card border border-paper-deep bg-paper-raised p-4 sm:p-6" data-testid="c25k-strength">
      <h2 className="font-display text-xl uppercase text-violet">Strength & mobility</h2>
      <p className="mt-1 text-xs text-ink/55">Bodyweight only — phases follow the Steel Sisters 12-week reference (weeks 1–3, 4–6, 7–11, taper).</p>

      <div className="mt-4 flex flex-wrap gap-1 rounded-xl bg-paper-deep p-1 sm:flex-nowrap">
        {STRENGTH_PHASES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setTab(p.id)}
            className={`min-h-[44px] flex-1 rounded-lg px-2 py-2 text-center text-[11px] font-extrabold transition sm:text-xs ${
              tab === p.id ? "bg-paper-raised text-violet shadow-md shadow-violet/10" : "text-ink/50 hover:text-ink/75"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-[11px] font-bold text-ink/50">{active.weeks}</p>

      <div className="mt-3 divide-y divide-paper-deep">
        {active.exercises.map((ex) => (
          <div key={ex.name} className="flex gap-3 py-3 first:pt-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-ink">{ex.name}</p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-ink/55">{ex.cue}</p>
            </div>
            <p className="shrink-0 font-display text-sm text-violet">{ex.reps}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-card border border-dashed border-paper-deep bg-paper px-4 py-3">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink/45">Why it matters</p>
        <p className="mt-1 text-xs font-semibold leading-relaxed text-ink">
          Lungs adapt fast; tendons and joints don&apos;t. The strength block is what keeps you injury-free in the
          later weeks.
        </p>
      </div>
    </section>
  );
}
