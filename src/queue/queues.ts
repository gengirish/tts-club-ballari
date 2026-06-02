import { Queue } from "bullmq";
import { bullmqConnection } from "./connection";

export type NotificationJob =
  | { kind: "event_reminder"; userId: string; eventId: string }
  | { kind: "challenge_nudge"; userId: string; challengeId: string }
  | { kind: "c25k_session"; enrollmentId: string }
  | { kind: "email"; to: string; subject: string; html: string };

export const notificationsQueue = new Queue<NotificationJob>("notifications", {
  connection: bullmqConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

export async function enqueueNotification(job: NotificationJob, opts?: { delayMs?: number }) {
  return notificationsQueue.add(job.kind, job, { delay: opts?.delayMs });
}
