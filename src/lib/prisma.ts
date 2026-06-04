import { PrismaClient } from "@prisma/client";
import { applySanitizedPrismaEnv } from "@/lib/prisma-env";

applySanitizedPrismaEnv();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Fail fast with a clear log when auth routes cannot reach Postgres. */
export async function ensurePrismaConnected(): Promise<void> {
  await prisma.$connect();
}
