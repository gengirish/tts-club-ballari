/**
 * Truncates every application table in `public` (all user + transactional data).
 * Preserves `_prisma_migrations` so migration history stays intact.
 *
 * Usage (local):
 *   npx tsx scripts/wipe-all-application-data.ts --confirm
 *   npm run db:seed
 *
 * Remote (Neon / Supabase / etc.):
 *   I_ACCEPT_DATA_LOSS_ON_REMOTE_DB=1 npx tsx scripts/wipe-all-application-data.ts --confirm
 *
 * Then re-seed canonical programs, badges, and beta accounts:
 *   npm run db:seed
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Every Prisma model table in prisma/schema.prisma (PostgreSQL quoted identifiers). */
const APPLICATION_TABLES = [
  "Account",
  "Session",
  "VerificationToken",
  "PasswordResetToken",
  "OtpCode",
  "HealthProfile",
  "MemberGoal",
  "FitnessScore",
  "ProgressEntry",
  "CoachBookingRequest",
  "CoachReview",
  "Coach",
  "EventApplication",
  "EventRegistration",
  "Event",
  "ChallengeParticipant",
  "Challenge",
  "ProgramEnrollment",
  "Payment",
  "CommunityLike",
  "CommunityComment",
  "CommunityPost",
  "MemberBadge",
  "Badge",
  "WellnessArticle",
  "HostApplication",
  "SosAlert",
  "NotificationLog",
  "Program",
  "User",
] as const;

function wantsConfirm(): boolean {
  return process.argv.includes("--confirm");
}

function databaseHostname(): string | null {
  const raw = process.env.DATABASE_URL;
  if (!raw) return null;
  try {
    const normalized = raw.replace(/^postgresql:/i, "https:").replace(/^postgres:/i, "https:");
    return new URL(normalized).hostname;
  } catch {
    return null;
  }
}

function isLocalDatabase(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local");
}

async function main(): Promise<void> {
  if (!wantsConfirm()) {
    console.error(
      "Refused: this deletes all application data. Re-run with --confirm (see script header for remote DB env).",
    );
    process.exitCode = 1;
    return;
  }

  const host = databaseHostname();
  if (!host) {
    console.error("Refused: DATABASE_URL is missing or not a valid URL.");
    process.exitCode = 1;
    return;
  }

  if (!isLocalDatabase(host) && process.env.I_ACCEPT_DATA_LOSS_ON_REMOTE_DB !== "1") {
    console.error(
      `Refused: DATABASE_URL host is "${host}" (not localhost). ` +
        "To wipe a hosted database, set I_ACCEPT_DATA_LOSS_ON_REMOTE_DB=1 and run again.",
    );
    process.exitCode = 1;
    return;
  }

  const list = APPLICATION_TABLES.map((t) => `"${t}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`);

  console.log(
    `Wiped ${APPLICATION_TABLES.length} table(s) (RESTART IDENTITY CASCADE). Migration history (_prisma_migrations) was not truncated.`,
  );
  console.log("Next: npm run db:seed   (restores programs, badges, sample challenge, beta accounts)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
