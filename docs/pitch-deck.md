# Steel Sisters & Striders (SSS Club Ballari) — **Sister Stride**

**Pitch deck — Markdown source**

*Women-first fitness ecosystem · Ballari, India · IntelliForge · **Sister Stride** = consumer-facing product name (see Slide 1).*

Fill bracketed fields (`[like this]`) before sending to investors. Remove this note block from export if desired.

---

## Slide 1 — Title

**Sister Stride**  
*Women-first fitness — community, coaching, and progress in Ballari.*

**Formal / legal entity (footer or small type on title slide):**  
Steel Sisters & Striders (**SSS Club**)

**Tagline (pick one):**

- “Fitness built for women — where you live.”
- “Your club. Your pace. Your people.”
- “Your pace. Your people. Your proof.” *(global fitness tone)*

**Brand architecture (for designers & copy):**

| Layer | Use for |
|-------|---------|
| **Sister Stride** | App store, social, member-facing campaigns, English-first surfaces |
| **Steel Sisters & Striders (SSS Club)** | Legal, partnerships, press, “who we are” story |

**Footer:** [Founder names] · [Email] · [Phone] · [Website]

---

## Slide 2 — The problem

**Women’s fitness breaks in tier-2 India — not for lack of intent.**

- **Trust & safety:** Mixed gyms, informal routes, and chaotic WhatsApp groups do not provide a reliable, women-first accountability layer.
- **Fragmentation:** Schedules live in chats; payments and programs live elsewhere; progress is lost across tools.
- **Generic apps don’t fit:** Global products ignore local price sensitivity, coach relationships, language comfort, and **phone-first** behaviour.
- **Outcome:** Women start, stall alone, and drop — not from lack of motivation, but because the **system** is not built for them.

**Speaker note:** Anchor with 1–2 anonymised real stories from user interviews.

---

## Slide 3 — Insight

**The product is not “track steps.” The product is *belonging + a plan + a nudge where she already is*.**

- **WhatsApp + phone** are the real home surfaces for millions of women — not another app icon.
- **Local coaches and hosts** are the trust layer — not anonymous feeds.
- **Community challenges** turn solo effort into identity: *we are the ones who show up*.

---

## Slide 4 — Solution

**Sister Stride (SSS Club) — the operating system for a women-first fitness community.**

One place for:

- **Onboarding & health profile** — respectful, goal-oriented framing (not diet-shaming).
- **Daily progress** — steps, sleep, water, weight framed as wins.
- **Challenges & leaderboards** — social proof inside a bounded, safe circle.
- **Programs** — e.g. **Couch to 5K**: structure, coach touchpoints, reminders.
- **Events** — register, remind, check-in; hosts stay organised.
- **Payments** — flagship program priced at **₹1,499** (see product/seed); UPI-ready checkout via Razorpay.

**Investor one-liner:**  
We productise what strong women’s clubs already do in chats — and make it **measurable, monetisable, and scalable**.

---

## Slide 5 — Product (how it works)

**Three loops**

1. **Join** — Phone OTP, profile, goals (fast onboarding).
2. **Stay** — Dashboard, progress logging, challenges (weekly return reason).
3. **Pay** — Programs and events with Razorpay; clear receipts and pricing.

**Channels**

- WhatsApp: template-based OTP, reminders, nudges (24h window–compliant campaigns).
- Email: transactional and engagement where it helps (AgentMail).

**Diagram (for design):** Member experience ↔ Coach/Host tools ↔ Notification queue (BullMQ) ↔ Payments.

---

## Slide 6 — Why now

- **UPI / digital payments** — Low friction for cohort fees and event tickets.
- **Wellness & walking/running culture** — “First 5K” and club identity are mainstream post-COVID.
- **Underserved segment** — Strong demand outside metros; thin product layer for **women-first, local** fitness.
- **Data trust** — India’s privacy regime maturing; building **privacy-first** from day one supports later B2B and partnerships.

---

## Slide 7 — Market

**Beachhead:** Women pursuing structured walking/running, challenges, and coach-led programs in **[Ballari and comparable tier-2 cities]**.

**Expansion:** Replicate the **Steel Sisters playbook** — local hosts, cohort-based WhatsApp ops, paid programs, retention metrics — city by city.

**Sizing (replace with your research):**

- Bottom-up: `[cohorts per year] × [seats per cohort] × [average ticket]` = `[SAM segment]`.
- Avoid a slide that is only “global wellness TAM $XXB” without a narrow, defensible wedge.

---

## Slide 8 — Business model

**Near-term revenue**

- Paid programs (e.g. Couch to 5K–style cohorts).
- Events (ticketing and/or host fees).
- Coach-led packages (choose: **take rate per booking** or **SaaS per coach** — state one clearly).

**Unit economics (fill when measured)**

- Cohort size, price, coach payout, notification cost → gross margin per seat.

**Optional later (only if credible)**

- Corporate wellness, branded challenges, B2B2C via employers.

---

## Slide 9 — Traction & milestones

**If pre-launch / early scaffold (honest framing)**

- **Shipped today:** Auth (phone OTP primary; email/username + password supported), RBAC, Prisma data model, notification pipeline (BullMQ + templates), payments integration, core API patterns (Zod + `ApiResponse` envelope).
- **Next 60–90 days:** [N] onboarded members · [K] weekly actives · [M] paid seats · [retention definition, e.g. 7-day active].
- **Proof artefacts:** Real cohort screenshot, testimonial quotes, end-to-end payment demo.

**If you have live metrics — use:**

| Metric | Value |
|--------|--------|
| Registered / WAU | |
| Paid GMV or revenue | |
| Retention (define window) | |
| NPS or qualitative theme | |

---

## Slide 10 — Go-to-market

**Ballari-first**

- Anchor partnership: [running club / gym / named coach / host].
- Launch: **one flagship challenge** + **one paid program batch** with fixed start date.
- Referrals: simple “bring a sister” incentive.
- Content: first 5K stories, safety tips, coach spotlights — short-form + compliant WhatsApp use.

**Own one metric:** CAC to one **paying** cohort member (even rough early estimate).

---

## Slide 11 — Competition

| Segment | Limitation | Our edge |
|---------|--------------|----------|
| Global fitness apps | Generic; weak local trust | Women-first + coaches + community |
| WhatsApp-only groups | No product, payments, or progress | Structured app + same channels for nudges |
| Traditional gyms | Comfort, timing, flexibility | Hybrid digital + local events |

**Moat (early):** Regional brand and trust; coach relationships; operational playbooks (templates, cohort ops); segment-specific behaviour data.

---

## Slide 12 — Team

| Name | Role | One-line credibility |
|------|------|----------------------|
| [Name] | [CEO / Product / Tech] | |
| [Name] | [Ops / Community / Growth] | |

**Advisors (if any):** [Name — domain]

**Why us:** [Two bullets: lived insight, distribution, execution velocity.]

---

## Slide 13 — The ask

**Raising:** [₹X pre-seed / ₹Y seed] — pick a single round label.

**Use of funds**

| Area | Approx % | Purpose |
|------|------------|---------|
| Product & engineering | 40–50% | Core member, host, payment loops |
| Community & growth | 25–35% | Cohorts, coaches, partnerships |
| Compliance, support, infra | 15–25% | Notifications, reliability, policies |

**This round unlocks:** [e.g. X paying members · Y cohorts · second-city pilot by [date]].**

**Contact:** [email] · [phone]

---

## Appendix A — Product screenshots

1. Landing / value proposition  
2. Onboarding  
3. Dashboard  
4. Progress / score  
5. Challenge + leaderboard  
6. Program + checkout  
7. Event / host view  

*Add captions: what behaviour each screen drives.*

---

## Appendix B — Notifications & trust

- OTP and utility templates only where approved (AISensy).  
- No sensitive spam; logging to `NotificationLog` (product principle).  
- Health data: minimal collection, clear consent, secure storage (align with DPDP narrative).

---

## Appendix C — Roadmap (outcome-based)

| Horizon | Outcome |
|---------|---------|
| 0–3 mo | [Onboarding + dashboard + one paid cohort] |
| 3–6 mo | [Challenges at scale + host tools] |
| 6–12 mo | [Coach marketplace / second city — only if aligned with focus] |

---

## Appendix D — Risks & mitigations

| Risk | Mitigation |
|------|------------|
| WhatsApp template approval delays | Start auth + utility templates early; fallback SMS cost in model |
| Coach supply | Anchor coaches contractually; train hosts |
| Adoption vs chat habit | Cohort starts, reminders, social leaderboard |

---

## Related — accelerator / seed narrative

- **[YC_NARRATIVE.md](./YC_NARRATIVE.md)** — Partner-style one-pager: wedge, north-star metric, expansion thesis, risks. Update alongside Slide 9 traction.

---

## One-minute pitch (script)

“Millions of women want to get fitter but do not trust generic apps or mixed gyms. They already coordinate in WhatsApp — but that breaks for payments, progress, and structured programs. We go to market as **Sister Stride** — the women-first club OS from **Steel Sisters & Striders**: phone login, challenges, coach-led programs like Couch to 5K, and events, with WhatsApp and email where she already is. We are proving retention and paid cohorts in **Ballari**, then replicating the playbook in similar Indian cities. We are raising **[amount]** to **[hire / run cohorts / complete core product]** and reach **[milestone]** in **[timeframe].**”

---

## Export tips

- **Google Slides / Keynote:** One `##` section ≈ one slide; body bullets = slide bullets; appendix = backup slides.  
- **PDF:** Print or export deck; keep appendix separate for data-room follow-up.  
- **Versioning:** Save as `pitch-deck-YYYY-MM.md` when you lock a narrative for a specific investor meeting.

---

*Document version: 1.2 · Sister Stride consumer naming on Slide 1, Solution, and one-minute script. YC_NARRATIVE cross-link. Aligned with repo README product scope and India-first stack (paise, IST, E.164, Razorpay, Auth.js RBAC).*
