# C25K parallel build (BR WI C25K 2026 PDF → SSS Club)

This document describes a **multi-agent parallel build workflow** for folding the **BR WI Couch to 5K 2026** programme PDF into the SSS Club product without breaking the live C25K experience. Agents can own waves in parallel once dependencies are clear.

## Source artefact

- **Input**: BR WI C25K 2026 PDF (club programme copy: week themes, cutbacks, taper, milestones, optional race-pack notes).
- **Output**: Typed week data in-repo, curriculum selectors that read it, UI that reflects real copy, then (later) reminders/events aligned to that copy.

## Dependency graph (high level)

```text
Wave 1 (weeks-data + this doc)
    ↓
Wave 2 (curriculum wires selectors, keeps phase/timeline helpers)
    ↓
Wave 3 (C25K TSX consumes selectors, richer week stack)
    ↓
Wave 4 (BullMQ / events — optional future)
```

---

## Wave 1 — Data layer + contract

**Goal**: Establish a **single source of truth per week** derived from the PDF, separate from presentation helpers.

| Deliverable | Path / role |
|-------------|-------------|
| Week-level programme data (themes, flags, Sunday copy hints, optional race-pack fields) | `src/lib/programs/c25k-weeks-data.ts` |
| Parallel-build contract & handoff notes | `docs/C25K_PARALLEL_BUILD.md` *(this file)* |

**Existing context** (do not duplicate logic here; Wave 2 imports from weeks-data):

- Current static curriculum and session card factory: `src/lib/programs/c25k-curriculum.ts`
- C25K route shell: `src/app/app/programs/couch-to-5k/page.tsx`

**Wave 1 agent notes**

- Prefer **one exported type** for a week record (e.g. week number, theme title, `cutback` / `taper` booleans, `milestone` level or star count, optional `racePack` blurb).
- Keep PDF-specific quirks **data-only**; no JSX in `c25k-weeks-data.ts`.

---

## Wave 2 — Curriculum module as façade

**Goal**: `c25k-curriculum.ts` **wires selectors** that read `c25k-weeks-data.ts` and re-export or thin-wrap so the rest of the app keeps stable imports from `@/lib/programs/c25k-curriculum`.

**Target module**: `src/lib/programs/c25k-curriculum.ts`

**Selectors to introduce or align** (names may vary; keep one obvious entry point per concern):

- `getC25kWeek(weekNo)` — returns the typed week row from weeks-data (clamp or throw policy should match `clampWeek` behaviour).
- `sessionCardsForWeekFromData(weekNo)` **or** evolve existing `sessionCardsForWeek` to delegate to weeks-data while preserving the return shape TSX expects.

**Must keep working** (already defined in `c25k-curriculum.ts`; regression-sensitive):

- `phaseForWeek`
- `C25K_PHASES`
- `STRENGTH_PHASES` (and helpers such as `defaultStrengthTabForWeek` if still used)
- `clampWeek`
- `progressThroughProgram`
- `phaseTimelineState`

**Consumers today** (update only if signatures change — prefer not to):

- `src/app/app/programs/couch-to-5k/c25k-week-stack.tsx` — imports `phaseForWeek`, `sessionCardsForWeek`
- `src/app/app/programs/couch-to-5k/c25k-session-blocks.tsx` — imports `phaseForWeek`
- `src/app/app/programs/couch-to-5k/c25k-hero-and-overview.tsx` — imports `clampWeek`, `phaseTimelineState`, `progressThroughProgram`
- `src/app/app/programs/couch-to-5k/c25k-strength-reference.tsx` — imports `STRENGTH_PHASES`, `defaultStrengthTabForWeek`
- `src/app/app/programs/couch-to-5k/page.tsx` — imports `clampWeek`

---

## Wave 3 — App Router TSX

**Goal**: Components under `src/app/app/programs/couch-to-5k/` consume the **new selectors** so the **week stack** shows **real theme** from data, **cutback / taper badges**, **milestone stars**, and an **optional race pack** section when data provides it.

**Primary files**

| File | Role |
|------|------|
| `src/app/app/programs/couch-to-5k/page.tsx` | Composes sections; passes `weekNo` / clamped week into children |
| `src/app/app/programs/couch-to-5k/c25k-week-stack.tsx` | Week stack UI — main target for theme, badges, stars |
| `src/app/app/programs/couch-to-5k/c25k-hero-and-overview.tsx` | Hero + timeline — ensure copy still matches phased narrative |
| `src/app/app/programs/couch-to-5k/c25k-session-blocks.tsx` | Session blocks — align with week data where PDF specifies session flavour |
| `src/app/app/programs/couch-to-5k/c25k-strength-reference.tsx` | Strength tabs — unchanged unless PDF forces copy tweaks |
| `src/app/app/programs/couch-to-5k/c25k-pay-section.tsx` | Purchase / enrolled UI |
| `src/app/app/programs/couch-to-5k/c25k-safety-and-graduation.tsx` | Safety + graduation copy |

**API / commerce** (touch only if product copy or week count affects checkout):

- `src/app/api/programs/couch-to-5k/order/route.ts`
- `src/lib/validation/program.ts` (`c25kOrderBodySchema`, `c25kAssessmentSchema`)

**E2E** (extend when UI assertions need new copy or testids):

- `e2e/authenticated/member.spec.ts` (C25K navigation and page load)

---

## Wave 4 (future) — Reminders & Sunday events

**Goal**: **BullMQ** reminder bodies (or template variables) **per week** using flags from weeks-data; **events link** for Sunday group runs where the product exposes an external calendar or club event URL.

**Existing hooks**

- `src/server/programs/schedule-c25k-reminders.ts` — schedules delayed `c25k_session` jobs (currently 12 weekly delays)
- `src/queue/queues.ts` — job payload type includes `{ kind: "c25k_session"; enrollmentId: string }`
- `src/queue/worker.ts` — handles `c25k_session`, uses `AisensyTemplates.c25kSession`
- `src/integrations/aisensy/templates.ts` — WhatsApp template wiring for C25K session pings

Wave 4 should read **week metadata** (from `c25k-weeks-data.ts` via a small server-safe import or duplicated minimal DTO) so week 6 cutback vs week 12 taper messaging differs in automation.

---

## Parallel execution tips

1. **Lock order**: Wave 1 merges before Wave 2 refactors `c25k-curriculum.ts` imports.
2. **Interface freeze**: Agree on the `WeekRecord` (or equivalent) shape in Wave 1 before Wave 3 adds UI fields.
3. **Wave 3 vs Wave 2**: Wave 3 can stub UI behind feature flags only if necessary; preferred path is Wave 2 exposing stable selectors first.
4. **Docs**: Update this file when week count, phase boundaries, or reminder strategy changes.

---

## Definition of done

Use this checklist before calling the BR WI C25K 2026 integration **complete** for a given release slice.

### Wave 1 — Data

- [ ] `src/lib/programs/c25k-weeks-data.ts` exists and exports a typed structure covering **every programme week** in the PDF (no placeholder weeks in production paths).
- [ ] Week records include fields needed for UI: **theme title**, **cutback**, **taper**, **milestone** / star semantics, and **optional race-pack** text where applicable.
- [ ] `docs/C25K_PARALLEL_BUILD.md` reflects the final module names and any renamed selectors.

### Wave 2 — Curriculum façade

- [ ] `src/lib/programs/c25k-curriculum.ts` imports from `c25k-weeks-data.ts` and exposes `getC25kWeek` (or agreed equivalent) plus session card derivation **from data**.
- [ ] `phaseForWeek`, `C25K_PHASES`, `STRENGTH_PHASES`, `clampWeek`, `progressThroughProgram`, and `phaseTimelineState` behave as before for the same `weekNo` inputs (add unit tests if the team uses them for this module).
- [ ] All existing imports from `@/lib/programs/c25k-curriculum` in C25K TSX compile without broken types.

### Wave 3 — UI

- [ ] `c25k-week-stack.tsx` shows **PDF-aligned theme**, **cutback/taper badges**, and **milestone stars** driven by data, not hard-coded week switches scattered in TSX.
- [ ] Optional **race pack** section renders when data is present and is omitted (no empty shell) when absent.
- [ ] `page.tsx` and related sections still render for weeks 1…N with **no runtime errors** on clamp boundaries.

### Wave 4 — Automation (when in scope)

- [ ] Reminder copy or template variables differ by week where the PDF calls for it (e.g. cutback, taper).
- [ ] Sunday **events link** (or deep link) is wired where product spec requires it.
- [ ] `schedule-c25k-reminders.ts` and worker paths remain idempotent and safe for re-enrollment.

### Quality bar

- [ ] E2E: C25K page still reachable and stable (`e2e/authenticated/member.spec.ts` or successor specs green).
- [ ] No secrets or full PDF blobs committed in place of curated data unless explicitly approved.

---

## File index (quick reference)

| Path | Note |
|------|------|
| `docs/C25K_PARALLEL_BUILD.md` | This workflow |
| `src/lib/programs/c25k-weeks-data.ts` | Week source of truth (12 rows: solo A/B, group, flags, coach copy) |
| `src/lib/programs/c25k-curriculum.ts` | Phases, clamp, timeline, `getC25kWeek`, `sessionCardsForWeek` (reads weeks-data) |
| `src/app/app/programs/couch-to-5k/c25k-race-pack.tsx` | Race-week playbook (week ≥ 10) |
| `src/app/app/programs/couch-to-5k/*.tsx` | C25K UI surface |
| `src/server/programs/schedule-c25k-reminders.ts` | Weekly delayed jobs |
| `src/queue/worker.ts` | Job handler |
| `src/integrations/aisensy/templates.ts` | External messaging templates |

---

## Execution status (orchestrated multi-agent + main agent)

**2026-06-03**

- **Wave 1 (parallel subagents):** `c25k-weeks-data.ts` created; this workflow doc created.
- **Wave 2–3 (main agent, same session):** `c25k-curriculum.ts` imports `C25K_WEEKS`, exports `getC25kWeek`, `sessionCardsForWeek` backed by data; `c25k-week-stack.tsx`, `c25k-session-blocks.tsx`, `c25k-safety-and-graduation.tsx`, `c25k-race-pack.tsx`, `page.tsx` updated. `npm run build` passing.
- **Wave 4:** Not started (BullMQ copy per week / Sunday events link).

**Note:** If the PDF is absent from a clone, align interval lines in `c25k-weeks-data.ts` against `docs/DOC-20260511-WA0002..pdf` when available.
