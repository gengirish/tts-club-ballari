# E2E testing with Playwright (SSS Club Ballari)

This repo uses [**Playwright**](https://playwright.dev/) for browser and API checks against the Next.js app. Use this doc as the **skill reference** for adding or changing E2E tests.

## Prerequisites

1. **PostgreSQL** with **`DATABASE_URL`** and **`DIRECT_URL`** set (same as local dev — see [DATABASE_ENV.md](./DATABASE_ENV.md)).
2. **`npm run db:push`** so the Prisma schema matches the app.
3. **Auth secret**: `AUTH_SECRET` (and other vars from `.env.example` as needed). The E2E seed script loads **`.env`** via `dotenv` when present.

## Auth path in E2E (password login)

The Playwright **setup** project (`e2e/auth.setup.ts`) signs in through the **Password** tab using **`E2E_PASSWORD_EMAIL`** and **`E2E_PASSWORD`**. Use a **seeded beta member** from [BETA_USERS.md](./BETA_USERS.md) (e.g. `beta.member1@sss-club.example.com` and the documented beta password). Run **`npm run db:seed`** first so that user exists and is onboarded.

The **WhatsApp / phone OTP** tab is **not shown** on `/login` in the product UI; do not rely on typing a phone number in the browser for E2E.

## E2E OTP bypass (server-only, optional)

Normal OTP goes through AISensy WhatsApp. For **API-level** tests or `npm run test:e2e:seed`, a **strictly opt-in** server path still exists (it does **not** power the login page UI):

| Variable | Purpose |
|----------|---------|
| `E2E_TEST_PHONE` | E.164 or local Indian number; used by `issueOtp` / seed scripts only. |
| `E2E_TEST_OTP` | Six digits stored as the OTP for that phone (no WhatsApp send). |

When both are set and `issueOtp` is called for that phone, the server persists this OTP and returns `{ sent: true }` without calling AISensy.

**Never set these in production.** They bypass the real OTP channel for that number.

## Onboarded test user

Authenticated specs expect `/app` **not** to redirect to `/app/onboarding`.

1. Load the database with beta users: **`npm run db:seed`** (after `db:push` if needed). See [BETA_USERS.md](./BETA_USERS.md).
2. Set **`E2E_PASSWORD_EMAIL`** and **`E2E_PASSWORD`** in `.env` to match a seeded member (same password column as in BETA_USERS).
3. Optionally, to attach a **specific phone** to an onboarded user for server-side OTP tests:

```bash
# Windows PowerShell — with .env containing DATABASE_URL, DIRECT_URL, AUTH_SECRET, E2E_TEST_PHONE:
npm run test:e2e:seed
```

`test:e2e:seed` only needs `E2E_TEST_PHONE` when you use that script; Playwright **setup** does **not** require it.

## Commands

| Script | What it does |
|--------|----------------|
| `npm run test:e2e:seed` | Upserts onboarded user for `E2E_TEST_PHONE` (optional; server/seed only). |
| `npm run test:e2e` | Runs Playwright (starts `npm run dev` unless CI / reuse). |
| `npm run test:e2e:prod` | Smoke **`e2e/public.spec.ts`** only (home, login + Join flow, `/walking-to-5k` guest redirect, APIs, verify-request). Set `PLAYWRIGHT_BASE_URL` for production (see [DEPLOYED_URLS.md](./DEPLOYED_URLS.md)). Does **not** start a local dev server when the URL host is not `localhost` / `127.0.0.1`. |
| `npm run docs:member-guide-screenshots` | Playwright capture for **`docs/member-guide-print.html`** images (see [MEMBER_GUIDE_SCREENSHOTS.md](./MEMBER_GUIDE_SCREENSHOTS.md)); uses `playwright.guide-screenshots.config.ts` and `PLAYWRIGHT_BASE_URL`. |
| `npm run test:e2e:ui` | Playwright UI mode for debugging. |
| `npx playwright install chromium` | One-time browser download. |

### E2E against Vercel (production smoke)

Do **not** set `E2E_TEST_PHONE` / `E2E_TEST_OTP` or **`E2E_PASSWORD_*`** on production — the OTP bypass and shared beta passwords must never be enabled there. Use read-only public checks:

```bash
# Windows PowerShell
$env:PLAYWRIGHT_BASE_URL="https://sister-stride.intelliforge.tech"
$env:CI="true"
npm run test:e2e:prod
```

`password-login.spec.ts` and authenticated suites are for **staging/local** with a real DB you control.

With **`E2E_PASSWORD_EMAIL` + `E2E_PASSWORD`** set, Playwright runs:

- **`setup`** — `e2e/auth.setup.ts` signs in with **Password** and writes `e2e/.auth/member.json`.
- **`chromium`** — `e2e/authenticated/*.spec.ts` (member UI, **API routes** with session cookie, challenges join) using `e2e/.auth/member.json`.
- **`public`** — `e2e/public.spec.ts` and `e2e/password-login.spec.ts` (no session; smoke and fresh sign-up against the same DB).

Without the password env vars, only **`public`** runs (`public.spec.ts` + **`password-login.spec.ts`** — smoke on `/`, `/login`, login **Join** sign-up fields, `/walking-to-5k` guest redirect to register, register API errors, email/username sign-up against local DB, **public event registration APIs** (missing event → `NOT_FOUND`), **unauthenticated auth APIs** (reset token, OTP validation), and **`GET /api/members/me` → 401**).

## Writing new tests

1. **Stable selectors**: prefer `data-testid` on interactive UI (see `login` and score recompute). Use `getByRole` for headings and links when accessible names are stable.
2. **Authenticated flows**: add files under `e2e/authenticated/`. They automatically use `storageState` from setup when E2E auth env is enabled.
3. **API-only checks**: use `request` from Playwright; cookies from `storageState` apply to same-origin requests to the app under test.
4. **Layout**: `e2e/authenticated/` holds session specs (`member.spec`, `api-routes.spec`, `member-interactions`, `beta-regression`, `rbac-redirects`, `challenges-flow`, **`product-flows`**). Shared JSON helpers live in `e2e/helpers/`.
5. **No `any`**: keep fixtures typed; parse JSON as unknown then narrow.
6. **Money / time**: UI assertions should match formatted copy (IST, DD/MM) only when you intentionally test the view layer; otherwise assert on structure (headings, buttons).

## CI suggestion

```yaml
env:
  DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
  DIRECT_URL: ${{ secrets.TEST_DIRECT_URL }}
  E2E_PASSWORD_EMAIL: ${{ secrets.E2E_PASSWORD_EMAIL }}
  E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}
  AUTH_SECRET: ${{ secrets.AUTH_SECRET }}
steps:
  - run: npm ci
  - run: npx prisma db push
  - run: npm run db:seed
  - run: npx playwright install chromium --with-deps
  - run: npm run test:e2e
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Setup fails: missing env | Set **`E2E_PASSWORD_EMAIL`** + **`E2E_PASSWORD`** and run **`npm run db:seed`**. |
| `OTP_SEND_FAILED` (seed / API only) | If using `test:e2e:seed`, ensure `E2E_TEST_PHONE` matches `toE164` (`lib/utils/phone.ts`). |
| Stuck on `/app/onboarding` | Run `npm run test:e2e:seed`. |
| Redis / BullMQ errors during dev | E2E does not require Redis for these browser tests; ignore worker noise unless testing enqueue. |
| Web server timeout | Increase `webServer.timeout` in `playwright.config.ts` or run `npm run dev` manually with `reuseExistingServer`. |
