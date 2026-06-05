import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const DEFAULT_RESET_TTL_MINUTES = 30;
const MIN_RESET_TTL_MINUTES = 5;
const MAX_RESET_TTL_MINUTES = 120;

export function passwordResetTtlMinutes(): number {
  const raw = Number.parseInt(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? "", 10);
  if (!Number.isFinite(raw)) return DEFAULT_RESET_TTL_MINUTES;
  return Math.min(MAX_RESET_TTL_MINUTES, Math.max(MIN_RESET_TTL_MINUTES, raw));
}

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function issuePasswordResetToken(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(Date.now() + passwordResetTtlMinutes() * 60_000);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: now },
    });

    await tx.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  });

  return { token, expiresAt };
}
