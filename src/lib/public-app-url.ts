/** Canonical browser origin for absolute links (pass URL, wa.me text). */
export function getPublicAppOrigin(): string {
  const u = process.env.AUTH_URL?.trim();
  if (u) return u.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}
