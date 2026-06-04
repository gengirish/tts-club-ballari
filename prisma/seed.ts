import "dotenv/config";

import type { Role } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/server/auth/password";

const prisma = new PrismaClient();

/** Shared password for all seeded beta accounts (documented in docs/BETA_USERS.md). */
const BETA_PASSWORD_PLAIN = "BetaTest@2026!";

/** Seeded beta accounts use this domain so we can remove them safely (`npm run db:seed:reset`). */
const BETA_EMAIL_DOMAIN = "@sss-club.example.com";

const SAMPLE_CHALLENGE_TITLE = "10,000 Steps Challenge";

function wantsReset(): boolean {
  return (
    process.argv.includes("--reset") ||
    process.env.SEED_RESET === "1" ||
    process.env.SEED_RESET === "true"
  );
}

/** Deletes all community posts (and likes/comments). Use for a dedicated beta DB only. */
function wantsCommunityWipe(): boolean {
  return (
    process.argv.includes("--wipe-community") ||
    process.env.SEED_WIPE_COMMUNITY === "1" ||
    process.env.SEED_WIPE_COMMUNITY === "true"
  );
}

/**
 * Prepare a clean beta round: remove canonical beta users (@sss-club.example.com),
 * clear stale magic-link / OTP / notification audit rows, remove the sample challenge
 * so leaderboard state starts fresh. Does not delete non-beta users or programs/badges.
 */
async function wipeBetaRoundForFreshTesting(): Promise<void> {
  const betaUsers = await prisma.user.findMany({
    where: {
      email: { endsWith: BETA_EMAIL_DOMAIN, mode: "insensitive" },
    },
    select: { id: true, email: true },
  });
  const betaIds = betaUsers.map((u) => u.id);

  if (betaIds.length > 0) {
    await prisma.eventApplication.updateMany({
      where: { approvedById: { in: betaIds } },
      data: { approvedById: null },
    });

    const coachRows = await prisma.coach.findMany({
      where: { userId: { in: betaIds } },
      select: { id: true },
    });
    const coachIds = coachRows.map((c) => c.id);
    if (coachIds.length > 0) {
      await prisma.programEnrollment.updateMany({
        where: { coachId: { in: coachIds } },
        data: { coachId: null },
      });
    }

    await prisma.wellnessArticle.deleteMany({
      where: { authorId: { in: betaIds } },
    });

    await prisma.event.deleteMany({
      where: { hostId: { in: betaIds } },
    });

    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: betaIds } },
    });
    console.log(
      `Removed ${deletedUsers.count} beta user(s) (${BETA_EMAIL_DOMAIN}), host events, and related rows.`,
    );
  } else {
    console.log(`No users with email ending in ${BETA_EMAIL_DOMAIN} — skipping user wipe.`);
  }

  const ch = await prisma.challenge.deleteMany({
    where: { title: SAMPLE_CHALLENGE_TITLE },
  });
  if (ch.count > 0) {
    console.log(
      `Removed ${ch.count} sample challenge row(s) (“${SAMPLE_CHALLENGE_TITLE}”) so the next seed creates a fresh one.`,
    );
  }

  const vt = await prisma.verificationToken.deleteMany({});
  const otp = await prisma.otpCode.deleteMany({});
  const nl = await prisma.notificationLog.deleteMany({});
  console.log(
    `Cleared verification tokens (${vt.count}), OTP rows (${otp.count}), notification logs (${nl.count}).`,
  );

  if (wantsCommunityWipe()) {
    const posts = await prisma.communityPost.deleteMany({});
    console.log(
      `SEED_WIPE_COMMUNITY: removed ${posts.count} community post(s) (likes/comments cascade).`,
    );
  }
}

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

  const challenge = await prisma.challenge.findFirst({
    where: { title: SAMPLE_CHALLENGE_TITLE },
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

async function ensureSampleChallenge(): Promise<void> {
  const now = new Date();
  const existing = await prisma.challenge.findFirst({
    where: { title: SAMPLE_CHALLENGE_TITLE },
    orderBy: { createdAt: "desc" },
  });
  if (!existing) {
    await prisma.challenge.create({
      data: {
        type: "STEPS",
        title: SAMPLE_CHALLENGE_TITLE,
        description: "Hit 10k steps every day this month.",
        startDate: now,
        endDate: new Date(now.getTime() + 30 * 864e5),
        targetValue: 10000,
        unit: "steps",
        badgeName: "STREAK_30",
      },
    });
    console.log(`Created sample challenge “${SAMPLE_CHALLENGE_TITLE}”.`);
  }
}

async function main() {
  if (wantsReset()) {
    console.log(
      "SEED_RESET: wiping canonical beta users, sample challenge, verification/OTP/notification logs…",
    );
    await wipeBetaRoundForFreshTesting();
  }

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

  await ensureSampleChallenge();

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
