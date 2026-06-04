/**
 * One-off operator tool: set bcrypt password for an existing user by email.
 * Uses the same hasher as registration (`src/server/auth/password.ts`).
 *
 * Usage (from repo root, DATABASE_URL in .env):
 *   npx tsx scripts/set-password-for-email.ts <email> <newPassword>
 *
 * For production, point DATABASE_URL at the prod DB only from a trusted machine.
 */
import "dotenv/config";

import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/server/auth/password";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const plain = process.argv[3];
  if (!email || !plain) {
    console.error(
      "Usage: npx tsx scripts/set-password-for-email.ts <email> <newPassword>",
    );
    process.exit(1);
  }
  if (plain.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, email: true },
  });
  if (!user) {
    console.error(
      `No user found with email matching "${email}". Use Sign up on /login first, or create the row in the database.`,
    );
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(plain) },
  });
  console.log(`Password set for ${user.email ?? user.id}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
