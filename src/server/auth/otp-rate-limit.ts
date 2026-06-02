import { createHash } from "crypto";
import { getRedis } from "@/lib/redis";

const IP_WINDOW_SEC = Number(process.env.OTP_RL_IP_WINDOW_SEC ?? 3600);
const IP_MAX = Number(process.env.OTP_RL_IP_MAX ?? 30);
const PHONE_WINDOW_SEC = Number(process.env.OTP_RL_PHONE_WINDOW_SEC ?? 3600);
const PHONE_MAX = Number(process.env.OTP_RL_PHONE_MAX ?? 8);
const VERIFY_FAIL_WINDOW_SEC = Number(process.env.OTP_RL_VERIFY_FAIL_WINDOW_SEC ?? 900);
const VERIFY_FAIL_MAX = Number(process.env.OTP_RL_VERIFY_FAIL_MAX ?? 25);

function stableId(segment: string): string {
  return createHash("sha256").update(segment).digest("hex").slice(0, 40);
}

function bucketKey(prefix: string, id: string, windowSec: number): string {
  const bucket = Math.floor(Date.now() / (windowSec * 1000));
  return `rl:${prefix}:${stableId(id)}:${bucket}`;
}

async function incrUnderLimit(
  key: string,
  max: number,
  ttlSec: number
): Promise<{ allowed: boolean; count: number }> {
  const redis = getRedis();
  if (!redis) return { allowed: true, count: 0 };
  try {
    const n = await redis.incr(key);
    if (n === 1) await redis.expire(key, ttlSec + 120);
    if (n > max) {
      await redis.decr(key);
      return { allowed: false, count: n - 1 };
    }
    return { allowed: true, count: n };
  } catch {
    return { allowed: true, count: 0 };
  }
}

async function readCount(key: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;
  try {
    const v = await redis.get(key);
    return v ? Number(v) : 0;
  } catch {
    return 0;
  }
}

async function incrCount(key: string, ttlSec: number): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;
  try {
    const n = await redis.incr(key);
    if (n === 1) await redis.expire(key, ttlSec + 120);
    return n;
  } catch {
    return 0;
  }
}

/** Consume one OTP-send slot per IP and per phone; returns false if either limit exceeded. */
export async function consumeOtpIssueSlots(
  ip: string,
  phoneE164: string
): Promise<{ allowed: true } | { allowed: false; reason: "IP" | "PHONE" }> {
  const ipKey = bucketKey("otp:issue:ip", ip, IP_WINDOW_SEC);
  const ipRes = await incrUnderLimit(ipKey, IP_MAX, IP_WINDOW_SEC);
  if (!ipRes.allowed) return { allowed: false, reason: "IP" };

  const phKey = bucketKey("otp:issue:phone", phoneE164, PHONE_WINDOW_SEC);
  const phRes = await incrUnderLimit(phKey, PHONE_MAX, PHONE_WINDOW_SEC);
  if (!phRes.allowed) {
    await rollbackOne(ipKey);
    return { allowed: false, reason: "PHONE" };
  }
  return { allowed: true };
}

async function rollbackOne(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.decr(key);
  } catch {
    /* ignore */
  }
}

const verifyFailKey = (phoneE164: string) =>
  bucketKey("otp:verifyfail", phoneE164, VERIFY_FAIL_WINDOW_SEC);

/** True when this phone must not attempt OTP sign-in (too many recent failures). */
export async function isOtpVerifyBlocked(phoneE164: string): Promise<boolean> {
  const n = await readCount(verifyFailKey(phoneE164));
  return n >= VERIFY_FAIL_MAX;
}

/** Record a failed OTP verification (wrong code / expired) for lockout window. */
export async function recordOtpVerifyFailure(phoneE164: string): Promise<void> {
  await incrCount(verifyFailKey(phoneE164), VERIFY_FAIL_WINDOW_SEC);
}
