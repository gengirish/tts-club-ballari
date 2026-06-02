import type { Role } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/server/auth/password";

const prisma = new PrismaClient();

/** Shared password for all seeded beta accounts (documented in docs/BETA_USERS.md). */
const BETA_PASSWORD_PLAIN = "BetaTest@2026!";

async function upsertOnboardedUser(opts: {
  email: string;
  username: string;
  name: string;
  role: Role;
}): Promise<{ id: string }> {
  const passwordHash = await hashPassword(BETA_PASSWORD_PLAIN);
  const user = await prisma.user.upsert({
    where: { email: opts.email },
    create: {
      email: opts.email,
      username: opts.username,
      name: opts.name,
      passwordHash,
      role: opts.role,
      city: "Ballari",
    },
    update: {
      username: opts.username,
      name: opts.name,
      passwordHash,
      role: opts.role,
    },
    select: { id: true },
  });

  await prisma.healthProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      heightCm: 162,
      weightKg: 58,
      level: "BEGINNER",
      avgDailySteps: 5000,
      walkingDistanceKm: 2,
    },
    update: {},
  });

  await prisma.memberGoal.deleteMany({ where: { userId: user.id } });
  await prisma.memberGoal.create({
    data: { userId: user.id, goal: "WALKING_HABIT" },
  });

  return user;
}

async function seedBetaAccounts(): Promise<void> {
  const member1 = await upsertOnboardedUser({
    email: "beta.member1@sss-club.example.com",
    username: "beta_ballari_1",
    name: "Beta Member One",
    role: "MEMBER",
  });

  await upsertOnboardedUser({
    email: "beta.member2@sss-club.example.com",
    username: "beta_ballari_2",
    name: "Beta Member Two",
    role: "MEMBER",
  });

  await upsertOnboardedUser({
    email: "beta.admin@sss-club.example.com",
    username: "beta_admin",
    name: "Beta Admin",
    role: "ADMIN",
  });

  const coachUser = await upsertOnboardedUser({
    email: "beta.coach@sss-club.example.com",
    username: "beta_coach",
    name: "Beta Coach",
    role: "COACH",
  });

  await prisma.coach.upsert({
    where: { userId: coachUser.id },
    update: {
      available: true,
      bio: "Seeded for beta testing — replace profile in production.",
    },
    create: {
      userId: coachUser.id,
      type: "RUNNING",
      qualification: "Certified running coach (seed)",
      experienceYrs: 4,
      bio: "Seeded for beta testing — replace profile in production.",
      ratingBps: 48000,
      ratingCount: 2,
      sessionPaise: 49900,
      available: true,
    },
  });

  await upsertOnboardedUser({
    email: "beta.host@sss-club.example.com",
    username: "beta_host",
    name: "Beta Host",
    role: "HOST",
  });

  // Optional: first member joins the sample challenge if present (for leaderboard demos).
  const challenge = await prisma.challenge.findFirst({
    where: { title: "10,000 Steps Challenge" },
    orderBy: { createdAt: "desc" },
  });
  if (challenge) {
    await prisma.challengeParticipant.upsert({
      where: {
        challengeId_userId: { challengeId: challenge.id, userId: member1.id },
      },
      update: {},
      create: { challengeId: challenge.id, userId: member1.id, progress: 3200 },
    });
  }

  console.log("Beta accounts upserted (see docs/BETA_USERS.md for passwords).");
}

async function main() {
  // Flagship program
  await prisma.program.upsert({
    where: { slug: "couch-to-5k" },
    update: {},
    create: {
      slug: "couch-to-5k",
      title: "Couch to 5K",
      weeks: 12,
      pricePaise: 149900, // ₹1,499
      description: "Your first 5 km in 12 weeks, coach-led.",
    },
  });

  // Badges
  const badges = [
    { code: "FIRST_WALK", title: "First Walk", icon: "🚶‍♀️" },
    { code: "FIRST_5K", title: "First 5K", icon: "🏃‍♀️" },
    { code: "KM_100", title: "100 KM Walked", icon: "🏅" },
    { code: "WEIGHT_5KG", title: "5 KG Lost", icon: "⚖️" },
    { code: "STREAK_30", title: "30-Day Streak", icon: "🔥" },
    { code: "COMMUNITY_CHAMPION", title: "Community Champion", icon: "👑" },
    { code: "EVENT_HOST", title: "Event Host", icon: "📣" },
  ];
  for (const b of badges) {
    await prisma.badge.upsert({ where: { code: b.code }, update: {}, create: b });
  }

  // Sample challenge (idempotent — only one active sample with this title)
  const now = new Date();
  const existingSample = await prisma.challenge.findFirst({
    where: { title: "10,000 Steps Challenge" },
  });
  if (!existingSample) {
    await prisma.challenge.create({
      data: {
        type: "STEPS",
        title: "10,000 Steps Challenge",
        description: "Hit 10k steps every day this month.",
        startDate: now,
        endDate: new Date(now.getTime() + 30 * 864e5),
        targetValue: 10000,
        unit: "steps",
        badgeName: "STREAK_30",
      },
    });
  }

  await seedBetaAccounts();

  console.log("Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
