# Deployed URLs — SSS Club Ballari

Single place for **public** deployment endpoints used by IntelliForge / this scaffold.  
If you fork the repo or use different Fly app names, update this file (and **`AUTH_URL`** / `PROXY_API_TO` in Vercel) to match your own hosts.

## Production

| Surface | URL | Notes |
|--------|-----|--------|
| **Primary domain (custom)** | [https://sister-stride.intelliforge.tech](https://sister-stride.intelliforge.tech/) | **User-facing production.** Configure this domain on the Vercel project, then set **`AUTH_URL`** (and any `NEXTAUTH_URL`-style vars) to **`https://sister-stride.intelliforge.tech`** — same origin as sessions and cookies. |
| **Web app (Vercel alias)** | [https://sister-stride.vercel.app](https://sister-stride.vercel.app) | Vercel production alias for the Next.js app (UI + `/api/*` when **not** proxying to Fly). Useful for smoke tests; prefer the custom domain for auth and webhooks in production. |
| **Optional API on Fly** | [https://sss-club-api.fly.dev](https://sss-club-api.fly.dev) | HTTP app from `Dockerfile` + `fly.toml` (`app = "sss-club-api"`). Used only when Vercel **`PROXY_API_TO`** points here so `/api/*` is served from Fly. |
| **BullMQ worker (Fly)** | *no public URL* | App `sss-club-worker` (`fly.worker.toml`). Consumes Redis queues only — not reachable from the browser. |

## Webhooks & third parties

Point inbound webhooks at the **same origin users use in the browser** — with the custom domain live, that is the IntelliForge host:

| Integration | Example URL |
|-------------|-------------|
| **AgentMail inbound** | `https://sister-stride.intelliforge.tech/api/webhooks/agentmail` |
| **Razorpay webhooks** | `https://sister-stride.intelliforge.tech/api/webhooks/razorpay` |

If you are testing **without** the custom domain, swap the host for `https://sister-stride.vercel.app` (must match **`AUTH_URL`** for that environment).

## Preview & CLI deployments

- **Git branch / PR previews:** Vercel assigns a unique `https://<deployment>-<team>.vercel.app` URL per deployment. See the **Deployments** tab in the Vercel project.
- **CLI `vercel deploy --prod`:** Output prints the deployment URL; production is still aliased to **`https://sister-stride.vercel.app`** and the custom domain **`https://sister-stride.intelliforge.tech`** when both are configured on the project.

## E2E against production

```bash
PLAYWRIGHT_BASE_URL=https://sister-stride.intelliforge.tech npm run test:e2e
```

(Adjust base URL for a Vercel preview deployment or the `.vercel.app` alias if needed.)

## Related docs

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Vercel-first flow, CI, Fly worker CD.
- [DATABASE_ENV.md](./DATABASE_ENV.md) — `DATABASE_URL` + `DIRECT_URL` (local, Vercel, Neon / Prisma).
- [E2E_PLAYWRIGHT.md](./E2E_PLAYWRIGHT.md) — local vs remote test setup.
