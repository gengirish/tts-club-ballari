import Redis from "ioredis";

let shared: Redis | null = null;

/** Returns a shared Redis client, or null when `REDIS_URL` is unset (rate limits skipped). */
export function getRedis(): Redis | null {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  if (!shared) {
    shared = new Redis(url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });
  }
  return shared;
}
