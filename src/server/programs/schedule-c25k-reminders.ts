import { enqueueNotification } from "@/queue/queues";

/** Weekly C25K WhatsApp pings for 12 weeks after enrollment (BullMQ delayed jobs). */
export async function scheduleC25kSessionReminders(enrollmentId: string) {
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const tasks = [];
  for (let w = 0; w < 12; w++) {
    tasks.push(
      enqueueNotification({ kind: "c25k_session", enrollmentId }, { delayMs: w * weekMs })
    );
  }
  await Promise.all(tasks);
}
