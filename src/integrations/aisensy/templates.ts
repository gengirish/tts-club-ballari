// Typed registry of approved AiSensy campaigns. Campaign names come from env
// so they can differ per environment. Build the templateParams in order.

const env = (k: string, fallback: string) => process.env[k] ?? fallback;

/** AISensy campaign name for login OTP (matches `NotificationLog.template`). */
export function getAisensyOtpCampaignName(): string {
  return env("AISENSY_CAMPAIGN_OTP", "sss_otp_login");
}

export const AisensyTemplates = {
  otpLogin: (code: string) => ({
    campaignName: getAisensyOtpCampaignName(),
    templateParams: [code],
  }),

  eventReminder: (eventTitle: string, whenIST: string, location: string) => ({
    campaignName: env("AISENSY_CAMPAIGN_EVENT_REMINDER", "sss_event_reminder"),
    templateParams: [eventTitle, whenIST, location],
  }),

  challengeNudge: (challengeTitle: string, progressLine: string) => ({
    campaignName: env("AISENSY_CAMPAIGN_CHALLENGE_NUDGE", "sss_challenge_nudge"),
    templateParams: [challengeTitle, progressLine],
  }),

  c25kSession: (weekNo: string, sessionLine: string) => ({
    campaignName: env("AISENSY_CAMPAIGN_C25K_SESSION", "sss_c25k_session"),
    templateParams: [weekNo, sessionLine],
  }),
} as const;
