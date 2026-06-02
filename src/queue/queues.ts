import { Queue } from "bullmq";
import { bullmqConnection } from "./connection";

export type NotificationJob =
  | { kind: "event_reminder"; userId: string; eventId: string }
  | { kind: "challenge_nudge"; userId: string; challengeId: string }
  | { kind: "challenge_nudge_scan" }
  | { kind: "c25k_session"; enrollmentId: string }
  | { kind: "email"; to: string; subject: string; html: string };

let notificationsQueue: Queue<NotificationJob> | null = null;

/** Lazy so `next build` does not require a live Redis when route modules import this file. */
export function getNotificationsQueue(): Queue<NotificationJob> {
  if (!notificationsQueue) {
    notificationsQueue = new Queue<NotificationJob>("notifications", {
      connection: bullmqConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    });
  }
  return notificationsQueue;
}

export async function enqueueNotification(job: NotificationJob, opts?: { delayMs?: number }) {
  return getNotificationsQueue().add(job.kind, job, { delay: opts?.delayMs });
}
