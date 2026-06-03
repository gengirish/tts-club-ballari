import { phaseForWeek, sessionCardsForWeek } from "@/lib/programs/c25k-curriculum";

type Props = {
  weekNo: number;
  coachName: string | null;
};

export function C25kWeekStack({ weekNo, coachName }: Props) {
  const phase = phaseForWeek(weekNo);
  const sessions = sessionCardsForWeek(weekNo);

  return (
    <section className="space-y-4" data-testid="c25k-week-stack">
      <div className="rounded-card bg-energy p-5 text-white shadow-lg shadow-magenta/25 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide">
            Week {weekNo}
          </span>
          <span className="font-display text-sm text-white/90">{phase.title}</span>
        </div>
        <p className="mt-2 text-sm text-white/85">Theme: build consistency — run more, walk less, stay conversational.</p>
        {coachName && (
          <p className="mt-3 text-sm font-semibold text-white">
            Coach: <span className="text-magenta-soft">{coachName}</span>
          </p>
        )}
      </div>

      <div className="space-y-3">
        {sessions.map((s) => (
          <div
            key={s.tag}
            className={`rounded-card border bg-white p-4 sm:p-5 ${
              s.highlight ? "border-magenta/50 ring-1 ring-magenta/20" : "border-paper-deep"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-violet-soft px-2 py-0.5 font-display text-[10px] uppercase tracking-wide text-white">
                {s.tag}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${s.pillClass}`}>
                {s.pill}
              </span>
            </div>
            <p className="mt-2 text-sm font-extrabold text-ink">{s.title}</p>
            <p className="text-[11.5px] text-ink/55">{s.meta}</p>
            {s.highlight && (
              <div className="mt-3 flex h-7 overflow-hidden rounded-lg">
                <div className="flex flex-[8] items-center justify-center bg-energy text-[9px] font-extrabold text-white">
                  run
                </div>
                <div className="flex flex-[2] items-center justify-center bg-paper-deep text-[9px] font-extrabold text-ink/50">
                  walk
                </div>
                <div className="flex flex-[10] items-center justify-center bg-energy text-[9px] font-extrabold text-white">
                  run
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-card border border-dashed border-magenta/35 bg-paper px-4 py-4 sm:px-5">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-magenta">Coach note</p>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-ink">
          This week prioritises honest easy pace. If you can&apos;t speak in full sentences, ease off — there is no such
          thing as too slow in Couch to 5K.
        </p>
      </div>
    </section>
  );
}
