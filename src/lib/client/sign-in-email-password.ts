import { signIn } from "next-auth/react";

const DEFAULT_MS = 25_000;

/** Wraps credentials `signIn` so a stuck network/session does not leave the UI spinning forever. */
export async function signInEmailPasswordWithTimeout(
  identifier: string,
  password: string,
  timeoutMs = DEFAULT_MS
): Promise<Awaited<ReturnType<typeof signIn>>> {
  return Promise.race([
    signIn("email-password", { identifier, password, redirect: false }),
    new Promise<Awaited<ReturnType<typeof signIn>>>((_, reject) =>
      setTimeout(() => reject(new Error("SIGN_IN_TIMEOUT")), timeoutMs)
    ),
  ]);
}
