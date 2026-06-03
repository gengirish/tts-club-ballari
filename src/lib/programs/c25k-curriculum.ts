/** Static curriculum copy aligned with `sss-couch-to-5k-design.html` (design reference, not a legal promise). */

import { C25K_WEEKS, type C25kWeek, type C25kWeekSession } from "./c25k-weeks-data";

export type { C25kWeek, C25kWeekSession, C25kMilestone, C25kSessionTag } from "./c25k-weeks-data";
export { C25K_WEEKS } from "./c25k-weeks-data";

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

const MAX_CURRICULUM_WEEKS = 12;

/** Per-week plan from `c25k-weeks-data` (solo A / solo B / Sunday group). */
export function getC25kWeek(weekNo: number): C25kWeek {
  const w = Math.min(Math.max(Math.floor(weekNo), 1), MAX_CURRICULUM_WEEKS);
  return C25K_WEEKS[w - 1]!;
}

function sessionMetaLine(s: C25kWeekSession): string {
  const parts: string[] = [];
  if (s.durationMin != null) parts.push(`~${s.durationMin} min`);
  if (s.focus) parts.push(s.focus);
  return parts.length > 0 ? parts.join(" · ") : "Easy conversational effort · walk breaks as prescribed";
}

export type C25kSessionCard = {
  tag: string;
  pill: string;
  pillClass: string;
  title: string;
  meta: string;
  highlight?: boolean;
};

/** Three session slots per week — driven by week table + design pills. */
export function sessionCardsForWeek(weekNo: number): C25kSessionCard[] {
  const week = getC25kWeek(weekNo);
  return [
    {
      tag: "Solo A",
      pill: "Mon / Wed",
      pillClass: "bg-violet/10 text-violet",
      title: week.soloA.runBlock,
      meta: sessionMetaLine(week.soloA),
      highlight: false,
    },
    {
      tag: "Solo B",
      pill: "Tue / Thu",
      pillClass: "bg-violet/10 text-violet",
      title: week.soloB.runBlock,
      meta: sessionMetaLine(week.soloB),
      highlight: false,
    },
    {
      tag: "Sunday · group",
      pill: "Coach-led",
      pillClass: "bg-magenta/15 text-magenta",
      title: week.group.runBlock,
      meta: sessionMetaLine(week.group),
      highlight: true,
    },
  ];
}

/** Matches exercise reference in `docs/DOC-20260511-WA0002..pdf` (bodyweight, phase bands). */
export const STRENGTH_PHASES = [
  {
    id: "p1" as const,
    label: "P1 · Glute & ankle",
    weeks: "Weeks 1–3",
    exercises: [
      { name: "Glute bridge", cue: "Drive through heels; squeeze at top; lower back neutral — not arched.", reps: "2×12" },
      { name: "Clamshell", cue: "Pelvis still — if the hip rocks back, reduce range.", reps: "2×12/side" },
      { name: "Standing calf raise", cue: "2s up, 2s down; slow lowers build tendon resilience.", reps: "2×15" },
      { name: "Single-leg balance", cue: "Gaze on a fixed point; wobbling is normal.", reps: "1×30s/leg" },
    ],
  },
  {
    id: "p2" as const,
    label: "P2 · Core & hips",
    weeks: "Weeks 4–6",
    exercises: [
      { name: "Dead bug", cue: "Low back glued to floor; slow, full control.", reps: "2×6/side" },
      { name: "Bird dog", cue: "Opposite arm and leg; hips level — no rotation.", reps: "2×8/side" },
      { name: "Donkey kick", cue: "Heel to ceiling; squeeze glute at top; no lower-back arch.", reps: "2×12/side" },
      { name: "Hip flexor stretch", cue: "Low lunge, back knee down; tuck pelvis gently.", reps: "1×45s/side" },
    ],
  },
  {
    id: "p3" as const,
    label: "P3 · Lower body & core",
    weeks: "Weeks 7–11",
    exercises: [
      { name: "Bodyweight squat", cue: "Knees track over toes; sit back and down.", reps: "2×12" },
      { name: "Reverse lunge", cue: "Step back; front shin stays vertical.", reps: "2×8/side" },
      { name: "Side plank hold", cue: "Stack or stagger feet; lift hip — do not sag.", reps: "2×20s/side" },
      { name: "Hip circle", cue: "Hands on hips; large slow circles each way.", reps: "1×10 each" },
      { name: "Inchworm", cue: "Walk to plank, walk feet in; slow and controlled.", reps: "1×5" },
    ],
  },
  {
    id: "taper" as const,
    label: "Taper · Mobility only",
    weeks: "Week 12",
    exercises: [
      { name: "Hip flexor stretch", cue: "Hold gently — no pushing.", reps: "1×45s/side" },
      { name: "Hip circle", cue: "Slow, full range.", reps: "1×10 each" },
      { name: "Inchworm", cue: "Gentle — the hard work is already banked.", reps: "1×5" },
    ],
  },
];

export function defaultStrengthTabForWeek(weekNo: number): "p1" | "p2" | "p3" | "taper" {
  if (weekNo >= 12) return "taper";
  if (weekNo >= 7) return "p3";
  if (weekNo >= 4) return "p2";
  return "p1";
}
