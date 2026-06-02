import { ok, unauthorized, notFound, validationError } from "@/lib/api-response";
import { requireAuth, AuthError } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { challengeJoinBodySchema } from "@/lib/validation/challenge";

// POST /api/challenges/:id/join
export async function POST(req: Request, { params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const json = await req.json().catch(() => ({}));
  const parsed = challengeJoinBodySchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const challenge = await prisma.challenge.findUnique({ where: { id: params.id } });
  if (!challenge) return notFound("Challenge not found");

  const participant = await prisma.challengeParticipant.upsert({
    where: { challengeId_userId: { challengeId: challenge.id, userId: user.id } },
    update: {},
    create: { challengeId: challenge.id, userId: user.id },
  });

  return ok({ joined: true, participantId: participant.id }, { status: 201 });
}
