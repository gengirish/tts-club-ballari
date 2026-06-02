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
| **ADMIN** | `beta.admin@sss-club.example.com` | `beta_admin` | `/admin` dashboard |
| **COACH** | `beta.coach@sss-club.example.com` | `beta_coach` | `/coach` desk (seeded `Coach` row) |
| **HOST** | `beta.host@sss-club.example.com` | `beta_host` | `/host` flows |

## How to sign in

1. Open **`/login`** → **Password** tab.  
2. Enter **email** or **username** (case-insensitive for username).  
3. Enter **`BetaTest@2026!`**.

OTP is **not** required for these accounts.

## Apply seed to your database

```bash
# Ensure DATABASE_URL points at the DB you want (local, staging, or a dedicated beta Supabase)
npm run db:push    # if schema not yet applied
npm run db:seed
```

Re-running **`db:seed`** is **safe**: beta users are **upserted** by email; passwords reset to the value above; goals are reset to one `WALKING_HABIT` row.

## If “sign up” still fails for real testers

- Prefer **Password** tab with a seeded account above, or register with a **new** email not in this table.  
- Validation errors now return a readable **`error.message`** (and `error.details` for fields).  
- Usernames: letters, numbers, **`.`**, underscore — no spaces (see `registerSchema` in `src/lib/validation/auth.ts`).

## Related

- [E2E_PLAYWRIGHT.md](./E2E_PLAYWRIGHT.md) — automation uses separate `E2E_TEST_*` env vars, not these beta accounts.
- [DEPLOYED_URLS.md](./DEPLOYED_URLS.md) — where the app is hosted.
