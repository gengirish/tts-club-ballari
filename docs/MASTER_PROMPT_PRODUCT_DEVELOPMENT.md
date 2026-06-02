# Master prompt — complete SSS Club product development (Cursor)

Use this document in **Cursor Agent** or **Composer** with **`@.cursorrules`** and **`@README.md`** (and **`@prisma/schema.prisma`**) attached so the model always sees project law.

**How to run**

1. Open a **new Agent** chat.  
2. Attach: `.cursorrules`, `README.md`, `prisma/schema.prisma`, `tailwind.config.ts`, `src/lib/api-response.ts`, `src/lib/rbac.ts`.  
3. Paste **either** the full block in [§ Master prompt — paste below](#master-prompt--paste-below) **or** one [§ Phase micro-prompt](#phase-micro-prompts-resume-friendly) if you are resuming.  
4. If the session hits limits, open a new chat, re-attach the same files, and paste: *“Continue SSS master plan from Phase N. Read `docs/MASTER_PROMPT_PRODUCT_DEVELOPMENT.md` § Definition of done. Do not regress completed phases.”*

---

## Definition of done (every phase)

- TypeScript **strict**, no `any`.  
- Every API route: **Zod** input validation, **`ApiResponse<T>`** envelope, correct **HTTP status** (422 on validation failure per project convention).  
- **RBAC**: `requireAuth` / `requireRole` / capability scoping from `src/lib/rbac.ts`; never trust client-sent role.  
- **Money** in **paise** (integers); **ratings** in **basis points**; **time** UTC in DB, **IST** + **DD/MM/YYYY** in UI; **phone** E.164 via helpers under `src/lib/utils/*`.  
- **Notifications** (except OTP): enqueue via BullMQ (`src/queue/*`); use or add `src/server/notifications` per `.cursorrules`; **log** sends to `NotificationLog`. OTP may stay direct.  
- **UI**: Server Components by default; `"use client"` only where needed; use **SSS brand tokens** from `tailwind.config.ts`.  
- **Weight / body metrics**: positive framing (e.g. downward weight trend as win where applicable).  
- After changes: **`npm run build`** must pass (fix errors before claiming phase complete).  
- **No TODOs or placeholders** in shipped code (per `.cursorrules`).  

---

## Master prompt — paste below

Copy everything inside the fence (excluding the word `text` line markers for the fence — user copies inner content).

```text
You are the lead engineer for Steel Sisters & Striders (SSS Club Ballari) — a production Next.js 14 App Router app: Prisma + Postgres, Auth.js v5 RBAC, BullMQ workers, AgentMail, AISensy, Razorpay. The repo is a scaffold with core integrations wired; you must IMPLEMENT the full product in ordered phases without violating project rules.

NON-NEGOTIABLES (always enforce)
- Stack and conventions exactly as in @.cursorrules: strict TS, Zod on all API inputs, ApiResponse envelope, paise/basis points/UTC+IST/E.164, Server Components default.
- RBAC: MEMBER < COACH/HOST < ADMIN; use requireRole/requireAuth and capability checks; never trust client role.
- Side-effect notifications (reminders, nudges, C25k alerts, non-OTP email/WhatsApp): enqueue via BullMQ (`src/queue/*`); follow `.cursorrules` (use or add `src/server/notifications` as the enqueue layer if required); log every send to `NotificationLog` in Prisma. OTP may be sent inline for latency.
- No `any`, no TODO placeholders, no magic-number money — use `src/lib/utils/money.ts`, `percent.ts`, `datetime.ts`, `phone.ts`.
- Prefer complete, shippable files.

CONTEXT FILES (read before coding each phase)
- prisma/schema.prisma — source of truth for models and relations.
- src/lib/api-response.ts, src/lib/rbac.ts, src/lib/validation/*, middleware.ts, auth.ts (repo paths under `src/`).
- src/integrations/aisensy/templates.ts — `AisensyTemplates` + `AISENSY_CAMPAIGN_*` env vars; defaults match README §4 and `.env.example`.
- src/server/fitness/score.ts — for Fitness Score.
- README.md §5 — canonical feature order.

VISUALS
- If `sss-design-direction.html` (or similarly named design board) exists in the repo, match the design board screens from README §5 if that file exists in the repo. If missing, still use brand tokens from `tailwind.config.ts` (energy gradient, display font, magenta accents) for a cohesive SSS look.

EXECUTION MODE
- Work in PHASES below in order. Finish each phase’s backend + UI + any worker/job hooks before moving on, unless a later phase strictly depends on an earlier merge (then stub minimal contracts and document).
- After each phase: run npm run build; fix all errors.
- If Prisma schema changes are required, migrate or db push per repo practice; update seed if needed for demo data.

──────────────────────────────── PHASE 1 — ONBOARDING
- Multi-step onboarding at /app/onboarding: personal → health → activity → goals, posting to POST /api/members using `onboardingSchema` from `src/lib/validation` (extend if needed).
- Style: SSS brand tokens; Server Components + client stepper.
- Ensure member creation aligns with existing auth/session linkage.

──────────────────────────────── PHASE 2 — FITNESS SCORE
- POST /api/score/recompute: load member HealthProfile + last 7 days ProgressEntry, call computeFitnessScore, persist FitnessScore, return envelope.
- Page /app/score: SVG ring, Beginner→Champion ladder, component bars (README Screen 3 intent).

──────────────────────────────── PHASE 3 — PROGRESS TRACKING
- POST /api/progress: upsert by IST day bucket (istDayBucket), validate with progressEntrySchema.
- Page /app/progress: weekly/monthly charts for weight, steps, water, sleep; positive framing for weight.

──────────────────────────────── PHASE 4 — CHALLENGES + LEADERBOARD
- /app/challenges: list active challenges with member progress.
- Leaderboard from ChallengeParticipant ordered by progress; highlight current user (README Screen 5 intent).
- BullMQ: daily repeatable job to enqueue challenge_nudge for lagging participants (integrate with existing worker patterns).

──────────────────────────────── PHASE 5 — COUCH TO 5K + RAZORPAY
- /app/programs/couch-to-5k: enrollment assessment, 12-week timeline, today’s session card, assigned coach, rewards.
- Razorpay checkout for program price 149900 paise (₹1,499); verify webhooks/idempotency as appropriate.
- On enrollment: schedule per-session c25k_session reminders via queue (not inline).

──────────────────────────────── PHASE 6 — MEMBER DASHBOARD
- Authenticated /app dashboard (README Screen 2 intent): steps ring, fitness score + weight cards, active challenge, next event, motivation — live Prisma data, all formatting via unit helpers.

──────────────────────────────── PHASE 7 — EVENTS + HOST
- /api/events: HOST/ADMIN create via requireRole('HOST') or ADMIN; member register/check-in endpoints as needed.
- /host dashboard for hosts.
- Enqueue event_reminder ~12h before startsAt.

──────────────────────────────── PHASE 8 — COACH MARKETPLACE
- /app/coaches: filter CoachType; ratings via formatStars; price via formatPaiseShort; book/follow flows backed by API + Prisma.
- /coach dashboard scoped to coach’s enrollees (README Screen 7 intent).

──────────────────────────────── PHASE 9 — COMMUNITY + WELLNESS + SAFETY
- Feed: posts, likes, comments with RBAC-appropriate reads/writes.
- Women’s Wellness content section (README Screen 8 intent).
- Persistent SOS: writes SosAlert + notifies emergency contacts per schema (enqueue where bulk/side-effect).

──────────────────────────────── PHASE 10 — ADMIN DASHBOARD
- /admin ADMIN-only: aggregates — members, active members, community weight lost, total distance, event participation, challenge stats, coach performance, member growth (use efficient queries; no N+1 explosions).

FINAL CHECKLIST
- npm run build passes.
- Smoke paths: login OTP, onboarding, progress save, score recompute, challenge join, program payment happy path (test mode documented in README if applicable), host event create, admin view.
- Update README.md “What’s shipped” section with a short checklist of completed routes/pages if such a section exists; if not, add a concise § under README documenting new routes and env vars.

Begin with Phase 1: read schema and existing members route, then implement fully before Phase 2.
```

---

## Phase micro-prompts (resume-friendly)

Use when splitting across sessions or agents. Always attach `@.cursorrules` + `@prisma/schema.prisma`.

**P1 — Onboarding**  
> Execute MASTER_PROMPT Phase 1 only: `/app/onboarding` + `POST /api/members` + `onboardingSchema`. Run `npm run build` before done.

**P2 — Fitness score**  
> Execute MASTER_PROMPT Phase 2 only: `POST /api/score/recompute` + `/app/score`. Use `computeFitnessScore` and persist `FitnessScore`.

**P3 — Progress**  
> Execute MASTER_PROMPT Phase 3 only: `POST /api/progress` + `/app/progress` with `istDayBucket` + charts.

**P4 — Challenges**  
> Execute MASTER_PROMPT Phase 4 only: `/app/challenges`, leaderboard, BullMQ `challenge_nudge` job.

**P5 — C25K + Razorpay**  
> Execute MASTER_PROMPT Phase 5 only: `/app/programs/couch-to-5k`, Razorpay 149900 paise, queue `c25k_session`.

**P6 — Dashboard**  
> Execute MASTER_PROMPT Phase 6 only: member `/app` dashboard with live aggregates.

**P7 — Events**  
> Execute MASTER_PROMPT Phase 7 only: events API, `/host`, `event_reminder` enqueue.

**P8 — Coaches**  
> Execute MASTER_PROMPT Phase 8 only: `/app/coaches`, `/coach` dashboard.

**P9 — Community + SOS**  
> Execute MASTER_PROMPT Phase 9 only: feed, wellness section, SOS + `SosAlert`.

**P10 — Admin**  
> Execute MASTER_PROMPT Phase 10 only: `/admin` aggregates, ADMIN gate.

---

## Optional: multi-agent split (same master law)

If using **parallel Cursor chats**, never assign two agents the **same file**. Suggested split:

| Phase | Agent A | Agent B |
|-------|---------|---------|
| 1 | API `POST /api/members` | UI `/app/onboarding` (after schema stable) |
| 2 | `POST /api/score/recompute` | UI `/app/score` |
| 5 | Razorpay API + webhook | Program UI pages |
| 9 | Feed API | SOS + notifications (separate lane) |

Always run one **integration** session after parallel work: `npm run build`, middleware, shared types in `src/types`.

---

## AISensy template names

Your README uses `sss_*` prefix in the table; `.cursorrules` / integrations may use a variant — **normalize to whatever exists in `integrations/aisensy`** and `.env.example` before enqueueing jobs. The implementing agent must grep the repo and align names, not assume.

---

## Licence

Internal SSS Club / IntelliForge use. Keep pitch and product docs in `docs/` in sync when scope changes.
