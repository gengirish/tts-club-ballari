import { fail, ok, validationError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { hashPassword } from "@/server/auth/password";
import { hashPasswordResetToken } from "@/server/auth/password-reset";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const tokenHash = hashPasswordResetToken(parsed.data.token);
  const nextPasswordHash = await hashPassword(parsed.data.password);
  const now = new Date();

  const resetApplied = await prisma.$transaction(async (tx) => {
    const row = await tx.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });

    if (!row || row.usedAt || row.expiresAt.getTime() <= now.getTime()) {
      return false;
    }

    await tx.user.update({
      where: { id: row.userId },
      data: { passwordHash: nextPasswordHash },
    });

    await tx.session.deleteMany({
      where: { userId: row.userId },
    });

    await tx.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: now },
    });

    await tx.passwordResetToken.updateMany({
      where: { userId: row.userId, usedAt: null, id: { not: row.id } },
      data: { usedAt: now },
    });

    return true;
  });

  if (!resetApplied) {
    return fail(
      "INVALID_OR_EXPIRED_TOKEN",
      "This reset link is invalid or has expired. Request a new password reset link.",
      400
    );
  }

  return ok({ message: "Password updated. You can now sign in with your new password." });
}
