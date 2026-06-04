// Store UTC in DB. Display in IST (Asia/Kolkata), dates as DD/MM/YYYY.

const IST = "Asia/Kolkata";

export const formatDateIST = (d: Date | string): string =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: IST,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(d)); // DD/MM/YYYY

export const formatTimeIST = (d: Date | string): string =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(d));

export const formatDateTimeIST = (d: Date | string): string =>
  `${formatDateIST(d)} · ${formatTimeIST(d)}`;

/** YYYY-MM-DD in Asia/Kolkata (for external APIs like IntelliForge receipts). */
export function formatDateYYYYMMDDIST(d: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(d));
}

/** HH:mm 24h in Asia/Kolkata. */
export function formatTime24IST(d: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: IST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(d));
}

/** Start of the IST day for a given instant, returned as a UTC Date (for ProgressEntry.date buckets). */
export function istDayBucket(d: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d); // YYYY-MM-DD
  return new Date(`${parts}T00:00:00.000+05:30`);
}
