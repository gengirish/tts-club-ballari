# CI/CD — versioning and production rollback

**Goal:** Every production release is **identifiable** and **reversible** if something breaks on live prod.

**Context:** Next.js on **Vercel** (Git integration); BullMQ worker on **Fly.io** (`.github/workflows/deploy-fly-worker.yml`). CI: `.github/workflows/ci.yml`. Overview: [docs/CI_CD.md](../docs/CI_CD.md).

---

## Version identity (source of truth)

- **Immutable version = full Git SHA** (`git rev-parse HEAD` or `VERCEL_GIT_COMMIT_SHA` on Vercel builds). This is what maps a running deployment to exact code.
- **`package.json` version** is optional for humans/marketing; it can drift from what is deployed unless you bump it in CI on release tags.
- **Git tags** (e.g. `v1.2.0`) help audits and comms; tag the same commit that Vercel/Fly deployed.

### Optional improvements (backlog)

- [ ] At build time, expose commit SHA in the app (e.g. env `NEXT_PUBLIC_APP_GIT_SHA` from Vercel’s system env, or a small `/api/health` that returns SHA + build time for support).
- [ ] On release tags, run a lightweight workflow that records tag + SHA in release notes or a changelog file.

---

## Roll back the web app (Vercel)

- Vercel keeps **deployment history** for the project.
- **Instant rollback / promote previous deployment** restores the last known good **production** deployment without a new Git commit.
- **Prevention:** use **preview deployments** on PRs and keep `main` protected so prod only moves when you intend it to.

---

## Roll back the worker (Fly.io)

- Fly keeps **release history**; **roll back** to the prior release when queue/notifications/worker logic is the culprit.
- Worker deploys only run when certain paths change (see workflow `paths`), so **web and worker can be on different commits**. In a bad release, treat rollback as **two surfaces**: Vercel + Fly, ideally both pinned to the same “known good” commit when you redeploy.

### Optional improvements (backlog)

- [ ] Add a **manual** GitHub Action: `workflow_dispatch` input `git_ref` (SHA or tag) → checkout → `flyctl deploy` so rollback does not depend on local machines.
- [ ] Document the Fly app name and where to click in the Fly dashboard for rollback (link in [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) if that file is the ops hub).

---

## Database (Prisma) caveat

Rolling back **application** code does **not** undo **schema or data** migrations.

- Prefer **backward-compatible** migrations (expand → deploy app → contract) so old binaries still work if you revert Vercel.
- If a revert would leave DB and code incompatible, plan a **forward fix** or a **dedicated migration rollback** strategy (often manual and risky); do not assume “git revert” alone fixes prod.

---

## CI/CD quality gate (already in repo)

- Lint, typecheck, build, and public Playwright smoke on `main` / `master` help ensure only green commits merge; keep production tied to that branch per Vercel project settings.

---

## Incident checklist (when prod is broken)

1. Identify **surface**: web only, worker only, or both (and whether DB changed).
2. **Vercel:** rollback/promote previous production deployment.
3. **Fly:** rollback worker release if jobs/notifications are involved.
4. Confirm **AUTH_URL** / env and **DB** compatibility with the rolled-back code.
5. Post-mortem: add a test or a migration guard so the same failure is caught earlier.
