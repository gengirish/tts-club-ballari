# Beta test accounts (seeded)

These users are created or refreshed by **`npm run db:seed`** (`prisma/seed.ts`).  
They have **password login** (email or username), **`passwordHash`**, a **HealthProfile**, and at least one **MemberGoal**, so `/app` does **not** redirect to onboarding.

## Shared password (all accounts)

| Field | Value |
|--------|--------|
| **Password** | `BetaTest@2026!` |

**Security:** Do **not** use this file’s password on a production database with real member data. Rotate passwords or delete beta users before go-live. `example.com` addresses are reserved and cannot receive mail.

## Accounts

| Role | Email (sign in) | Username (alternate sign in) | Use for |
|------|-----------------|------------------------------|--------|
| **MEMBER** | `beta.member1@sss-club.example.com` | `beta_ballari_1` | Member app, challenges, progress |
| **MEMBER** | `beta.member2@sss-club.example.com` | `beta_ballari_2` | Second member (community, etc.) |
| **ADMIN** | `beta.admin@sss-club.example.com` | `beta_admin` | `/admin` dashboard; **`/admin/members`** directory |
| **COACH** | `beta.coach@sss-club.example.com` | `beta_coach` | `/coach` desk (seeded `Coach` row) |
| **HOST** | `beta.host@sss-club.example.com` | `beta_host` | `/host` flows |

## How to sign in

1. Open **`/login`** → **Password** tab.  
2. Enter **email** or **username** (case-insensitive for username).  
3. Enter **`BetaTest@2026!`**.

OTP is **not** required for these accounts.

## Apply seed to your database

```bash
# Copy .env.example → .env and set DATABASE_URL + DIRECT_URL (Prisma requires both). See docs/DATABASE_ENV.md.
# npm run db:seed loads .env automatically via dotenv.
npm run db:push    # if schema not yet applied
npm run db:seed
```

Re-running **`db:seed`** is **safe**: beta users are **upserted** by email; passwords reset to the value above; goals are reset to one `WALKING_HABIT` row.

## Fresh beta round (recommended before each test pass)

Use a **dedicated beta / staging database** (not production with real members). This removes every user whose email ends with **`@sss-club.example.com`**, deletes events they host, clears the sample **10,000 Steps** challenge (so leaderboard joins start clean), and clears **magic-link tokens**, **OTP rows**, and **notification logs** app-wide. Then it re-seeds programs, badges, the challenge, and beta accounts.

```bash
npm run db:seed:reset
```

PowerShell alternative:

```powershell
$env:SEED_RESET="1"; npm run db:seed
```

**Optional — wipe the entire community feed** (all posts; likes and comments cascade). Only for a DB where you are happy to delete every `CommunityPost`:

```bash
# argv
npx tsx prisma/seed.ts --reset --wipe-community

# or env
$env:SEED_WIPE_COMMUNITY="1"; $env:SEED_RESET="1"; npm run db:seed
```

**Not removed:** other users (e.g. real Gmail sign-ups), `Program` / `Badge` rows, enrollments or data owned only by non-beta users.

## Full wipe before a user demo (empty DB → re-seed)

Use only on a **staging / demo** Postgres you are allowed to erase. This **truncates every application table** (all users, events, enrollments, community, OTP, notification logs, etc.), keeps **`_prisma_migrations`** intact, then you run **`db:seed`** to restore programs, badges, the sample challenge, and beta accounts.

**Local database:**

```bash
npm run db:wipe -- --confirm
npm run db:seed
```

**Hosted database** (Neon, Supabase, … — anything not `localhost` / `127.0.0.1`):

```bash
# bash
I_ACCEPT_DATA_LOSS_ON_REMOTE_DB=1 npx tsx scripts/wipe-all-application-data.ts --confirm && npm run db:seed
```

```powershell
$env:I_ACCEPT_DATA_LOSS_ON_REMOTE_DB = "1"
npm run db:wipe -- --confirm
npm run db:seed
Remove-Item Env:I_ACCEPT_DATA_LOSS_ON_REMOTE_DB
```

For a throwaway branch you can also use your provider’s **branch reset** or `npx prisma migrate reset` (drops and recreates the schema — use only when you use migrations, not `db push` alone).

## Set password for a real email (no `passwordHash` yet)

If someone has a `User` row (e.g. created manually or via a flow that did not set a password) but **Password** login always fails with “Invalid email/username or password”, their `passwordHash` may be null. From a machine with `DATABASE_URL` pointing at the right database:

```bash
npm run db:set-password -- gen.girish@gmail.com 'TheirNewSecurePass123!'
```

This runs `scripts/set-password-for-email.ts` (same bcrypt as registration). For production, only run this from a trusted environment with the production connection string.

## If “sign up” still fails for real testers

- Prefer **Password** tab with a seeded account above, or register with a **new** email not in this table.  
- Validation errors now return a readable **`error.message`** (and `error.details` for fields).  
- Usernames: letters, numbers, **`.`**, underscore — no spaces (see `registerSchema` in `src/lib/validation/auth.ts`).

## Related

- [DATABASE_ENV.md](./DATABASE_ENV.md) — local `.env`, Vercel, Neon / pooled + direct URLs.
- [BETA_TEST_PLAN.md](./BETA_TEST_PLAN.md) — structured checklist and exit criteria for the beta round.
- [E2E_PLAYWRIGHT.md](./E2E_PLAYWRIGHT.md) — automation uses separate `E2E_TEST_*` env vars, not these beta accounts.
- [DEPLOYED_URLS.md](./DEPLOYED_URLS.md) — where the app is hosted.
