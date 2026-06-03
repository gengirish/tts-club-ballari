type Props = { weekNo: number };

const RACE_TIMELINE = [
  { when: "60 min before", body: "Light familiar breakfast — nothing new on race day. Hydrate early." },
  { when: "30 min before", body: "Arrive at the venue. Easy walk. Pin on bib. Stay calm and social." },
  { when: "15 min before", body: "5-minute easy jog + dynamic drills: leg swings, hip circles, arm circles." },
  { when: "Start line", body: "Line up mid-to-back. Adrenaline will want you to go fast — don’t listen to it." },
  { when: "First km", body: "Run slower than feels right — the opening kilometre lies to everyone." },
  { when: "Middle", body: "Settle into your training pace — the one your body already knows from Sundays." },
  { when: "Final push", body: "If there is anything left in the tank, use it only in the last few hundred metres." },
  { when: "Finish", body: "You did it. The only bad 5K is the one you talked yourself out of — finishing is the win." },
] as const;

/** Graduation / community 5K checklist — generic guidance, not a medical promise. */
export function C25kRacePack({ weekNo }: Props) {
  if (weekNo < 10) return null;

  return (
    <section
      className="rounded-card border border-magenta/30 bg-gradient-to-br from-magenta/5 to-violet/10 p-4 sm:p-6"
      data-testid="c25k-race-pack"
    >
      <span className="inline-flex rounded-full bg-magenta/15 px-3 py-1 text-[11px] font-extrabold text-magenta">
        Race week playbook
      </span>
      <h2 className="font-display mt-3 text-xl uppercase text-ink">Before the SSS 5K</h2>
      <p className="mt-1 text-xs text-ink/55">
        Use this as a calm script for graduation week. Your coach may share venue-specific times in the group chat.
      </p>
      <ol className="mt-4 space-y-3">
        {RACE_TIMELINE.map((row, i) => (
          <li key={i} className="flex gap-3 rounded-xl border border-paper-deep bg-paper-raised/92 p-3 sm:p-4">
            <span className="shrink-0 font-display text-[11px] font-extrabold uppercase tracking-wide text-violet">
              {row.when}
            </span>
            <p className="text-sm leading-relaxed text-ink/80">{row.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
