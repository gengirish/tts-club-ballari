/**
 * Ensures E2E_TEST_PHONE maps to a fully onboarded member (skips /app/onboarding redirect).
 * Run before Playwright when using authenticated specs:
 *   npx tsx e2e/seed-onboarded-user.ts
 * Requires DATABASE_URL and E2E_TEST_PHONE in the environment.
 */
import { PrismaClient } from "@prisma/client";
import { toE164 } from "../src/lib/utils/phone";

const prisma = new PrismaClient();

async function main() {
  const raw = process.env.E2E_TEST_PHONE?.trim();
  if (!raw) throw new Error("E2E_TEST_PHONE is required.");
  const phone = toE164(raw);
  if (!phone) throw new Error("E2E_TEST_PHONE must be a valid Indian mobile.");

  const user = await prisma.user.upsert({
    where: { phone },
    update: { name: "E2E Member" },
    create: { phone, name: "E2E Member", role: "MEMBER", city: "Ballari" },
  });

  await prisma.healthProfile.upsert({
    where: { userId: user.id },
    update: { heightCm: 165, weightKg: 65, level: "BEGINNER" },
    create: { userId: user.id, heightCm: 165, weightKg: 65, level: "BEGINNER" },
  });

  await prisma.memberGoal.deleteMany({ where: { userId: user.id } });
  await prisma.memberGoal.create({ data: { userId: user.id, goal: "WEIGHT_LOSS" } });

  console.log(`E2E seed OK for ${phone} (${user.id}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
