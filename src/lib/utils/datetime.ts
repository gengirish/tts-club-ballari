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
