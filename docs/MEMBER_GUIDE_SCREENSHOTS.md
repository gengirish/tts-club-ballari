# Member guide screenshots (Playwright)

The printable guide [`member-guide-print.html`](./member-guide-print.html) can include **real screenshots** taken from any deployed URL (or local dev) using Playwright.

## 1. Public pages only (safe on production)

No sign-in secrets required. Point Playwright at your live site and capture the landing, login, join, forgot password, and Walking to 5K registration screens.

**Windows PowerShell example (production):**

```powershell
$env:PLAYWRIGHT_BASE_URL="https://sister-stride.intelliforge.tech"
$env:CI="true"
npm run docs:member-guide-screenshots
```

**macOS / Linux:**

```bash
PLAYWRIGHT_BASE_URL="https://sister-stride.intelliforge.tech" CI=true npm run docs:member-guide-screenshots
```

Outputs PNGs under **`docs/guide-screenshots/`** (`01-home.png` … `05-walking-register.png`).

## 2. Member app pages (dashboard, Progress, etc.)

These steps **sign in** with **`E2E_PASSWORD_EMAIL`** and **`E2E_PASSWORD`** (same as [E2E_PLAYWRIGHT.md](./E2E_PLAYWRIGHT.md)). Use a **staging or local** database with a seeded onboarded member (`npm run db:seed`), **not** a production DB with real members.

```powershell
$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:3000"
$env:E2E_PASSWORD_EMAIL="beta.member1@sss-club.example.com"
$env:E2E_PASSWORD="BetaTest@2026!"
npm run docs:member-guide-screenshots
```

On **production-looking hosts** (`*.intelliforge.tech`, `sister-stride*.vercel.app`), member screenshots are **skipped by default**. To override (strongly discouraged on real data):

```powershell
$env:E2E_GUIDE_ALLOW_PROD_MEMBER="1"
```

## 3. Rebuild the PDF

After PNGs exist next to the HTML:

```bash
npm run docs:member-guide-pdf
```

This overwrites **`docs/Sister-Stride-Member-Guide.pdf`** using headless Chromium.

## 4. One-liner workflow

```bash
PLAYWRIGHT_BASE_URL="https://your-host" CI=true npm run docs:member-guide-screenshots && npm run docs:member-guide-pdf
```

## 5. Troubleshooting

| Issue | What to try |
|--------|-------------|
| Timeouts or `ERR_NAME_NOT_RESOLVED` on first hop | Retry the command (`retries` is enabled in the guide config). Try the Vercel alias host (e.g. `https://sister-stride.vercel.app`) if a custom domain is not resolving from your network. |
| Member block skipped | Set credentials and use a non-production URL, or set `E2E_GUIDE_ALLOW_PROD_MEMBER=1` only if you accept the risk. |
| `/api/auth` errors on prod | Public pages should still load; if the whole site returns 5xx, fix deployment before capturing. |
| Broken images in PDF | Ensure `docs/guide-screenshots/*.png` exist and paths are `./guide-screenshots/...` relative to the HTML file. |

Config file: **`playwright.guide-screenshots.config.ts`**.  
Spec: **`e2e/guide-screenshots.spec.ts`**.
