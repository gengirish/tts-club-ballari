import { ok, unauthorized, notFound, validationError } from "@/lib/api-response";
import { requireAuth, AuthError } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const likeBodySchema = z.object({}).strict();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const json = await req.json().catch(() => ({}));
  const parsed = likeBodySchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const post = await prisma.communityPost.findUnique({ where: { id: params.id } });
  if (!post) return notFound("Post not found");

  const existing = await prisma.communityLike.findUnique({
    where: { postId_userId: { postId: post.id, userId: user.id } },
  });

  if (existing) {
    await prisma.communityLike.delete({ where: { id: existing.id } });
    return ok({ liked: false });
  }

  await prisma.communityLike.create({
    data: { postId: post.id, userId: user.id },
  });

  return ok({ liked: true }, { status: 201 });
}
