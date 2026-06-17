# Product demo PDF (Playwright screenshots)

This workflow builds **`docs/Sister-Stride-Product-Demo.pdf`** — a non-technical walkthrough with **real UI screenshots** captured by the same Playwright stack as [E2E_PLAYWRIGHT.md](./E2E_PLAYWRIGHT.md).

| Step | Command |
|------|---------|
| 1. Capture PNGs | `npm run docs:demo-screenshots` |
| 2. Render PDF | `npm run docs:demo-doc-pdf` |

One-liner (after env is set):

```bash
npm run docs:demo-screenshots && npm run docs:demo-doc-pdf
```

## What gets captured

Spec: **`e2e/demo-doc.spec.ts`**. Config: **`playwright.demo-doc.config.ts`**.

| PNG | Area |
|-----|------|
| `01-home.png` … `05-walking-register.png` | Public pages (safe to run against production — no secrets) |
| `10-app-home.png` … `18-app-help.png` | Signed-in member app (requires credentials + onboarded user) |

Outputs are written to **`docs/demo-screenshots/`**. The printable source is **`docs/demo-doc-print.html`** (embeds those paths).

## Prerequisites

1. **Chromium for Playwright** (once): `npx playwright install chromium`
2. **`PLAYWRIGHT_BASE_URL`** — defaults to `http://127.0.0.1:3000`; `docs:demo-screenshots` starts `npm run dev` automatically for local hosts unless `CI=true` and nothing is listening.

### Public-only captures (e.g. production smoke visuals)

```powershell
$env:PLAYWRIGHT_BASE_URL="https://sister-stride.intelliforge.tech"
$env:CI="true"
npm run docs:demo-screenshots
```

You will get **`01`–`05`** only. Member shots **`10`–`18`** are **skipped** on obvious production hosts unless you set `E2E_GUIDE_ALLOW_PROD_MEMBER=1` (strongly discouraged on real member data).

### Full demo (public + member)

Use **staging or local** with a seeded beta member ([BETA_USERS.md](./BETA_USERS.md)):

```powershell
$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:3000"
$env:E2E_PASSWORD_EMAIL="beta.member1@sss-club.example.com"
$env:E2E_PASSWORD="BetaTest@2026!"
npm run db:push   # if needed
npm run db:seed   # onboarded user
npm run docs:demo-screenshots
npm run docs:demo-doc-pdf
```

## Troubleshooting

| Issue | What to try |
|--------|-------------|
| Missing or broken images in the PDF | Run `docs:demo-screenshots` first; confirm files exist under `docs/demo-screenshots/`. |
| Sections 10–18 missing / broken in PDF | You only ran a **public** capture (or skipped member). Re-run with local/staging + `E2E_PASSWORD_*` + `npm run db:seed` so `10-app-home.png` … `18-app-help.png` are created. |
| Member block skipped | Set `E2E_PASSWORD_EMAIL` + `E2E_PASSWORD`, use non-production URL, run `npm run db:seed`. |
| Same as member guide capture | This demo adds **`18-app-help.png`** and writes to **`demo-screenshots/`**; the member guide uses `guide-screenshots/` and different HTML. |

## CI

You can run `npm run docs:demo-screenshots` in CI after `db:seed` and secrets for `E2E_PASSWORD_*`, then upload `docs/demo-screenshots/` and the PDF as artifacts.
