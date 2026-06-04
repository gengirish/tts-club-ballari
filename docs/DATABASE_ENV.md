# Database environment — Postgres (Neon & others)

Prisma requires **`DATABASE_URL`** and **`DIRECT_URL`** (`prisma/schema.prisma`, `.env.example`). Use this doc for **local `.env`**, **Vercel**, and **CI** so instructions stay in one place.

---

## 1. Local development

1. Copy **`.env.example`** → **`.env`** in the project root (`.env` is gitignored).
2. Set both variables for your provider (see [§2 Neon](#2-neon-pooled-vs-direct) or your host’s docs for two connection modes).
3. **`npx prisma db push`** — the Prisma CLI loads `.env` from the project root automatically.
4. **`npm run db:seed`** — runs `tsx prisma/seed.ts`, which loads `.env` via **`import "dotenv/config"`** (see `prisma/seed.ts` and the `dotenv` devDependency). You do **not** need to `export` URLs in the shell for seeding. **`npm run db:seed:reset`** runs the same script with **`--reset`** to tear down canonical beta users and re-seed (see [BETA_USERS.md](./BETA_USERS.md)).

**Supabase** or other managed Postgres: use whatever pair your provider documents for “pooler / transaction” vs “direct / session” URLs so both `DATABASE_URL` and `DIRECT_URL` are valid for that product.

---

## 2. Neon: pooled vs direct

| Variable | Neon dashboard | Purpose |
|----------|----------------|---------|
| **`DATABASE_URL`** | **Pooled** connection (hostname often contains `-pooler`) | App runtime, serverless-friendly. |
| **`DIRECT_URL`** | **Direct** connection (same user/db/password; hostname **without** `-pooler`) | Prisma migrations and operations that need a direct TCP session. |

Use the same database user/password in both strings unless Neon shows different roles (rare for a single branch).

**Security:** Never commit real URLs to git. Never paste live connection strings into GitHub issues, PRs, or public chat. If a URL was exposed, **rotate the database password** in Neon before relying on it.

---

## 3. Vercel production / preview

1. Open [Vercel](https://vercel.com) → your project → **Settings** → **Environment Variables**.
2. Add **`DATABASE_URL`** (Neon **pooled** URL) and **`DIRECT_URL`** (Neon **direct** URL) for **Production** (and **Preview** / **Development** only if those builds should talk to a real database — many teams use a separate Neon branch for previews).
3. **Redeploy** after changing secrets so the runtime picks them up.

### Vercel CLI

Requires `npx vercel login` and `npx vercel link` from the repo root.

```powershell
Set-Location path\to\sss-club
npx vercel env add DATABASE_URL production
npx vercel env add DIRECT_URL production
```

Repeat for `preview` / `development` if needed. To avoid putting secrets in shell history, pipe from a **temporary file outside the repo**, then delete the file:

```powershell
Get-Content $env:USERPROFILE\neon-database-url-pooled.txt -Raw | npx vercel env add DATABASE_URL production
Get-Content $env:USERPROFILE\neon-database-url-direct.txt -Raw | npx vercel env add DIRECT_URL production
Remove-Item $env:USERPROFILE\neon-database-url-pooled.txt, $env:USERPROFILE\neon-database-url-direct.txt
```

---

## 4. After the database is reachable

- Apply schema: **`npx prisma db push`** (or your migration workflow) against the target database.
- Optional: **`npm run db:seed`** for [beta test accounts](./BETA_USERS.md).

If **`POST /api/auth/register`** returns **`503`** with code **`DATABASE_UNAVAILABLE`**, the server cannot open a Prisma connection (missing or wrong **`DATABASE_URL` / `DIRECT_URL`** on Vercel, network, or Neon paused). Fix env vars and redeploy.

Neon’s copied URL may include **`channel_binding=require`**. The app **strips `channel_binding` at runtime** when building `PrismaClient` (`src/lib/prisma.ts`) so Prisma + Neon pooler stay compatible; you can also remove it from **`DATABASE_URL` / `DIRECT_URL`** in Vercel for consistency.

---

## 5. CI / Playwright

GitHub Actions and **`npm run test:e2e:seed`** need **`DATABASE_URL`** and **`DIRECT_URL`** in the environment (or in a loaded `.env`) because Prisma reads both from the schema. See [E2E_PLAYWRIGHT.md](./E2E_PLAYWRIGHT.md) for Playwright variables (`E2E_PASSWORD_EMAIL`, `E2E_PASSWORD`, optional `E2E_TEST_PHONE` for seed-only).

---

## Related

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Vercel-first deploy, CI, Fly worker.
- [DEPLOYED_URLS.md](./DEPLOYED_URLS.md) — production URL and `AUTH_URL`.
- [BETA_USERS.md](./BETA_USERS.md) — seeding beta users.
- [VERCEL_POSTGRES_ENV.md](./VERCEL_POSTGRES_ENV.md) — legacy filename; redirects here.
- `.env.example` — full app variable list (Auth, Redis, Razorpay, …).
