import { ok, unauthorized, validationError } from "@/lib/api-response";
import { requireAuth, AuthError } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { communityPostSchema } from "@/lib/validation/community";

export async function GET() {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const posts = await prisma.communityPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: user.id }, select: { id: true } },
    },
  });

  return ok(posts);
}

export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const json = await req.json().catch(() => null);
  const parsed = communityPostSchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const post = await prisma.communityPost.create({
    data: { authorId: user.id, body: parsed.data.body },
    include: { author: { select: { id: true, name: true } } },
  });

  return ok(post, { status: 201 });
}
