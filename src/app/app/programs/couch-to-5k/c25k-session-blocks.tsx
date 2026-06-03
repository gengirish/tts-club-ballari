import { phaseForWeek } from "@/lib/programs/c25k-curriculum";

const STEPS = [
  { icon: "🤸", title: "Warm-up", sub: "Dynamic drills + easy walk", dur: "~5 min" },
  { icon: "🏃‍♀️", title: "Run block", sub: "Intervals from your week plan — stay easy", dur: "~20–30 min", active: true },
  { icon: "💪", title: "Strength block", sub: "See strength reference below — mobility first", dur: "~8 min" },
  { icon: "🧘‍♀️", title: "Cool-down", sub: "Walk + light stretch", dur: "~5 min" },
] as const;

type Props = { weekNo: number };

export function C25kSessionBlocks({ weekNo }: Props) {
  const phase = phaseForWeek(weekNo);
  return (
    <section className="rounded-card border border-paper-deep bg-white p-4 sm:p-6" data-testid="c25k-session-blocks">
      <span className="inline-flex rounded-full bg-magenta/15 px-3 py-1 text-[11px] font-extrabold text-magenta">
        Week {weekNo} · {phase.title}
      </span>
      <h2 className="font-display mt-3 text-2xl uppercase text-ink">Session structure</h2>
      <p className="mt-1 text-xs text-ink/55">Warm-up → main set → strength → cool-down (design reference).</p>

      <div className="mt-4 divide-y divide-paper-deep rounded-card border border-paper-deep bg-paper/40 px-3 py-1 sm:px-4">
        {STEPS.map((row) => (
          <div key={row.title} className="flex items-center gap-3 py-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${
                "active" in row && row.active ? "bg-energy text-white shadow-md" : "bg-paper-deep text-ink/80"
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
