# AISensy end-to-end setup (SSS Club)

AiSensy does **not** ship an official open-source CLI to create WhatsApp templates or API campaigns. Meta still approves template text in the BSP flow, and AiSensy exposes a **dashboard** plus the **HTTP campaign API** your app already calls.

This repo adds **`npm run aisensy`** — a small **operator CLI** that:

1. Prints effective AISensy-related environment variables (API key masked).
2. Sends a **test** API campaign hit (same JSON as production) so you can confirm the campaign is **Live**, the API key works, and `{{1}}` matches your OTP template.

---

## A — Dashboard (required once per environment)

Do this in the [AiSensy](https://aisensy.com) web app (exact menu labels can change; intent is stable):

1. **WhatsApp Business API** — complete WABA onboarding until messaging is live.
2. **Template message (OTP)**  
   - Manage → Template messages → **+ New** (or pick an auth/OTP template from the library).  
   - Body must expose **one** dynamic placeholder for the code: `{{1}}` (ordering must start at `{{1}}` per Meta rules).  
   - Submit and wait until status is **APPROVED**.
3. **API campaign**  
   - Campaigns → **+ Launch** → **API Campaign**.  
   - Attach the approved OTP template.  
   - Set **Campaign name** to the value you will put in `AISENSY_CAMPAIGN_OTP` (default in code: `tts_otp_login` — use your own name if you prefer, then set env).  
   - Turn the campaign **Live**.
4. **API key** — copy from the AiSensy dashboard (often under API / Developer) into `AISENSY_API_KEY` in `.env`.

Repeat similarly for event reminder, challenge nudge, and C25K templates if you use those workers — parameter order must match `src/integrations/aisensy/templates.ts`.

Official reference: [API Reference Docs | Automate WhatsApp Campaigns](https://aisensy.com/tutorials/api-reference-docs).

---

## B — Local env

From the repo root:

```bash
cp .env.example .env
# Fill AISENSY_API_KEY, and campaign names if they differ from defaults.
```

---

## C — CLI (connectivity + OTP test)

```bash
npm run aisensy -- env
npm run aisensy -- ping --to "+91 9XXXXXXXXX"
# Optional: explicit test code (still one body variable {{1}})
npm run aisensy -- ping -t +919876543210 --code 999001
# If your Live campaign name differs from env default:
npm run aisensy -- ping -t +919876543210 --campaign my_live_otp_campaign --code 424242
```

The CLI loads `.env` from the project root when present (simple `KEY=value` lines; no multiline values).

**Success:** HTTP 200 and JSON body indicating acceptance (exact shape varies). You should receive one WhatsApp message with the test code.

**Failure:** HTTP 4xx/5xx or `success: false` — compare `campaignName` to the **Live** API campaign name in the dashboard, confirm template variable count, and confirm `AISENSY_API_KEY`.

---

## D — App wiring

- Runtime sends OTP via `POST` to `AISENSY_API_URL` (default `https://backend.aisensy.com/campaign/t1/api/v2`) with `AisensyTemplates.otpLogin` in `src/server/auth/otp.ts`.
- After CLI works, use **Login → Phone OTP** on `/login` with a real number (respect rate limits if `REDIS_URL` is set).

---

## E — Optional second channel

SMS (e.g. MSG91, Twilio India) or email OTP is **not** in this scaffold. It would be a separate provider, templates, and compliance path; keep WhatsApp as primary for India-first phone login unless product requires otherwise.
