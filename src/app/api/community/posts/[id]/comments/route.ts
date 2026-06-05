import { ok, unauthorized, notFound, validationError } from "@/lib/api-response";
import { requireAuth, AuthError } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { communityCommentSchema } from "@/lib/validation/community";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const post = await prisma.communityPost.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!post) return notFound("Post not found");

  const comments = await prisma.communityComment.findMany({
    where: { postId: post.id },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { name: true } } },
  });

  return ok(
    comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    })),
  );
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const json = await req.json().catch(() => null);
  const parsed = communityCommentSchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const post = await prisma.communityPost.findUnique({ where: { id: params.id } });
  if (!post) return notFound("Post not found");

  const comment = await prisma.communityComment.create({
    data: { postId: post.id, authorId: user.id, body: parsed.data.body },
    include: { author: { select: { id: true, name: true } } },
  });

  return ok(comment, { status: 201 });
}
