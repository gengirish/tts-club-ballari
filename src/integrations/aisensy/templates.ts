// Typed registry of approved AiSensy campaigns. Campaign names come from env
// so they can differ per environment. Build the templateParams in order.

const env = (k: string, fallback: string) => process.env[k] ?? fallback;

/** Defaults when env vars are unset (must match AiSensy “API Campaign” names you set Live). */
export const AISENSY_DEFAULT_CAMPAIGN_NAMES = {
  otpLogin: "sss_otp_login",
  eventReminder: "sss_event_reminder",
  challengeNudge: "sss_challenge_nudge",
  c25kSession: "sss_c25k_session",
} as const;

/** AISensy campaign name for login OTP (matches `NotificationLog.template`). */
export function getAisensyOtpCampaignName(): string {
  return env("AISENSY_CAMPAIGN_OTP", AISENSY_DEFAULT_CAMPAIGN_NAMES.otpLogin);
}

export const AisensyTemplates = {
  otpLogin: (code: string) => ({
    campaignName: getAisensyOtpCampaignName(),
    templateParams: [code],
  }),

  eventReminder: (eventTitle: string, whenIST: string, location: string) => ({
    campaignName: env("AISENSY_CAMPAIGN_EVENT_REMINDER", AISENSY_DEFAULT_CAMPAIGN_NAMES.eventReminder),
    templateParams: [eventTitle, whenIST, location],
  }),

  challengeNudge: (challengeTitle: string, progressLine: string) => ({
    campaignName: env("AISENSY_CAMPAIGN_CHALLENGE_NUDGE", AISENSY_DEFAULT_CAMPAIGN_NAMES.challengeNudge),
    templateParams: [challengeTitle, progressLine],
  }),

  c25kSession: (weekNo: string, sessionLine: string) => ({
    campaignName: env("AISENSY_CAMPAIGN_C25K_SESSION", AISENSY_DEFAULT_CAMPAIGN_NAMES.c25kSession),
    templateParams: [weekNo, sessionLine],
  }),
} as const;
