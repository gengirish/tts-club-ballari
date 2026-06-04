import { sanitizePostgresUrlForPrismaClient } from "@/lib/prisma-sanitize";

/** Neon pooled hostnames include `-pooler`; Prisma `directUrl` needs the direct host. */
export function deriveNeonDirectUrl(pooledUrl: string): string | undefined {
  try {
    const u = new URL(pooledUrl);
    if (!u.hostname.includes("-pooler")) return undefined;
    u.hostname = u.hostname.replace("-pooler", "");
    return sanitizePostgresUrlForPrismaClient(u.toString()) ?? u.toString();
  } catch {
    return undefined;
  }
}

/**
 * Normalize Postgres env before Prisma reads `DATABASE_URL` / `DIRECT_URL`.
 * - Strips `channel_binding=require` (Neon libpq param Prisma mishandles).
 * - Derives `DIRECT_URL` from pooled Neon URL when only `DATABASE_URL` is set on Vercel.
 */
export function applySanitizedPrismaEnv(): void {
  const db = process.env.DATABASE_URL?.trim();
  if (db) {
    process.env.DATABASE_URL = sanitizePostgresUrlForPrismaClient(db) ?? db;
  }

  let direct = process.env.DIRECT_URL?.trim();
  if (direct) {
    process.env.DIRECT_URL = sanitizePostgresUrlForPrismaClient(direct) ?? direct;
    return;
  }

  if (!process.env.DATABASE_URL) return;

  const derived = deriveNeonDirectUrl(process.env.DATABASE_URL);
  process.env.DIRECT_URL = derived ?? process.env.DATABASE_URL;
}
