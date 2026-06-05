import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/rbac";
import { isMemberOnboarded } from "@/lib/member/onboarding-status";
import { prisma } from "@/lib/prisma";
import { AppBackToHome } from "../app-back-to-home";
import { CommunityComposer, CommunityPostCard } from "./community-feed";
import { SosClientButton } from "./sos-client-button";

export default async function CommunityPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!(await isMemberOnboarded(user.id))) redirect("/app/onboarding");

  const [posts, articles] = await Promise.all([
    prisma.communityPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      include: {
        author: { select: { name: true } },
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId: user.id }, select: { id: true } },
      },
    }),
    prisma.wellnessArticle.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { author: { select: { name: true } } },
    }),
  ]);

  const serialPosts = posts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-10">
        <header>
          <AppBackToHome />
          <h1 className="font-display text-4xl uppercase text-transparent bg-clip-text bg-energy">Community</h1>
          <p className="text-sm text-ink/60 mt-2">Feed, wellness picks, and safety.</p>
        </header>

        <SosClientButton />

        <section>
          <h2 className="font-display text-xl uppercase text-violet mb-3">Women&apos;s wellness</h2>
          <ul className="space-y-3">
            {articles.map((a) => (
              <li key={a.id} className="rounded-card border border-paper-deep bg-paper-raised p-4">
                <p className="text-xs font-bold text-magenta uppercase">{String(a.topic).replaceAll("_", " ")}</p>
                <p className="font-bold text-ink mt-1">{a.title}</p>
                <p className="text-xs text-ink/50 mt-1">By {a.author.name ?? "Author"}</p>
                <p className="text-sm text-ink/70 mt-2 line-clamp-4 whitespace-pre-wrap">{a.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-violet mb-3">Strider feed</h2>
          <CommunityComposer />
          <div className="space-y-4">
            {serialPosts.map((p) => (
              <CommunityPostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
