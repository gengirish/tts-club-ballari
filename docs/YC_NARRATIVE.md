# YC-style narrative memo — Sister Stride (SSS Club Ballari)

**Purpose:** One place to align product bets with how a serious seed partner (including YC-style interviews) would **repeat your story in 30 seconds**. Keep this file **honest** — update numbers and claims as you measure them.

**Related:** [pitch-deck.md](./pitch-deck.md) (slides), [MASTER_PROMPT_PRODUCT_DEVELOPMENT.md](./MASTER_PROMPT_PRODUCT_DEVELOPMENT.md) (build law), [DEPLOYED_URLS.md](./DEPLOYED_URLS.md) (production hosts).

---

## The one-liner

**Sister Stride** is the women-first **club operating system** for tier-2 India: phone-first auth, coach- and host-scoped community, structured programs (e.g. Couch to 5K), events, and payments — with **WhatsApp and email as nudge surfaces**, not as the system of record.

---

## Problem (why it hurts)

- **Trust and safety** — Mixed spaces and chaotic chat groups fail as a reliable accountability layer for women who want to move more.
- **Fragmentation** — Plans, payments, RSVPs, and progress live across chats and ad hoc tools; momentum dies in the gaps.
- **Global apps misfit** — Price, language comfort, coach relationships, and **phone-first** behaviour are under-served by generic wellness products.

*Pitch anchor:* 1–2 anonymised stories from Ballari (see pitch deck Slide 2).

---

## Insight (what you are actually selling)

The product is **not** “track steps.” It is **belonging + a credible plan + a nudge where she already is** (phone, WhatsApp templates, Sunday group rhythm).

---

## Solution (what shipped / shipping)

- **Member loop:** Onboarding, progress, fitness score, challenges, community, programs (C25K + Razorpay), SOS/community safety tie-ins.
- **Trust layer:** Auth.js RBAC, coach/host capabilities, validated APIs (Zod + `ApiResponse`), India-first money/time/phone conventions (see `.cursorrules`).
- **Ops layer:** BullMQ for side-effect notifications; webhooks for AgentMail and Razorpay; production on Vercel with custom domain documented in DEPLOYED_URLS.

---

## Beachhead and expansion thesis (answer the TAM objection)

| Layer | Claim |
|-------|--------|
| **Beachhead** | Women pursuing structured walking/running, challenges, and coach-led programs in **Ballari** (and psychographically similar tier-2 cities). |
| **Lab city framing** | Ballari is the **proof lab** for cohort retention, paid program completion, and coach-led ops — not the ceiling. |
| **Expansion** | Repeat the **Steel Sisters playbook**: local hosts, cohort-based ops, paid programs, same stack — **city by city** or **corridor by corridor** once unit economics are visible. |

Avoid slides that are only “global wellness TAM $XB” without a **narrow, defensible wedge** and a **repeatability** story (pitch deck Slide 7).

---

## North-star metric (pick one and defend it)

Choose **one** primary metric for the next 90 days; everything else supports it.

| Candidate | Why it matters |
|-----------|----------------|
| **Weekly active members completing a meaningful action** | Proves habit, not vanity signups. |
| **Paid C25K seat → week 4 still active** | Proves program + coach + nudges work. |
| **7-day return after first event or challenge join** | Proves community loop. |

**Rule:** Define the denominator (e.g. “enrolled in C25K batch X”) and the window (e.g. “IST week bucket”) in one sentence so investors can compare cohorts.

---

## Moat (early, candid)

- Regional **brand + trust**; coach and host relationships.
- **Operational playbooks** — AISensy template discipline, cohort calendar, graduation event.
- **Segment-specific behaviour** — what works for women-first, phone-first, India pricing — encoded in product and policy.

**Risk:** Moat is weak if you only ship features without **retention and repeat purchase** proof.

---

## Risks to name before they do

1. **Geographic concentration** — Mitigate with second-city or second-anchor playbook on paper + one experiment.
2. **WhatsApp dependency** — Mitigate with compliant template strategy and in-app value (programs, events, progress) as home base.
3. **Coach supply** — Mitigate with clear host/coach tooling and payout clarity (document in pitch Slide 8 when numbers exist).

---

## 90-day proof plan (fill brackets)

| Week band | Ship / prove |
|-----------|----------------|
| 0–30 | [ ] Onboarding → first progress log → first challenge or event path · [ ] One paid C25K batch closed |
| 31–60 | [ ] Cohort midpoint retention vs baseline · [ ] NPS or 5 qualitative interviews transcribed |
| 61–90 | [ ] Repeat batch or second revenue line (event ticket volume) · [ ] One “playbook export” artefact for expansion |

---

## YC-style partner soundbite (30 seconds)

Use after tightening numbers in [pitch-deck.md](./pitch-deck.md) Slide 9:

> “Women’s fitness in tier-2 India breaks on trust and fragmentation — not intent. We’re **Sister Stride**: the club OS with phone login, coach-led programs, and WhatsApp nudges, starting in **Ballari**. In the last **[period]** we **[metric]** and **[metric]**; the next **[period]** we prove **[north star]**. We’re raising **[amount]** to **[use of funds]**.”

---

## When this doc is “done enough”

- [ ] North-star metric chosen and **measured weekly** (internal dashboard or spreadsheet is fine at first).
- [ ] One expansion thesis paragraph is **true** (even if not yet executed).
- [ ] Pitch deck Slide 9 has **real or explicitly pre-revenue** numbers — no placeholder adjectives.

*Version: 1.0 · Internal memo; not legal or financial advice.*
