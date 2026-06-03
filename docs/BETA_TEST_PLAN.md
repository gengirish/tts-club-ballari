# Beta test plan — SSS Club Ballari

**Product:** Steel Sisters & Striders — women-first fitness community (Ballari, India).  
**Stack (context only):** Next.js 14, Auth.js, Prisma/Postgres, Razorpay, AISensy (WhatsApp OTP), AgentMail, BullMQ worker on Fly.

This document is for **QA leads and beta testers**. Use it to run a structured pass before wider release.

---

## 1. Goals

| Goal | Success signal |
|------|------------------|
| **Auth works** | Phone OTP (when configured) and email/username + password sign-in and sign-up behave predictably; errors are understandable. |
| **Member journeys** | Onboarding, dashboard, progress, score, challenges, C25K browse/enrol path (per env), community, SOS feel safe and usable on mobile. |
| **Role flows** | Coach desk, host tools, admin snapshot load for the right roles only. |
| **India UX** | Dates (DD/MM/YYYY), IST time, ₹ and paise rules feel correct where visible. |
| **Stability** | No data loss, no broken core navigation, critical APIs return the documented `ApiResponse` envelope. |

---

## 2. Environment & access

| Item | Action |
|------|--------|
| **App URL** | Confirm the build under test (e.g. [DEPLOYED_URLS.md](./DEPLOYED_URLS.md) — typically `https://sister-stride.intelliforge.tech` or a Vercel preview URL). |
| **Database** | Beta DB must be **seeded** so shared accounts exist: `npm run db:seed` (after `db:push` if needed). Requires **`DATABASE_URL`** + **`DIRECT_URL`** in `.env` (see [DATABASE_ENV.md](./DATABASE_ENV.md)). Accounts: [BETA_USERS.md](./BETA_USERS.md). |
| **Devices** | At least **one Android Chrome** and **one iPhone Safari** (or two real phones). Include **one desktop** for admin/coach/host. |
| **Network** | Real 4G/5G/Wi‑Fi in India where possible; note if testing only on Wi‑Fi. |

**Do not** enable `E2E_TEST_PHONE` / `E2E_TEST_OTP` on production — those bypass OTP for automation only.

---

## 3. Roles & tester assignment

| Persona | Seeded account (see [BETA_USERS.md](./BETA_USERS.md)) | Primary areas |
|---------|--------------------------------------------------------|----------------|
| **Member A** | `beta.member1@…` / `beta_ballari_1` | Onboarding (if testing fresh sign-up), `/app`, progress, score, challenges, C25K, community, SOS |
| **Member B** | `beta.member2@…` / `beta_ballari_2` | Community interactions with Member A, second-device checks |
| **Coach** | `beta.coach@…` / `beta_coach` | `/coach` — enrolments / desk views |
| **Host** | `beta.host@…` / `beta_host` | `/host` — event create/list (if permitted) |
| **Admin** | `beta.admin@…` / `beta_admin` | `/admin` — aggregates only; confirm non-admin cannot access |

Shared password for seeded users: documented in **BETA_USERS.md** (rotate after beta).

---

## 4. Test matrix (checklist)

Use **Pass / Fail / Blocked** + short notes and **approx. date**. “Blocked” = dependency missing (e.g. AISensy template not approved, Razorpay not in test mode).

### 4.1 Authentication & account

| # | Case | Steps | Expected |
|---|------|--------|----------|
| A1 | Password login (seeded member) | `/login` → **Password** → email + password from BETA_USERS | Lands on `/app` (or onboarding if account not fully seeded). |
| A2 | Password login by username | Same with **username** only | Same as A1. |
| A3 | Sign up (new user) | **Sign up** tab → new unique email + username + password | 201 or clear validation message; then password sign-in works. |
| A4 | Validation clarity | Submit invalid username (e.g. spaces) or short password | Error text explains **which field** failed (not only “Invalid input”). |
| A5 | Phone OTP (optional) | **Phone OTP** tab if WhatsApp/AISensy is live for this env | OTP received or clear failure; no silent hang. |

### 4.2 Member — onboarding & home

| # | Case | Steps | Expected |
|---|------|--------|----------|
| M1 | Onboarding (new account) | Register new user → complete all steps | Profile + goals saved; `/app` loads without redirect loop. |
| M2 | Dashboard | `/app` | Cards/widgets load; no blank shell. |
| M3 | Fitness score | `/app/score` + recompute if UI offers it | Page loads; recompute returns success or clear error. |
| M4 | Progress | `/app/progress` | Log entry / charts; positive framing for weight where applicable. |
| M5 | Challenges | `/app/challenges` | List, join, leaderboard highlights current user where designed. |

### 4.3 Programs & payments

| # | Case | Steps | Expected |
|---|------|--------|----------|
| P1 | Couch to 5K page | `/app/programs/couch-to-5k` | Content and assessment UI load. |
| P2 | Razorpay checkout | Start payment in **test mode** only (per env keys) | Success/cancel/failure paths are clear; no real money in beta unless explicitly agreed. |
| P3 | Local dev without Razorpay | `NODE_ENV=development` + `C25K_DEV_CHECKOUT=1` in `.env.local` (never production) | Pay CTA enrolls without checkout for QA; production still requires keys + webhook. |

### 4.4 Community & safety

| # | Case | Steps | Expected |
|---|------|--------|----------|
| C1 | Feed | `/app/community` | Posts list; create post if allowed. |
| C2 | Like / comment | Interact with a post | Updates reflect without full reload breaking state. |
| C3 | SOS | Trigger SOS (with consent); check forward email if `SOS_FORWARD_EMAIL` set | Alert created; optional email received or documented skip. |

### 4.5 Coach, host, admin

| # | Case | Steps | Expected |
|---|------|--------|----------|
| R1 | Coach desk | Login as coach → `/coach` | Scoped data; no other members’ private data leaked. |
| R2 | Host | Login as host → `/host` | Event flows per product spec; RBAC enforced. |
| R3 | Admin | Login as admin → `/admin` | Metrics load; member cannot open `/admin` (redirect or error). |

### 4.6 Non-functional

| # | Case | Notes |
|---|------|--------|
| N1 | **Performance** | First load and repeat navigation acceptable on 4G. |
| N2 | **Accessibility** | Focus order on login tabs and primary buttons; readable contrast. |
| N3 | **Copy** | No offensive or confusing strings in error/success messages. |

---

## 5. Severity definitions (for bug reports)

| Level | Meaning | Example |
|-------|---------|---------|
| **S1** | Blocker — cannot test further or data/security risk | Cannot log in; payment double-charge; role bypass. |
| **S2** | Major — core journey broken | Onboarding cannot complete; challenge join fails. |
| **S3** | Minor — workaround exists | Misaligned spacing; typo; slow non-critical page. |
| **S4** | Trivial / nice-to-have | Cosmetic only. |

---

## 6. Bug report template (copy-paste)

```text
Title: [S1|S2|S3|S4] Short description
Environment: URL + browser + OS
Account role: Member / Coach / Host / Admin / New signup
Steps: 1. … 2. …
Expected: …
Actual: …
Screenshot / screen recording: (attach if possible)
Network: Wi-Fi / 4G
Time (IST): DD/MM/YYYY HH:mm
```

Send to the channel agreed with the product owner (e.g. email, Slack, GitHub **Issues** with label `beta`).

---

## 7. Exit criteria (beta complete)

- [ ] All **S1** items resolved or explicitly accepted with mitigation.  
- [ ] **A1–A4** and **M2–M5** pass on **at least one mobile + one desktop** configuration.  
- [ ] **R3** admin gate verified.  
- [ ] Razorpay path verified in **test** configuration OR explicitly deferred with sign-off.  
- [ ] **Sign-off** from product owner after reviewing aggregated results.

---

## 8. Out of scope (unless agreed)

- Load/stress testing beyond normal usage.  
- Legal/compliance sign-off beyond product behaviour (e.g. formal DPIA).  
- AISensy template approval inside Meta/WhatsApp policy (track as dependency, not as “app bug”).  

---

## 9. Related documents

| Doc | Use |
|-----|-----|
| [BETA_USERS.md](./BETA_USERS.md) | Credentials and seed instructions |
| [DATABASE_ENV.md](./DATABASE_ENV.md) | `DATABASE_URL` + `DIRECT_URL` (local, Vercel, CI) |
| [DEPLOYED_URLS.md](./DEPLOYED_URLS.md) | Where the app and webhooks live |
| [E2E_PLAYWRIGHT.md](./E2E_PLAYWRIGHT.md) | Automated smoke (engineering), not a replacement for manual beta |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | How builds and workers are deployed |

---

## Document control

| Version | Date | Notes |
|---------|------|--------|
| 1.0 | 2026-06-02 | Initial beta plan for SSS Club Ballari scaffold. |

Update this file when scope changes (e.g. new modules shipped or Razorpay go-live checklist).
