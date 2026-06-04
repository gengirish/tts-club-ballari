import { prisma } from "@/lib/prisma";

/** Same cap as `GET /api/members` — newest members first. */
export const ADMIN_MEMBER_DIRECTORY_LIMIT = 100;

/** Members (`User.role === MEMBER`) for admin directory + `GET /api/members`. */
export async function listAdminMemberDirectory() {
  return prisma.user.findMany({
    where: { role: "MEMBER" },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      phone: true,
      city: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: ADMIN_MEMBER_DIRECTORY_LIMIT,
  });
}
