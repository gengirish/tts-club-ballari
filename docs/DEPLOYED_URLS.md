# Deployed URLs — SSS Club Ballari

Single place for **public** deployment endpoints used by IntelliForge / this scaffold.  
If you fork the repo or use different Fly app names, update this file (and `AUTH_URL` / `PROXY_API_TO` in Vercel) to match your own hosts.

## Production

| Surface | URL | Notes |
|--------|-----|--------|
| **Web app (Vercel)** | [https://sss-club.vercel.app](https://sss-club.vercel.app) | Production alias for the Next.js app (UI + `/api/*` when **not** proxying to Fly). Set **`AUTH_URL`** to this origin. |
| **Optional API on Fly** | [https://sss-club-api.fly.dev](https://sss-club-api.fly.dev) | HTTP app from `Dockerfile` + `fly.toml` (`app = "sss-club-api"`). Used only when Vercel **`PROXY_API_TO`** points here so `/api/*` is served from Fly. |
| **BullMQ worker (Fly)** | *no public URL* | App `sss-club-worker` (`fly.worker.toml`). Consumes Redis queues only — not reachable from the browser. |

## Webhooks & third parties

Point inbound webhooks at the **Vercel** origin (same host as the user session / cookies):

| Integration | Example URL |
|-------------|-------------|
| **AgentMail inbound** | `https://sss-club.vercel.app/api/webhooks/agentmail` |
| **Razorpay webhooks** | `https://sss-club.vercel.app/api/webhooks/razorpay` |

Replace the host if your production domain is a **custom domain** on the same Vercel project.

## Preview & CLI deployments

- **Git branch / PR previews:** Vercel assigns a unique `https://<deployment>-<team>.vercel.app` URL per deployment. See the **Deployments** tab in the Vercel project.
- **CLI `vercel deploy --prod`:** Output prints the deployment URL; production may still be aliased to `https://sss-club.vercel.app` when configured in the project.

## E2E against production

```bash
PLAYWRIGHT_BASE_URL=https://sss-club.vercel.app npm run test:e2e
```

(Adjust base URL if you use a preview deployment or custom domain.)

## Related docs

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Vercel-first flow, CI, Fly worker CD.
- [DATABASE_ENV.md](./DATABASE_ENV.md) — `DATABASE_URL` + `DIRECT_URL` (local, Vercel, Neon / Prisma).
- [E2E_PLAYWRIGHT.md](./E2E_PLAYWRIGHT.md) — local vs remote test setup.
