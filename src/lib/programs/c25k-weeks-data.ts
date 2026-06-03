/**
 * 12-week Couch to 5K — solo A, solo B, Sunday group.
 * Run prescriptions are taken from `docs/DOC-20260511-WA0002..pdf` (12-week table;
 * programme philosophy: conversational pace, finish-line focus, no clock pressure).
 * Copy is adapted for Steel Sisters & Striders (no third-party club names in member strings).
 */

export type C25kSessionTag = "soloA" | "soloB" | "group";

export type C25kWeekSession = {
  tag: C25kSessionTag;
  runBlock: string;
  durationMin?: number;
  focus?: string;
};

export type C25kMilestone = "none" | "star" | "double";

export type C25kWeek = {
  weekNo: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  phaseTitle: string;
  weekTheme: string;
  isCutback: boolean;
  isTaper: boolean;
  milestone: C25kMilestone;
  soloA: C25kWeekSession;
  soloB: C25kWeekSession;
  group: C25kWeekSession;
  coachFocus: string;
  debriefPrompt?: string;
};

export const C25K_WEEKS: readonly C25kWeek[] = [
  {
    weekNo: 1,
    phaseTitle: "Foundation",
    weekTheme: "Just show up — learn the run/walk rhythm",
    isCutback: false,
    isTaper: false,
    milestone: "none",
    soloA: {
      tag: "soloA",
      runBlock: "6 × (1 min run / 2 min walk)",
      durationMin: 18,
      focus: "Generous walk recovery · complete every interval at a comfortable pace",
    },
    soloB: {
      tag: "soloB",
      runBlock: "8 × (1 min run / 90 sec walk)",
      durationMin: 20,
      focus: "More intervals, shorter recovery than Solo A — same easy effort",
    },
    group: {
      tag: "group",
      runBlock: "6 × (90 sec run / 2 min walk)",
      durationMin: 21,
      focus: "Coach calls intervals · try “match my pace” on one rep for fun",
    },
    coachFocus: "First week together — get everyone comfortable with run/walk. Nobody gets dropped.",
    debriefPrompt: "What felt new today — legs, breathing, or running with the group?",
  },
  {
    weekNo: 2,
    phaseTitle: "Foundation",
    weekTheme: "Ninety-second and two-minute pieces — stay conversational",
    isCutback: false,
    isTaper: false,
    milestone: "none",
    soloA: {
      tag: "soloA",
      runBlock: "6 × (90 sec run / 2 min walk)",
      durationMin: 21,
      focus: "Intervals step up to 90 seconds — same talk-test pace as week 1",
    },
    soloB: {
      tag: "soloB",
      runBlock: "5 × (2 min run / 2 min walk)",
      durationMin: 20,
      focus: "First 2-minute runs · equal run/walk — simple to pace",
    },
    group: {
      tag: "group",
      runBlock: "Ladder ×2 — each ladder: 1′/1′ + 90s/90s + 2′/2′ + 90s/90s",
      durationMin: 24,
      focus: "Repeat the same ladder twice · coach calls every change",
    },
    coachFocus: "Note who finds the intervals hard — keep an eye on them through Phase 1.",
    debriefPrompt: "What felt different from Solo Session A?",
  },
  {
    weekNo: 3,
    phaseTitle: "Foundation",
    weekTheme: "First 3-minute blocks — Sunday mirror ladder",
    isCutback: false,
    isTaper: false,
    milestone: "none",
    soloA: {
      tag: "soloA",
      runBlock: "6 × (2 min run / 3 min walk)",
      durationMin: 24,
      focus: "Longer walk between intervals is intentional — use it fully",
    },
    soloB: {
      tag: "soloB",
      runBlock: "5 × (3 min run / 2 min walk)",
      durationMin: 25,
      focus: "Recovery shorter than the run — trust an easy pace",
    },
    group: {
      tag: "group",
      runBlock: "Full ladder: 1/1 + 90s/90s + 2/2 + 3/3 + 3/3 + 2/2 + 90s/90s + 1/1",
      durationMin: 30,
      focus: "Peak at 3 minutes then mirror down — longest group session so far",
    },
    coachFocus: "Phase 1 complete — celebrate as a group before Phase 2.",
    debriefPrompt: "How did the 3-minute blocks feel at the top of the ladder?",
  },
  {
    weekNo: 4,
    phaseTitle: "Building blocks",
    weekTheme: "Run more, walk less — first 4-minute blocks",
    isCutback: false,
    isTaper: false,
    milestone: "none",
    soloA: {
      tag: "soloA",
      runBlock: "6 × (3 min run / 1 min walk)",
      durationMin: 24,
      focus: "Short 1-minute walk — keep effort easy so you finish all six",
    },
    soloB: {
      tag: "soloB",
      runBlock: "4 × (4 min run / 2 min walk)",
      durationMin: 24,
      focus: "First 4-minute blocks · fewer reps, longer runs",
    },
    group: {
      tag: "group",
      runBlock: "2 × (3′/90s walk + 5′/2′ walk + 3′) + 60 sec standing rest between sets",
      durationMin: 30,
      focus: "Use the full 60s between sets · match Set 2 effort to Set 1",
    },
    coachFocus: "Introduce Phase 2 strength exercises after the run today.",
  },
  {
    weekNo: 5,
    phaseTitle: "Building blocks",
    weekTheme: "Three × 5′ and first 8′ blocks — Sunday: first 10′ continuous",
    isCutback: false,
    isTaper: false,
    milestone: "star",
    soloA: {
      tag: "soloA",
      runBlock: "5′ run / 3′ walk / 5′ run / 3′ walk / 5′ run",
      durationMin: 21,
      focus: "Three equal 5-minute blocks · same easy effort each time",
    },
    soloB: {
      tag: "soloB",
      runBlock: "8′ run / 5′ walk / 8′ run",
      durationMin: 21,
      focus: "First 8-minute pieces · generous walk between the two blocks",
    },
    group: {
      tag: "group",
      runBlock: "8′ / 2′ walk / 10′ / 2′ walk / 8′",
      durationMin: 30,
      focus: "Milestone ★ — turnaround at 5′ in the 10′ block to keep pace honest",
    },
    coachFocus:
      "First 10-minute continuous block on Sunday — place a 5′ marker and turn back. Celebrate loudly.",
    debriefPrompt: "Where in the 10′ block did pace feel steadiest?",
  },
  {
    weekNo: 6,
    phaseTitle: "Building blocks",
    weekTheme: "Cutback — absorb five weeks of training",
    isCutback: true,
    isTaper: false,
    milestone: "none",
    soloA: {
      tag: "soloA",
      runBlock: "CUTBACK · 5′/2′/5′/2′/5′ run (15′ running)",
      durationMin: 19,
      focus: "Deliberately lighter than week 5 — effort should feel almost too easy",
    },
    soloB: {
      tag: "soloB",
      runBlock: "CUTBACK · 8′/3′/7′ run (15′ running)",
      durationMin: 18,
      focus: "Short and restorative before Phase 3",
    },
    group: {
      tag: "group",
      runBlock: "CUTBACK · 20 min easy continuous",
      durationMin: 20,
      focus: "No new challenge — easy chatty loop",
    },
    coachFocus: "Recovery week — legs absorb load. Phase 3 starts next week.",
    debriefPrompt: "How do legs feel compared to week 5?",
  },
  {
    weekNo: 7,
    phaseTitle: "Running emerges",
    weekTheme: "You’re a runner now — longer blocks, short reset walks",
    isCutback: false,
    isTaper: false,
    milestone: "none",
    soloA: {
      tag: "soloA",
      runBlock: "15′ run / 2′ walk / 8′ run",
      durationMin: 25,
      focus: "Use the 2′ walk as a real reset before the final 8′",
    },
    soloB: {
      tag: "soloB",
      runBlock: "18′ run / 2′ walk / 5′ run",
      durationMin: 25,
      focus: "Bulk of work in the opening 18′ — even effort throughout",
    },
    group: {
      tag: "group",
      runBlock: "22′ run / 2′ walk / 6′ with a gentle effort lift",
      durationMin: 30,
      focus: "Effort lift = slightly more engagement, not a sprint",
    },
    coachFocus: "Introduce Phase 3 strength (squat, lunge, plank, circles, inchworm) after the run.",
  },
  {
    weekNo: 8,
    phaseTitle: "Running emerges",
    weekTheme: "First 25′ continuous — Sunday 30′ with pace awareness",
    isCutback: false,
    isTaper: false,
    milestone: "none",
    soloA: {
      tag: "soloA",
      runBlock: "15′ run / 2′ walk / 10′ run",
      durationMin: 25,
      focus: "Same easy pace after the brief walk reset",
    },
    soloB: {
      tag: "soloB",
      runBlock: "25′ continuous easy",
      durationMin: 25,
      focus: "First 25-minute continuous run — should feel manageable",
    },
    group: {
      tag: "group",
      runBlock: "30′ continuous — second half slightly more engaged than first",
      durationMin: 30,
      focus: "Pace awareness, not a race",
    },
    coachFocus: "Capture each runner’s personal goal for graduation day — revisit in week 11.",
    debriefPrompt: "What’s your one-word goal for finish line day?",
  },
  {
    weekNo: 9,
    phaseTitle: "Running emerges",
    weekTheme: "Longest volume — 35′ continuous Sunday",
    isCutback: false,
    isTaper: false,
    milestone: "star",
    soloA: {
      tag: "soloA",
      runBlock: "20′ run / 2′ walk / 10′ run",
      durationMin: 32,
      focus: "Longest solo yet — challenge is time, not pace",
    },
    soloB: {
      tag: "soloB",
      runBlock: "25′ continuous easy",
      durationMin: 25,
      focus: "Lighter than Solo A — keep legs fresh for Sunday",
    },
    group: {
      tag: "group",
      runBlock: "35′ continuous",
      durationMin: 35,
      focus: "Milestone ★ · water point ~halfway · Phase 3 complete — celebrate before you leave",
    },
    coachFocus: "Longest group run to date — acknowledge everyone clearly at the end.",
    debriefPrompt: "What will you repeat next week for the dress-rehearsal week?",
  },
  {
    weekNo: 10,
    phaseTitle: "5K ready",
    weekTheme: "Own the distance — first GPS awareness + park-style simulation",
    isCutback: false,
    isTaper: false,
    milestone: "none",
    soloA: {
      tag: "soloA",
      runBlock: "30′ run — note distance (watch or app)",
      durationMin: 30,
      focus: "Start measuring km for awareness — not racing the number",
    },
    soloB: {
      tag: "soloB",
      runBlock: "35′ — first 30′ easy, last 5′ gentle pick-up (not a sprint)",
      durationMin: 35,
      focus: "Practice controlled finish",
    },
    group: {
      tag: "group",
      runBlock: "Park-style simulation: ~2.5 km out-and-back + 3–4 strides (80–100 m)",
      durationMin: 45,
      focus: "Coach at turnaround · learn what strides are and why they help",
    },
    coachFocus: "Revisit week 8 personal goals before and after the mock loop.",
    debriefPrompt: "What one ritual from today do you want on graduation morning?",
  },
  {
    weekNo: 11,
    phaseTitle: "5K ready",
    weekTheme: "Peak time-on-feet — then trust the taper",
    isCutback: false,
    isTaper: false,
    milestone: "double",
    soloA: {
      tag: "soloA",
      runBlock: "30′ easy, then 60–90s walk, then 5 × 100 m strides (walk back between)",
      durationMin: 38,
      focus: "Strides are smooth and short — not sprints",
    },
    soloB: {
      tag: "soloB",
      runBlock: "35′ — first 30′ relaxed, last 5′ gentle pick-up",
      durationMin: 35,
      focus: "Same pattern as week 10 Solo B — legs stay fresh",
    },
    group: {
      tag: "group",
      runBlock: "40′ continuous — time on feet, not distance or speed",
      durationMin: 40,
      focus: "Milestone ★★ — longest run of the programme · completing this means you’re ready",
    },
    coachFocus: "If you finish Sunday’s 40′, you’re ready for the graduation 5K — celebrate every runner.",
    debriefPrompt: "Any hotspot to tape, loosen shoes, or adjust before race week?",
  },
  {
    weekNo: 12,
    phaseTitle: "Taper",
    weekTheme: "Trust the training — mobility only, no strength loading",
    isCutback: false,
    isTaper: true,
    milestone: "none",
    soloA: {
      tag: "soloA",
      runBlock: "20–22′ easy — most relaxed run of the plan",
      durationMin: 21,
      focus: "Then mobility only: hip flexor stretch, hip circles, inchworm — freshness, not load",
    },
    soloB: {
      tag: "soloB",
      runBlock: "15′ easy + 90s walk + 5 smooth strides (60–70 m)",
      durationMin: 22,
      focus: "Last training touches before race — legs feel fresh, not worked",
    },
    group: {
      tag: "group",
      runBlock: "No peak group run in the plan — logistics & mobility only if coach schedules a meet",
      focus: "Friday: full rest. Saturday: 10′ gentle walk, kit laid out, early sleep (per taper plan).",
    },
    coachFocus:
      "Race week: nothing new on food or gear · hydrate steadily · Steel Sisters will confirm meet time and bib details in chat.",
    debriefPrompt: "What cue (breath, posture, mantra) will you use in the first kilometre?",
  },
] as const;
