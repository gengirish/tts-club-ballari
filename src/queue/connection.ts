import type { ConnectionOptions } from "bullmq";

/** BullMQ creates its own ioredis client — pass options only to avoid duplicate ioredis type trees. */
export const bullmqConnection: ConnectionOptions = {
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
  maxRetriesPerRequest: null,
};
