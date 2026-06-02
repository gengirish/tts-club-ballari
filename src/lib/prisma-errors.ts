import { Prisma } from "@prisma/client";

/**
 * Prisma `instanceof PrismaClientKnownRequestError` can fail across Next/Vercel bundle
 * boundaries; reading `.code` is reliable for known request errors.
 */
export function getPrismaKnownRequestCode(error: unknown): string | undefined {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code;
  }
  if (typeof error === "object" && error !== null && "code" in error) {
    const c = (error as { code: unknown }).code;
    if (typeof c === "string" && /^P[0-9]{4}$/.test(c)) return c;
  }
  return undefined;
}

export function getPrismaInitializationErrorCode(error: unknown): string | undefined {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return error.errorCode;
  }
  if (isPrismaInitializationError(error) && typeof error === "object" && error !== null) {
    const ec = (error as { errorCode?: unknown }).errorCode;
    return typeof ec === "string" ? ec : undefined;
  }
  return undefined;
}

export function isPrismaInitializationError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (typeof error !== "object" || error === null) return false;
  return Object.getPrototypeOf(error)?.constructor?.name === "PrismaClientInitializationError";
}
