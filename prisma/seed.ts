import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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

  // Sample challenge
  const now = new Date();
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

  console.log("Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
