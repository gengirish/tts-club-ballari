# E2E testing with Playwright (SSS Club Ballari)

This repo uses [**Playwright**](https://playwright.dev/) for browser and API checks against the Next.js app. Use this doc as the **skill reference** for adding or changing E2E tests.

## Prerequisites

1. **PostgreSQL** with **`DATABASE_URL`** and **`DIRECT_URL`** set (same as local dev — see [DATABASE_ENV.md](./DATABASE_ENV.md)).
2. **`npm run db:push`** so the Prisma schema matches the app.
3. **Auth secret**: `AUTH_SECRET` (and other vars from `.env.example` as needed). The E2E seed script loads **`.env`** via `dotenv` when present.

## Auth path in E2E (OTP by default)

The Playwright **setup** project (`e2e/auth.setup.ts`) signs in through the **phone OTP** tab using `E2E_TEST_PHONE` and `E2E_TEST_OTP` only. There is **no** separate environment variable today for exercising the email/username + password flow in CI; if you add password-based E2E later, document any new variables here and in `.env.example` when they exist in code.

## E2E OTP bypass (local / CI only)

Normal OTP goes through AISensy WhatsApp. For automation, a **strictly opt-in** path exists:

| Variable | Purpose |
|----------|---------|
| `E2E_TEST_PHONE` | E.164 or local Indian number; must match the phone you type on `/login`. |
| `E2E_TEST_OTP` | Six digits stored as the OTP for that phone only (no WhatsApp send). |

When both are set and `issueOtp` is called for that phone, the server persists this OTP and returns `{ sent: true }` without calling AISensy.

**Never set these in production.** They bypass the real OTP channel for that number.

## Onboarded test user

Authenticated specs expect `/app` **not** to redirect to `/app/onboarding`. Seed a member tied to `E2E_TEST_PHONE`:

```bash
# Windows PowerShell — with .env containing DATABASE_URL, DIRECT_URL, AUTH_SECRET, E2E_*:
npm run test:e2e:seed

# Or set explicitly (CI):
$env:DATABASE_URL="postgresql://..."
$env:DIRECT_URL="postgresql://..."
$env:E2E_TEST_PHONE="+919999999999"
npm run test:e2e:seed
```

Or use npm script: `npm run test:e2e:seed`.

## Commands

| Script | What it does |
|--------|----------------|
| `npm run test:e2e:seed` | Upserts onboarded user for `E2E_TEST_PHONE`. |
| `npm run test:e2e` | Runs Playwright (starts `npm run dev` unless CI / reuse). |
| `npm run test:e2e:prod` | Smoke **public** specs only; set `PLAYWRIGHT_BASE_URL` to production (see [DEPLOYED_URLS.md](./DEPLOYED_URLS.md)). Does **not** start a local dev server when the URL host is not `localhost` / `127.0.0.1`. |
| `npm run test:e2e:ui` | Playwright UI mode for debugging. |
| `npx playwright install chromium` | One-time browser download. |

### E2E against Vercel (production smoke)

Do **not** set `E2E_TEST_PHONE` / `E2E_TEST_OTP` on production — the OTP bypass must never be enabled there. Use read-only public checks:

```bash
# Windows PowerShell
$env:PLAYWRIGHT_BASE_URL="https://sister-stride.intelliforge.tech"
$env:CI="true"
npm run test:e2e:prod
```

`password-login.spec.ts` and authenticated suites are for **staging/local** with a real DB you control; they create accounts or rely on the OTP bypass.

With **`E2E_TEST_PHONE` + `E2E_TEST_OTP`** set, Playwright runs:

- **`setup`** — `e2e/auth.setup.ts` logs in and writes `e2e/.auth/member.json`.
- **`chromium`** — `e2e/authenticated/*.spec.ts` (member UI, **API routes** with session cookie, challenges join) using `e2e/.auth/member.json`.
- **`public`** — `e2e/public.spec.ts` and `e2e/password-login.spec.ts` (no OTP session; password flow registers fresh users against the same DB).

Without those env vars, only **`public`** runs (`public.spec.ts` + **`password-login.spec.ts`** — smoke on `/`, `/login`, register API errors, and email/username sign-up against local DB).

## Writing new tests

1. **Stable selectors**: prefer `data-testid` on interactive UI (see `login` and score recompute). Use `getByRole` for headings and links when accessible names are stable.
2. **Authenticated flows**: add files under `e2e/authenticated/`. They automatically use `storageState` from setup when E2E auth env is enabled.
3. **API-only checks**: use `request` from Playwright; cookies from `storageState` apply to same-origin requests to the app under test.
4. **Layout**: `e2e/authenticated/` holds session specs (`member.spec`, `api-routes.spec`, `member-interactions`, `beta-regression`, `rbac-redirects`, `challenges-flow`). Shared JSON helpers live in `e2e/helpers/`.
5. **No `any`**: keep fixtures typed; parse JSON as unknown then narrow.
6. **Money / time**: UI assertions should match formatted copy (IST, DD/MM) only when you intentionally test the view layer; otherwise assert on structure (headings, buttons).

## CI suggestion

```yaml
env:
  DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
  DIRECT_URL: ${{ secrets.TEST_DIRECT_URL }}
  E2E_TEST_PHONE: ${{ secrets.E2E_TEST_PHONE }}
  E2E_TEST_OTP: ${{ secrets.E2E_TEST_OTP }}
  AUTH_SECRET: ${{ secrets.AUTH_SECRET }}
steps:
  - run: npm ci
  - run: npx prisma db push
  - run: npm run test:e2e:seed
  - run: npx playwright install chromium --with-deps
  - run: npm run test:e2e
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `OTP_SEND_FAILED` during setup | Ensure `E2E_TEST_PHONE` matches exactly what `toE164` produces for the bypass (use seed phone format from `phone.ts`). |
| Stuck on `/app/onboarding` | Run `npm run test:e2e:seed`. |
| Redis / BullMQ errors during dev | E2E does not require Redis for these browser tests; ignore worker noise unless testing enqueue. |
| Web server timeout | Increase `webServer.timeout` in `playwright.config.ts` or run `npm run dev` manually with `reuseExistingServer`. |
