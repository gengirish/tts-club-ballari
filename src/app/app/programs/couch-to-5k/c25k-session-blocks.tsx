import { getC25kWeek, phaseForWeek } from "@/lib/programs/c25k-curriculum";

type Props = { weekNo: number };

export function C25kSessionBlocks({ weekNo }: Props) {
  const phase = phaseForWeek(weekNo);
  const week = getC25kWeek(weekNo);
  const runDur =
    week.soloA.durationMin != null && week.group.durationMin != null
      ? `~${Math.min(week.soloA.durationMin, week.group.durationMin)}–${Math.max(week.soloA.durationMin, week.group.durationMin)} min`
      : "~20–35 min";
  const strengthSub = week.isTaper
    ? "Mobility only this week — see strength reference (taper)."
    : "See strength reference below — follow the phase that matches your week.";

  const steps = [
    { icon: "🤸", title: "Warm-up", sub: "Dynamic drills + easy walk", dur: "~5 min", active: false },
    {
      icon: "🏃‍♀️",
      title: "Run block",
      sub: `Solo A: ${week.soloA.runBlock} · Group: ${week.group.runBlock}`,
      dur: runDur,
      active: true,
    },
    { icon: "💪", title: "Strength block", sub: strengthSub, dur: week.isTaper ? "~10 min" : "~8 min", active: false },
    { icon: "🧘‍♀️", title: "Cool-down", sub: "Walk + light stretch", dur: "~5 min", active: false },
  ] as const;

  return (
    <section className="rounded-card border border-paper-deep bg-white p-4 sm:p-6" data-testid="c25k-session-blocks">
      <span className="inline-flex rounded-full bg-magenta/15 px-3 py-1 text-[11px] font-extrabold text-magenta">
        Week {weekNo} · {phase.title}
      </span>
      <h2 className="font-display mt-3 text-2xl uppercase text-ink">Session structure</h2>
      <p className="mt-1 text-xs text-ink/55">Warm-up → main set → strength → cool-down — same flow for Solo A, Solo B, and Sunday group.</p>

      <div className="mt-4 divide-y divide-paper-deep rounded-card border border-paper-deep bg-paper/40 px-3 py-1 sm:px-4">
        {steps.map((row) => (
          <div key={row.title} className="flex items-center gap-3 py-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${
                row.active ? "bg-energy text-white shadow-md" : "bg-paper-deep text-ink/80"
              }`}
              aria-hidden
            >
              {row.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-ink">{row.title}</p>
              <p className="text-[11.5px] text-ink/55">{row.sub}</p>
            </div>
            <p className="shrink-0 font-display text-xs text-violet">{row.dur}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-card border border-dashed border-violet/30 bg-gradient-to-br from-violet/5 to-magenta/5 px-4 py-4">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-magenta">The talk test</p>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-ink">
          If you can&apos;t speak a full sentence while running, ease off. In this program there&apos;s no such thing
          as too slow.
        </p>
      </div>

      <p className="mt-4 text-center text-[11px] font-semibold text-ink/45">
        Session timers / audio player can ship in a follow-up — this page reflects the product narrative from the
        design board.
      </p>
    </section>
  );
}
