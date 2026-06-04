# CI/CD — SSS Club Ballari

This repo uses **GitHub Actions** for continuous integration and optional worker deployment. The **Next.js** app is intended for **Vercel** (Git-connected previews and production).

## Continuous integration (`.github/workflows/ci.yml`)

Runs on **push** and **pull requests** to `main` / `master`, and on **manual** runs (**Actions → CI → Run workflow**).

| Job | What it does |
|-----|----------------|
| **quality** | `npm ci` → Prisma `db push` against a CI Postgres service → `lint` → `typecheck` → `next build` |
| **e2e-smoke** | After **quality** passes: fresh Postgres + **Redis**, `db push`, then Playwright **`public`** project only (`e2e/public.spec.ts`, `e2e/password-login.spec.ts`). HTML report is uploaded as an artifact if the job fails. |

Workflow env vars (`AUTH_*`, `DATABASE_URL`, `REDIS_URL`, etc.) are **dummy values** suitable for build and local E2E only — never use them in production.

### Local parity

```bash
npm run lint && npm run typecheck   # same as the quality job (no Docker)
npm run build
```

Full browser E2E: [E2E_PLAYWRIGHT.md](./E2E_PLAYWRIGHT.md).

## Deploying the web app (Vercel)

1. Import the GitHub repository in the [Vercel dashboard](https://vercel.com/new).
2. Framework preset: **Next.js**. Root directory: repo root (where `package.json` lives).
3. Set production/preview **environment variables** to match `.env.example` (database URLs, `AUTH_SECRET`, Redis, AISensy, AgentMail, Razorpay, etc.). See [DATABASE_ENV.md](./DATABASE_ENV.md).
4. Each push gets a **preview deployment**; merges to the production branch promote per your Vercel project settings.

No custom GitHub Action is required for the web app if Vercel Git integration is enabled.

## Deploying the BullMQ worker (Fly.io)

Workflow: [deploy-fly-worker.yml](../.github/workflows/deploy-fly-worker.yml).

| Requirement | Purpose |
|-------------|---------|
| Repository **secret** `FLY_API_TOKEN` | `flyctl deploy` authentication |
| Repository **variable** `FLY_DEPLOY_ENABLED` = `true` | Gates deploy so forks without Fly access stay green |

Create a token (for example `fly tokens create deploy -x 8760h`) and add it under **Settings → Secrets and variables → Actions**.

The workflow runs on pushes that touch worker-related paths (see `on.push.paths` in the file) or via **Run workflow**.

## Troubleshooting

- **CI Postgres / Prisma**: The database segment in `DATABASE_URL` / `DIRECT_URL` must match `POSTGRES_DB` in `.github/workflows/ci.yml`.
- **Playwright failures**: Download the **playwright-report** artifact from the failed run’s job summary.
- **Fly deploy skipped**: Confirm `FLY_DEPLOY_ENABLED` is exactly `true` and the push matches the configured `paths` filters.
