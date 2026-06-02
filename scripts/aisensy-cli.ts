/**
 * SSS Club — AISensy helper CLI (not an official AiSensy product).
 * WhatsApp templates + API campaigns must still be created in the AiSensy dashboard;
 * this tool validates env and hits the same campaign API the app uses.
 *
 * Usage:
 *   npm run aisensy -- env
 *   npm run aisensy -- ping --to +9198XXXXXXXX
 *   npm run aisensy -- ping --to +9198XXXXXXXX --code 424242
 *   npm run aisensy -- ping --campaign my_otp_campaign --to +91... --code 111111
 */

import { parseArgs } from "node:util";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sendWhatsApp } from "../src/integrations/aisensy/client";
import {
  AisensyTemplates,
  AISENSY_DEFAULT_CAMPAIGN_NAMES,
  getAisensyOtpCampaignName,
} from "../src/integrations/aisensy/templates";
import { toE164 } from "../src/lib/utils/phone";

function loadDotEnv(): void {
  const p = resolve(process.cwd(), ".env");
  if (!existsSync(p)) return;
  const raw = readFileSync(p, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const withoutExport = trimmed.startsWith("export ") ? trimmed.slice(7).trimStart() : trimmed;
    const eq = withoutExport.indexOf("=");
    if (eq <= 0) continue;
    const key = withoutExport.slice(0, eq).trim();
    let val = withoutExport.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function maskKey(k: string | undefined): string {
  if (!k) return "(unset)";
  if (k.length <= 8) return "****";
  return `${k.slice(0, 4)}…${k.slice(-4)} (${k.length} chars)`;
}

async function cmdEnv(): Promise<void> {
  const url = process.env.AISENSY_API_URL ?? "https://backend.aisensy.com/campaign/t1/api/v2";
  console.log("AISensy / WhatsApp campaign API (read from process.env, .env merged if present)\n");
  console.log(`  AISENSY_API_KEY     ${maskKey(process.env.AISENSY_API_KEY)}`);
  console.log(`  AISENSY_API_URL     ${url}`);
  console.log(`  AISENSY_CAMPAIGN_OTP              ${process.env.AISENSY_CAMPAIGN_OTP ?? "(default) " + getAisensyOtpCampaignName()}`);
  console.log(
    `  AISENSY_CAMPAIGN_EVENT_REMINDER   ${process.env.AISENSY_CAMPAIGN_EVENT_REMINDER ?? "(default) " + AISENSY_DEFAULT_CAMPAIGN_NAMES.eventReminder}`
  );
  console.log(
    `  AISENSY_CAMPAIGN_CHALLENGE_NUDGE  ${process.env.AISENSY_CAMPAIGN_CHALLENGE_NUDGE ?? "(default) " + AISENSY_DEFAULT_CAMPAIGN_NAMES.challengeNudge}`
  );
  console.log(
    `  AISENSY_CAMPAIGN_C25K_SESSION      ${process.env.AISENSY_CAMPAIGN_C25K_SESSION ?? "(default) " + AISENSY_DEFAULT_CAMPAIGN_NAMES.c25kSession}`
  );
  if (!process.env.AISENSY_API_KEY?.trim()) {
    console.error("\nMissing AISENSY_API_KEY. Copy from AiSensy → API Key in the dashboard.");
    process.exitCode = 1;
  }
}

async function cmdPing(opts: {
  to: string;
  code: string;
  campaign?: string;
}): Promise<void> {
  if (!process.env.AISENSY_API_KEY?.trim()) {
    console.error("AISENSY_API_KEY is not set. Run: npm run aisensy -- env");
    process.exitCode = 1;
    return;
  }
  const dest = toE164(opts.to);
  if (!dest) {
    console.error(`Invalid phone for India/E.164: ${opts.to}`);
    process.exitCode = 1;
    return;
  }
  const code = opts.code.replace(/\D/g, "").padStart(6, "0").slice(0, 6);
  if (code.length !== 6) {
    console.error("--code must yield 6 digits after normalisation.");
    process.exitCode = 1;
    return;
  }

  const tpl = opts.campaign
    ? { campaignName: opts.campaign, templateParams: [code] as [string] }
    : AisensyTemplates.otpLogin(code);

  console.log(`POST campaign API → campaignName=${tpl.campaignName} destination=${dest}`);
  const res = await sendWhatsApp({
    campaignName: tpl.campaignName,
    destination: dest,
    userName: "SSS CLI test",
    templateParams: tpl.templateParams,
    tags: ["cli-test", "otp"],
  });

  console.log(`HTTP ${res.status} success=${res.success}`);
  console.log(JSON.stringify(res.body, null, 2));
  if (!res.success) process.exitCode = 1;
}

function printHelp(): void {
  console.log(`SSS Club — AISensy CLI (connectivity + OTP test send)

There is no official "aisensy" npm binary from AiSensy. Templates and API campaigns
are configured in the AiSensy web app; this CLI only calls the public campaign API.

Commands:
  env   Print AISensy-related env (API key masked). Exits 1 if AISENSY_API_KEY missing.
  ping  Send one API campaign message (default: OTP template, one body variable = code).

Ping options:
  --to, -t       E.164 or Indian mobile (required)
  --code         6-digit test code (default: 424242) — must match template {{1}} order
  --campaign, -c Override campaign name (must be Live in AiSensy and match template arity)

Examples:
  npm run aisensy -- env
  npm run aisensy -- ping --to "+91 98765 43210"
  npm run aisensy -- ping -t +919876543210 --code 999001
`);
}

async function main(): Promise<void> {
  loadDotEnv();

  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      to: { type: "string", short: "t" },
      code: { type: "string", default: "424242" },
      campaign: { type: "string", short: "c" },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  if (values.help || positionals.length === 0) {
    printHelp();
    return;
  }

  const cmd = positionals[0];
  if (cmd === "env") {
    await cmdEnv();
    return;
  }
  if (cmd === "ping") {
    const to = values.to;
    if (!to) {
      console.error("ping requires --to (+91…)\n");
      printHelp();
      process.exitCode = 1;
      return;
    }
    await cmdPing({
      to,
      code: values.code ?? "424242",
      campaign: values.campaign,
    });
    return;
  }

  console.error(`Unknown command: ${cmd}\n`);
  printHelp();
  process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
