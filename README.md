# Steel Sisters & Striders — SSS Club Ballari

Women-first fitness ecosystem. Next.js 14 (App Router) · Prisma/Postgres · **Auth.js v5 RBAC** · BullMQ on Fly.io · **AgentMail** (email) · **AISensy** (WhatsApp).

This is a **Cursor scaffold**: the foundation, conventions, and integrations are wired and complete. Feature modules are built from the sequential Composer prompts below.

**Pitch & investor narrative:** [docs/pitch-deck.md](./docs/pitch-deck.md) · [docs/YC_NARRATIVE.md](./docs/YC_NARRATIVE.md) (YC-style one-pager — wedge, metric, expansion, risks).

**PWA:** [docs/PWA.md](./docs/PWA.md) — installable app (manifest + Serwist service worker; icons in `public/icons/`).

---

## 1. Setup

```bash
npm install
cp .env.example .env        # set DATABASE_URL + DIRECT_URL (and other keys) — see docs/DATABASE_ENV.md
npx auth secret             # writes AUTH_SECRET
npm run db:push             # push schema to Postgres (Neon, Supabase, etc.)
npm run db:seed             # program + badges + sample challenge + **beta test users** (loads .env via dotenv; see [docs/BETA_USERS.md](./docs/BETA_USERS.md))
npm run lint && npm run typecheck   # same checks as GitHub CI
npm run dev                 # web (Vercel target)
npm run worker              # BullMQ worker (Fly.io target) — separate terminal
```

Requires: **PostgreSQL** with both **`DATABASE_URL`** and **`DIRECT_URL`** set (Neon recommended; Supabase works — see [docs/DATABASE_ENV.md](./docs/DATABASE_ENV.md)), **Redis** (BullMQ), an AISensy account with **approved** WhatsApp templates, and an AgentMail inbox + API key.

## 2. Conventions (enforced by `.cursorrules`)

| Concern | Rule |
|---|---|
| Money | Integer **paise**; format to ₹ only in views (`lib/utils/money.ts`) |
| Percent / ratings | **Basis points** (10000 = 100%) (`lib/utils/percent.ts`) |
| Time | Store UTC, display **IST**; dates **DD/MM/YYYY** (`lib/utils/datetime.ts`) |
| Phone | **E.164**, default **IN** (`lib/utils/phone.ts`); phone = primary login |
| API | `ApiResponse<T>` envelope (`lib/api-response.ts`) + **Zod** on all inputs |
| Auth | Auth.js v5, **role gate** via `lib/rbac.ts` — never trust client role |

## 3. What's already wired

- **RBAC**: `MEMBER < COACH/HOST < ADMIN`. `requireAuth()`, `requireRole()`, route guards in `middleware.ts`.
- **Phone-OTP login (primary for India)**: OTP issued + delivered over WhatsApp (AISensy auth template). `auth.ts`, `server/auth/otp.ts`, `/api/auth/otp`. **Redis-backed rate limits** (per IP + per phone on send; per phone on failed verify when `REDIS_URL` is set). **Admin** `/admin` includes a failed OTP send panel for the AISensy login campaign. SMS/email OTP fallback is not implemented — extend integrations if you need non‑WhatsApp users.
- **Email / username + password**: `POST /api/auth/register` (Zod-validated sign-up), `email-password` Credentials provider in `auth.ts`, and **login tabs** on `/login` (OTP vs password vs register). Phone OTP remains the default path for the Indian, phone-first context.
- **AISensy** template client + typed campaign registry (`integrations/aisensy/*`). **Operator CLI:** `npm run aisensy` — see [docs/AISENSY_CLI.md](./docs/AISENSY_CLI.md) (dashboard setup + `env` / `ping` against the campaign API).
- **AgentMail** send/reply client + inbound webhook handler (`integrations/agentmail/*`, `/api/webhooks/agentmail`).
- **BullMQ** notifications queue + Fly.io worker (event reminders, challenge nudges, C25K alerts, email).
- **Fitness Score** engine (`server/fitness/score.ts`).
- **Beta test users** — `npm run db:seed` upserts password-based accounts (member ×2, admin, coach + `Coach` row, host) with onboarding complete. Handover: [docs/BETA_USERS.md](./docs/BETA_USERS.md). Test plan: [docs/BETA_TEST_PLAN.md](./docs/BETA_TEST_PLAN.md).

### Shipped checklist (rolling)

| Phase | Routes / pages |
|------|----------------|
| **1 — Onboarding** | `GET/POST /api/members` (POST: signed-in self onboarding with `onboardingSchema`), `/app/onboarding` (4-step flow), `/app` redirects to onboarding until profile + goals exist. |
| **2 — Fitness score** | `POST /api/score/recompute`, `/app/score` (ring + ladder + component bars). |
| **3 — Progress** | `POST /api/progress` (IST `istDayBucket`), `/app/progress` (log + week/month charts, positive weight framing). |
| **4 — Challenges** | `/app/challenges`, join `POST /api/challenges/[id]/join` (Zod), leaderboard UI; worker repeatable `challenge_nudge_scan` → enqueues `challenge_nudge`. |
| **5 — C25K + Razorpay** | `/app/programs/couch-to-5k`, `POST /api/programs/couch-to-5k/order`, `POST /api/webhooks/razorpay` (signature + idempotent pay capture), `scheduleC25kSessionReminders`. |
| **6 — Member dashboard** | `/app` live widgets (steps, score, weight, challenge, next event). |
| **7 — Events + host** | `GET/POST /api/events`, `GET/PATCH /api/events/[id]`, `POST /api/events/[id]/register`, `POST /api/events/[id]/check-in`, `POST /api/events/[id]/guest-check-in`, `/host`, `/register/[eventId]` (public paid registration), `/e/pass/[token]` (QR pass), `/host/event-registrations` & `/admin/event-registrations` (review queue); `scheduleEventReminderForRegistrant` (~12h). **Optional:** `INTELLIFORGE_API_KEY` — on approve, mints a signed entry ticket via [IntelliForge Certificates](https://certs.intelliforge.tech/) (`POST /api/receipt`); retry with `POST /api/event-applications/[id]/mint-intelliforge-ticket`. |
| **8 — Coaches** | `/app/coaches`, `POST /api/coaches/[id]/book`, `/coach` desk (scoped enrollments). |
| **9 — Community + SOS** | `GET/POST /api/community/posts`, like + comments routes, `/app/community` + wellness list, `POST /api/sos` + optional email enqueue. |
| **10 — Admin** | `/admin` aggregates (members, activity, challenges, events, wellness, growth, coach leaderboard) + **WhatsApp OTP failure** feed for the AISensy login campaign. |

After **Prisma schema** changes (for example optional `phone`, `username`, `passwordHash` on `User`), run `npm run db:push` locally or your migration flow, then **`npm run build`** so TypeScript and the app stay aligned with the schema before you ship or merge.

Env additions (see `.env.example`): `SOS_FORWARD_EMAIL`, `COACH_BOOKING_INBOX` (optional; coach booking emails).

## E2E (Playwright)

See [docs/E2E_PLAYWRIGHT.md](./docs/E2E_PLAYWRIGHT.md). Quick start:

```bash
npx playwright install chromium
# Prefer a filled .env (DATABASE_URL + DIRECT_URL + AUTH_SECRET); run db:seed for beta users (see docs/BETA_USERS.md).
npm run db:seed
$env:E2E_PASSWORD_EMAIL="beta.member1@sss-club.example.com"; $env:E2E_PASSWORD="BetaTest@2026!"
npm run test:e2e
```

## 4. AISensy templates to create & approve (dashboard)

End-to-end checklist (dashboard + local `.env` + test send): **[docs/AISENSY_CLI.md](./docs/AISENSY_CLI.md)** — includes `npm run aisensy -- env` and `npm run aisensy -- ping`.

Create these as **approved** campaigns; names map via `.env`:

| Campaign | Category | Params (ordered) |
|---|---|---|
| `sss_otp_login` | Authentication | `{{1}}` = 6-digit code |
| `sss_event_reminder` | Utility | `{{1}}` title, `{{2}}` datetime IST, `{{3}}` location |
| `sss_challenge_nudge` | Utility | `{{1}}` challenge, `{{2}}` progress line |
| `sss_c25k_session` | Utility | `{{1}}` week no, `{{2}}` session line |

## 5. Sequential Cursor Composer prompts

Run these **in order** in Composer. Each assumes the scaffold + `.cursorrules` are in context. Reference the design board screens (`sss-design-direction.html`) for visuals.

**Prompt 1 — Onboarding flow**
> Build the multi-step onboarding at `/app/onboarding` (personal → health → activity → goals) posting to `POST /api/members`. Use the `onboardingSchema`. Style with the SSS brand tokens (energy gradient, Anton headings, magenta goal chips) matching Screen 1 of the design board. Server Components + a client stepper.

**Prompt 2 — Fitness Score**
> Add `POST /api/score/recompute` that pulls the member's HealthProfile + last 7 days of ProgressEntry, calls `computeFitnessScore`, writes a `FitnessScore` row, and returns it in the envelope. Build the `/app/score` screen with the SVG ring, Beginner→Champion ladder, and component bars (Screen 3).

**Prompt 3 — Progress tracking**
> Build `POST /api/progress` (upsert by IST day bucket via `istDayBucket`, validate with `progressEntrySchema`) and `/app/progress` with weekly/monthly charts for weight, steps, water, sleep. Keep weight framed positively (green downward = win).

**Prompt 4 — Challenges + leaderboard**
> Build `/app/challenges` listing active challenges with progress, plus a leaderboard reading `ChallengeParticipant` ordered by progress, highlighting the current user (Screen 5). Add a daily BullMQ repeatable job to enqueue `challenge_nudge` for lagging participants.

**Prompt 5 — Couch to 5K program**
> Build `/app/programs/couch-to-5k`: enrollment assessment form, 12-week phase timeline, today's session card, assigned coach, and rewards. Razorpay checkout for the ₹1,499 premium price (paise). On enrollment, schedule per-session `c25k_session` reminders via the queue (Screen 4).

**Prompt 6 — Member dashboard**
> Build `/app` dashboard exactly like Screen 2: steps ring, fitness score + weight cards, active challenge, next event, motivation. Pull live data; all money/percent/time via the unit helpers.

**Prompt 7 — Events + host**
> Build `/api/events` (HOST/ADMIN create via `requireRole('HOST')`), member register/check-in, and `/host` dashboard. Enqueue `event_reminder` 12h before `startsAt`.

**Prompt 8 — Coach marketplace**
> Build `/app/coaches` (filter by `CoachType`, ratings via `formatStars`, price via `formatPaiseShort`, book/follow) and a `/coach` dashboard scoped to the coach's enrollees (Screen 7).

**Prompt 9 — Community feed + Women's Wellness + Safety**
> Build the feed (posts, likes, comments), the Women's Wellness content section (Screen 8), and the persistent SOS button writing `SosAlert` + notifying emergency contacts.

**Prompt 10 — Admin dashboard**
> Build `/admin` (ADMIN only) with totals: members, active members, community weight lost, total distance, event participation, challenge stats, coach performance, member growth.

## 6. Deploy (Vercel-first · CI/CD · optional Fly)

**Deployed URLs (production + webhooks):** [docs/DEPLOYED_URLS.md](./docs/DEPLOYED_URLS.md)

This project follows the **IntelliForge HRMS** style: **production traffic on Vercel** via GitHub integration, **quality gates in GitHub Actions**, and **no requirement to run Docker locally** for the web app. BullMQ still uses a **Fly.io worker** (TCP + long process); deploy that worker from **CI** or the Fly CLI.

**Full guide (secrets, `FLY_DEPLOY_ENABLED`, optional API split):** [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

### TL;DR

| Step | What to do |
|------|----------------|
| **1. Vercel** | Connect the repo → set env vars from `.env.example` (incl. **`DATABASE_URL`** + **`DIRECT_URL`** — [docs/DATABASE_ENV.md](./docs/DATABASE_ENV.md)) → merge to `main` / `master` → auto deploy. |
| **2. CI** | `.github/workflows/ci.yml` runs lint, typecheck, and build on every PR/push. |
| **3. Fly worker (optional automation)** | Add secret `FLY_API_TOKEN` and variable `FLY_DEPLOY_ENABLED=true` → `.github/workflows/deploy-fly-worker.yml` deploys on relevant pushes or manual run. |
| **4. Optional Fly API** | Only if you use `PROXY_API_TO` on Vercel; otherwise run all `/api/*` on Vercel like HRMS. |

```bash
# Optional: synchronous production URL (after GitHub → Vercel is linked)
vercel deploy --prod --yes

# Optional: worker from laptop instead of Actions
fly deploy --config fly.worker.toml
```

**Webhooks:** point AgentMail (and similar) at your **production origin** (same as `AUTH_URL` — e.g. [sister-stride.intelliforge.tech](https://sister-stride.intelliforge.tech/); see [docs/DEPLOYED_URLS.md](./docs/DEPLOYED_URLS.md)).

### Legacy: full Fly API container

If you maintain a separate Next API on Fly (`Dockerfile` + `fly.toml`), see [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md). That path is **advanced** and not required for a HRMS-style deployment.
