import { clampWeek, phaseTimelineState, progressThroughProgram } from "@/lib/programs/c25k-curriculum";

type Props = {
  title: string;
  description: string | null;
  priceLabel: string;
  maxWeeks: number;
  /** Active training week when enrolled; otherwise preview from week 1. */
  displayWeekNo: number;
  isEnrolled: boolean;
};

export function C25kHeroAndOverview({
  title,
  description,
  priceLabel,
  maxWeeks,
  displayWeekNo,
  isEnrolled,
}: Props) {
  const w = clampWeek(displayWeekNo, maxWeeks);
  const pct = progressThroughProgram(w, maxWeeks);
  const timeline = phaseTimelineState(w);

  return (
    <div className="relative overflow-hidden rounded-b-[2rem] bg-violet-deep px-4 pb-10 pt-8 text-white shadow-xl shadow-violet/30 sm:px-6 sm:rounded-b-[2.5rem]">
      <div
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet/50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 top-24 h-64 w-64 rounded-full bg-magenta/35 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-2xl">
        <p className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-magenta-soft">
          <span className="inline-block h-0.5 w-7 bg-magenta" aria-hidden />
          Flagship program · 12 weeks
        </p>
        <h1
          className="font-display text-[clamp(2rem,8vw,3.25rem)] uppercase leading-[0.95] tracking-tight"
          data-testid="c25k-hero-title"
        >
          <span className="text-white">{title}</span>
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/75">
          {description ??
            "Your first 5 km with a coach-supported arc: three sessions a week (two solo, one Sunday group), reminders on WhatsApp after you enrol, and a graduation run at the end."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-energy px-4 py-2 text-[12px] font-extrabold text-white shadow-md shadow-magenta/30">
            Absolute beginner
          </span>
          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-2 text-[12px] font-bold text-white/90">
            No time target — finishing wins
          </span>
          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-2 text-[12px] font-bold text-white/90">
            {priceLabel}
          </span>
        </div>

        {isEnrolled && (
          <div className="mt-6 flex items-baseline justify-between gap-3 border-t border-white/10 pt-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-magenta-soft">Your progress</p>
            <p className="font-display text-sm text-white/90">
              Week {w} of {maxWeeks} · {pct}%
            </p>
          </div>
        )}
      </div>

      <div className="relative mx-auto mt-8 max-w-2xl rounded-card border border-white/10 bg-paper px-4 py-6 text-ink shadow-lg sm:px-6">
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {[
            { k: "Duration", v: `${maxWeeks} wks`, d: "3 sessions / week" },
            { k: "Built for", v: "Beginners", d: "Zero base assumed" },
            { k: "Goal", v: "Finish 5K", d: "No pace pressure" },
            { k: "Rhythm", v: "Solo ×2", d: "+ Sunday group" },
          ].map((cell) => (
            <div
              key={cell.k}
              className="rounded-xl border border-paper-deep bg-white px-3 py-3 shadow-sm sm:px-3.5"
            >
              <p className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-ink/45">{cell.k}</p>
              <p className="font-display text-xl leading-none text-violet">{cell.v}</p>
              <p className="mt-1 text-[11px] text-ink/50">{cell.d}</p>
            </div>
          ))}
        </div>

        <h2 className="font-display text-lg uppercase text-violet">The {maxWeeks}-week arc</h2>
        <p className="mt-1 text-xs text-ink/55">
          {isEnrolled
            ? "You are here in the journey — keep showing up."
            : "Preview the arc. Enrol below to unlock reminders and structured weeks in the app."}
        </p>

        <ol className="relative ml-2 mt-5 space-y-0 border-l-2 border-paper-deep pl-5">
          {timeline.map(({ phase, status }) => (
            <li key={phase.label} className="relative pb-5 last:pb-0">
              <span
                className={`absolute -left-[1.4rem] top-1.5 flex h-3 w-3 rounded-full border-2 border-white ${
                  status === "done"
                    ? "bg-violet"
                    : status === "current"
                      ? "bg-magenta shadow-[0_0_0_4px_rgba(236,15,140,0.18)]"
                      : "bg-paper-deep"
                }`}
                aria-hidden
              />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-ink/45">{phase.label}</p>
              <p
                className={`text-sm font-extrabold ${status === "current" ? "text-magenta" : "text-ink"}`}
              >
                {phase.title}
              </p>
              <p className="text-[11.5px] leading-snug text-ink/55">{phase.detail}</p>
            </li>
          ))}
          <li className="relative pb-0">
            <span
              className="absolute -left-[1.4rem] top-1.5 h-3 w-3 rounded-full border-2 border-paper-deep bg-paper-deep"
              aria-hidden
            />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-ink/45">Race day</p>
            <p className="text-sm font-extrabold text-ink">SSS 5K graduation run</p>
            <p className="text-[11.5px] text-ink/55">Every finisher wins — celebrate the arc.</p>
          </li>
        </ol>
      </div>
    </div>
  );
}
