import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AppMemberNav } from "./app-member-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  let label = user?.name?.trim() || user?.email?.trim() || "";
  if (!label && user) {
    const row = await prisma.user.findUnique({
      where: { id: user.id },
      select: { phone: true },
    });
    label = row?.phone ?? "";
  }
  if (!label) label = "Sister";

  return (
    <div className="min-h-screen">
      {user ? <AppMemberNav userLabel={label} /> : null}
      {children}
    </div>
  );
}
