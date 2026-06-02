# Deployment (IntelliForge / HRMS-style)

**Live URLs:** [docs/DEPLOYED_URLS.md](./DEPLOYED_URLS.md) (Vercel production, optional Fly API, webhooks).

SSS Club follows the same **broad pattern as IntelliForge HRMS** (`hrms-intelliforge`: Vercel-first Next.js app, minimal local Docker) and **AwaazOS-style CI** (GitHub Actions quality gates).

## What runs where

| Surface | Default host | Notes |
|--------|----------------|-------|
| **Web + `/api/*`** | **Vercel** | Connect the GitHub repo in the Vercel dashboard. Every push to the production branch builds and deploys automatically. **You do not need local Docker for the Next.js app.** |
| **BullMQ worker** | **Fly.io** (`fly.worker.toml` → `Dockerfile.worker`) | Long-lived TCP to Redis + job processing. **Deploy from CI** (see below) or `fly deploy --config fly.worker.toml` if you prefer the CLI. |
| **Optional API split** | Fly `Dockerfile` + `fly.toml` | Only if you set `PROXY_API_TO` on Vercel so `/api/*` is proxied to a separate Fly app. **Most teams can skip this** and run all routes on Vercel like HRMS. |

## 1. Vercel (primary path)

1. Import the GitHub repository in [Vercel](https://vercel.com).
2. Set **Environment variables** from `.env.example` (database, `AUTH_SECRET`, `AUTH_URL`, Redis if enqueueing from serverless, AISensy, AgentMail, Razorpay, etc.).
3. Production branch: **`main`** or **`master`** (match your repo default).
4. Merge to that branch → **Vercel builds and deploys** (no `docker build` on your laptop).

Optional CLI for a synchronous production URL or promotions:

```bash
vercel deploy --prod --yes
```

## 2. GitHub Actions CI (required pattern)

Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

On every push / pull request to `main` or `master`:

- `npm ci` → `prisma db push` (against a CI Postgres service) → `npm run lint` → `npm run typecheck` → `npm run build`.

This matches the **quality gate** mindset from HRMS / AwaazOS: merge only when CI is green. No Docker Compose required on the developer machine for CI.

## 3. Fly worker via CI/CD (optional)

Workflow: [`.github/workflows/deploy-fly-worker.yml`](../.github/workflows/deploy-fly-worker.yml)

1. **Repository secret:** `FLY_API_TOKEN` — create with `fly tokens create deploy -x 8760h` (or Fly dashboard).
2. **Repository variable:** `FLY_DEPLOY_ENABLED` = `true` — gates the job so repositories without Fly configured do not fail the workflow.
3. On **push** to `main` / `master` that touches worker-related paths, or on **manual** “Run workflow”, GitHub runs `flyctl deploy --remote-only --config fly.worker.toml` (build happens on Fly’s builders — **no local Docker**).

First-time Fly setup (once): create the app and secrets on Fly (`fly apps create`, `fly secrets set …`) as in the main README; afterwards rely on Actions for routine deploys.

## 4. Optional Fly API app

If you use `PROXY_API_TO`, deploy the API image with Fly when you change server code that must run on Fly. There is **no** required GitHub Action for this path in this repo; you can add one mirroring `deploy-fly-worker.yml` or deploy manually. Prefer **Vercel-only** APIs unless you have a concrete reason to split.

## 5. Local development

- `npm run dev` — Next.js.
- `npm run worker` — worker in a second terminal (local Redis).
- **Docker** is optional locally; it is used by Fly’s remote builders when you deploy via `flyctl` or Actions.

## 6. `next.config.mjs` and standalone output

`output: "standalone"` is enabled only when `NEXT_STANDALONE_OUTPUT=1` (set in the **API** `Dockerfile` builder stage) so local Windows `npm run build` avoids flaky standalone trace copies. **Vercel** sets `VERCEL=1` and does not use standalone. HRMS-style Vercel deploys use the default Vercel builder.
