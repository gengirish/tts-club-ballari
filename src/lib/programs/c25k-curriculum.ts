/** Static curriculum copy aligned with `sss-couch-to-5k-design.html` (design reference, not a legal promise). */

export type C25kPhase = {
  weekStart: number;
  weekEnd: number;
  label: string;
  title: string;
  detail: string;
};

export const C25K_PHASES: readonly C25kPhase[] = [
  {
    weekStart: 1,
    weekEnd: 3,
    label: "Weeks 1–3",
    title: "Foundation",
    detail: "Run/walk intervals · first short continuous runs",
  },
  {
    weekStart: 4,
    weekEnd: 6,
    label: "Weeks 4–6",
    title: "Building blocks",
    detail: "Longer run blocks · week 6 cutback",
  },
  {
    weekStart: 7,
    weekEnd: 9,
    label: "Weeks 7–9",
    title: "Running emerges",
    detail: "25–35 min continuous focus",
  },
  {
    weekStart: 10,
    weekEnd: 11,
    label: "Weeks 10–11",
    title: "5K ready",
    detail: "Parkrun-style effort · longer easy run",
  },
  {
    weekStart: 12,
    weekEnd: 12,
    label: "Week 12",
    title: "Taper",
    detail: "Legs rest · trust the work you’ve banked",
  },
] as const;

export function clampWeek(weekNo: number, maxWeeks: number): number {
  return Math.min(Math.max(weekNo, 1), maxWeeks);
}

export function progressThroughProgram(weekNo: number, maxWeeks: number): number {
  const w = clampWeek(weekNo, maxWeeks);
  return Math.min(100, Math.round((w / maxWeeks) * 100));
}

export function phaseForWeek(weekNo: number): C25kPhase {
  const w = Math.max(1, weekNo);
  for (const p of C25K_PHASES) {
    if (w >= p.weekStart && w <= p.weekEnd) return p;
  }
  return C25K_PHASES[C25K_PHASES.length - 1]!;
}

export function phaseTimelineState(
  weekNo: number
): { phase: C25kPhase; index: number; status: "done" | "current" | "upcoming" }[] {
  return C25K_PHASES.map((phase, index) => {
    let status: "done" | "current" | "upcoming" = "upcoming";
    if (weekNo > phase.weekEnd) status = "done";
    else if (weekNo >= phase.weekStart && weekNo <= phase.weekEnd) status = "current";
    return { phase, index, status };
  });
}

/** Three session slots per week — copy tone from design; not personalised to GPS. */
export function sessionCardsForWeek(weekNo: number): {
  tag: string;
  pill: string;
  pillClass: string;
  title: string;
  meta: string;
  highlight?: boolean;
}[] {
  const w = Math.max(1, weekNo);
  const phase = phaseForWeek(w);
  return [
    {
      tag: "Solo A",
      pill: "Mon / Wed",
      pillClass: "bg-violet/10 text-violet",
      title: `Intervals — ${phase.title.toLowerCase()} focus`,
      meta: "~20–25 min · easy effort, walk breaks as needed",
    },
    {
      tag: "Solo B",
      pill: "Tue / Thu",
      pillClass: "bg-violet/10 text-violet",
      title: "Progressive run blocks",
      meta: "~20–28 min · slightly longer run segments than Solo A",
      highlight: false,
    },
    {
      tag: "Sunday · group",
      pill: "Milestone",
      pillClass: "bg-magenta/15 text-magenta",
      title: "Coach-led group session",
      meta: "~28–35 min · conversational pace · celebrate the week",
      highlight: true,
    },
  ];
}

export const STRENGTH_PHASES = [
  {
    id: "p1" as const,
    label: "P1 · Glute",
    weeks: "Weeks 1–3",
    exercises: [
      { name: "Glute bridge", cue: "Squeeze at the top, ribs down — no arching.", reps: "3×12" },
      { name: "Clamshell", cue: "Heels stacked; lift the top knee only.", reps: "2×15/side" },
      { name: "Side plank (knee down)", cue: "Hip stacked; breathe steady.", reps: "2×20s/side" },
    ],
  },
  {
    id: "p2" as const,
    label: "P2 · Core",
    weeks: "Weeks 4–6",
    exercises: [
      { name: "Dead bug", cue: "Lower back pressed to the floor; slow limbs.", reps: "2×6/side" },
      { name: "Bird dog", cue: "Hips level — no rotation as you reach.", reps: "2×8/side" },
      { name: "Hip flexor stretch", cue: "Low lunge, tuck pelvis gently.", reps: "1×45s/side" },
    ],
  },
  {
    id: "p3" as const,
    label: "P3 · Power",
    weeks: "Weeks 7–9",
    exercises: [
      { name: "Squat to calf raise", cue: "Controlled down; tall through the crown.", reps: "3×10" },
      { name: "Split squat", cue: "Front knee tracks over ankle.", reps: "2×8/side" },
      { name: "Jump rope or pogo hops", cue: "Soft knees; stop if joints complain.", reps: "3×30s" },
    ],
  },
  {
    id: "taper" as const,
    label: "Taper",
    weeks: "Week 12",
    exercises: [
      { name: "Easy mobility flow", cue: "Hips, calves, thoracic spine — keep it light.", reps: "10 min" },
      { name: "Strides (optional)", cue: "4–6 × 15s smooth, full recovery walk.", reps: "Optional" },
    ],
  },
];

export function defaultStrengthTabForWeek(weekNo: number): "p1" | "p2" | "p3" | "taper" {
  if (weekNo >= 12) return "taper";
  if (weekNo >= 7) return "p3";
  if (weekNo >= 4) return "p2";
  return "p1";
}
