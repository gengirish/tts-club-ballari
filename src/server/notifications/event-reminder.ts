import { prisma } from "@/lib/prisma";
import { enqueueNotification } from "@/queue/queues";

/** ~12 hours before the event starts (UTC `startsAt`), WhatsApp reminder for one registrant. */
export async function scheduleEventReminderForRegistrant(eventId: string, userId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return;
  const delayMs = event.startsAt.getTime() - 12 * 3600000 - Date.now();
  if (delayMs <= 0) return;
  await enqueueNotification({ kind: "event_reminder", userId, eventId }, { delayMs });
}
