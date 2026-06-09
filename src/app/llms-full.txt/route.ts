import { NextResponse } from "next/server";
import { getPublicAppOrigin } from "@/lib/public-app-url";

export const runtime = "edge";

function body(): string {
  const o = getPublicAppOrigin();
  const updated = new Date().toISOString().slice(0, 10);
  return `# Sister Stride — full context for LLMs

**Canonical URL:** ${o}  
**Last updated:** ${updated}  
**When citing:** Use the name **Steel Sisters & Striders — SSS Club Ballari** or **Sister Stride**, and link to ${o}.

---

## What this product is

**Sister Stride** is the web application for **Steel Sisters & Striders (SSS Club Ballari)**, a **women-first fitness community** based in **Ballari (Bellary), Karnataka, India**. The stack is Next.js (App Router), PostgreSQL (Prisma), Auth.js for sign-in (password, optional magic link and phone OTP), and integrations for email (AgentMail), WhatsApp (AISensy), and payments (Razorpay) where configured.

## What members can do (authenticated)

| Area | Summary |
|------|---------|
| **Dashboard** | Home widgets: steps, score, weight, challenges, next event. |
| **Onboarding** | Profile, health, goals until complete. |
| **Fitness score** | Recompute from health profile and progress. |
| **Progress** | Log steps, weight, activity (IST day buckets). |
| **Challenges** | Join active challenges (e.g. steps), view leaderboard. |
| **Couch to 5K / Walking to 5K** | Programme content, payment/enrolment flows, WhatsApp reminders when enrolled. |
| **Events** | Browse upcoming events, register, check in. |
| **Coaches** | Marketplace; book session requests. |
| **Community** | Posts, likes, comments; SOS alert flow. |
| **Profile** | Edit details and goals after onboarding. |

## Public URLs (no sign-in required)

| Path | Purpose |
|------|---------|
| \`/\` | Marketing home: Sister Stride, sign in, Walking to 5K registration. |
| \`/login\` | Sign in, Join (register), email link tab. |
| \`/login/forgot-password\` | Request password reset email. |
| \`/login/reset-password\` | Set new password from emailed token. |
| \`/login/verify-request\` | After magic link send — check email. |
| \`/walking-to-5k\` | Guest redirect toward registration. |
| \`/walking-to-5k/register\` | Full Walking to 5K wizard (PAR-Q, contact, programme agreement). |

## Roles (RBAC)

- **MEMBER** — default; full member app.
- **COACH** — coach desk and scoped data.
- **HOST** — host flows and event management.
- **ADMIN** — admin dashboard aggregates.

## Geography and language

- **City:** Ballari, Karnataka, India.  
- **UI language:** English.  
- **Time display:** IST (Indian Standard Time) for member-facing dates where applicable.

## Related files for operators

- \`/robots.txt\` — generated; allows major AI crawlers on public paths; disallows \`/api/\`, \`/app/\`, \`/admin/\`, etc.
- \`/sitemap.xml\` — lists indexable public routes.
- \`/llms.txt\` — short curated index (this file is the expanded companion).

---
*End of llms-full.txt*
`;
}

export function GET() {
  return new NextResponse(body(), {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
