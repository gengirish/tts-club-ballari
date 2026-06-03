import Link from "next/link";

type Props = {
  weekNo: number;
  maxWeeks: number;
  isEnrolled: boolean;
};

export function C25kSafetyAndGraduation({ weekNo, maxWeeks, isEnrolled }: Props) {
  const weeksLeft = Math.max(0, maxWeeks - weekNo);
  const showCountdown = isEnrolled && weekNo >= 9;

  return (
    <div className="space-y-6">
      {showCountdown && (
        <section className="overflow-hidden rounded-card bg-magenta text-white shadow-lg shadow-magenta/30">
          <div className="bg-energy px-5 py-6 text-center sm:px-8">
            <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide">
              Graduation
            </span>
            <h2 className="font-display mt-3 text-3xl uppercase leading-tight">SSS 5K run</h2>
            <p className="mt-2 text-sm text-white/90">{maxWeeks} weeks · one finish line.</p>
            <p className="font-display mt-4 text-4xl text-white">{weeksLeft === 0 ? "Race week" : `${weeksLeft} wk left`}</p>
          </div>
        </section>
      )}

      <section className="rounded-card border border-paper-deep bg-white p-4 sm:p-6">
        <h2 className="font-display text-xl uppercase text-violet">Run safe</h2>
        <p className="mt-1 text-xs text-ink/55">Monsoon-aware habits for Ballari — ties into SOS in the app.</p>

        <div className="mt-4 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <span className="text-xl" aria-hidden>
            🛑
          </span>
          <div>
            <p className="text-sm font-extrabold text-ink">Stop immediately if you feel…</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-ink/65">
              Sharp or worsening joint pain · chest tightness or trouble breathing · dizziness. When in doubt, stop —
              there is always another session.
            </p>
          </div>
        </div>

        <div className="mt-3 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <span className="text-xl" aria-hidden>
            🌧️
          </span>
          <div>
            <p className="text-sm font-extrabold text-ink">Monsoon advisory · Jun–Aug</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-ink/65">
              Prefer early morning before heat builds; treadmill counts on heavy rain. Watch for slippery paths —
              sprains spike in wet season.
            </p>
          </div>
        </div>

        <h3 className="mt-6 text-sm font-extrabold uppercase tracking-wide text-ink/70">
          Solo-run safety <span className="font-sans text-xs font-semibold normal-case text-ink/45">· Tue &amp; Thu</span>
        </h3>
        <ul className="mt-2 space-y-2 text-sm text-ink/80">
          {[
            "Share live location with a trusted contact for the whole run.",
            "Keep one earbud out on shared paths.",
            "Stick to familiar, well-lit routes.",
            "Tell family your route and return time.",
          ].map((line) => (
            <li key={line} className="flex gap-2">
              <span className="font-extrabold text-magenta" aria-hidden>
                ›
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/app/community"
          className="mt-5 flex min-h-[48px] w-full items-center justify-center rounded-full bg-rose-600 px-4 text-center text-sm font-extrabold text-white shadow-md transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
        >
          SOS · open community &amp; safety hub
        </Link>
      </section>
    </div>
  );
}
