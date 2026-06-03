import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Neon’s “copy connection string” often includes `channel_binding=require` (libpq).
 * Prisma’s Rust engine + Node deployments frequently mis-handle that param with Neon’s
 * pooler — strip it so `sslmode=require` auth still works.
 */
export function sanitizePostgresUrlForPrismaClient(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    if (u.searchParams.has("channel_binding")) {
      u.searchParams.delete("channel_binding");
      return u.toString();
    }
  } catch {
    /* ignore non-URL DSN shapes */
  }
  return url;
}

const databaseUrl =
  sanitizePostgresUrlForPrismaClient(process.env.DATABASE_URL) ?? process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(databaseUrl
      ? {
          datasources: {
            db: {
              url: databaseUrl,
            },
          },
        }
      : {}),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
