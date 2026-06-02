// Runs on Fly.io (separate process). Consumes the notifications queue.
import { Worker } from "bullmq";
import { bullmqConnection } from "./connection";
import { getNotificationsQueue, type NotificationJob } from "./queues";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/integrations/aisensy/client";
import { AisensyTemplates } from "@/integrations/aisensy/templates";
import { sendEmail } from "@/integrations/agentmail/client";
import { formatDateTimeIST } from "@/lib/utils/datetime";

async function logWa(to: string, template: string, ok: boolean, body?: unknown) {
  await prisma.notificationLog.create({
    data: { channel: "WHATSAPP", to, template, status: ok ? "SENT" : "FAILED", error: ok ? null : JSON.stringify(body) },
  });
}

const worker = new Worker<NotificationJob>(
  "notifications",
  async (job) => {
    const data = job.data;

    if (data.kind === "event_reminder") {
      const reg = await prisma.eventRegistration.findFirst({
        where: { userId: data.userId, eventId: data.eventId },
        include: { event: true, user: true },
      });
      if (!reg) return;
      const tpl = AisensyTemplates.eventReminder(
        reg.event.title,
        formatDateTimeIST(reg.event.startsAt),
        reg.event.location
      );
      const res = await sendWhatsApp({
        campaignName: tpl.campaignName,
        destination: reg.user.phone,
        userName: reg.user.name ?? "SSS Member",
        templateParams: tpl.templateParams,
      });
      await logWa(reg.user.phone, tpl.campaignName, res.success, res.body);
      return;
    }

    if (data.kind === "challenge_nudge") {
      const cp = await prisma.challengeParticipant.findFirst({
        where: { userId: data.userId, challengeId: data.challengeId },
        include: { challenge: true, user: true },
      });
      if (!cp) return;
      const line = `${cp.progress}/${cp.challenge.targetValue} ${cp.challenge.unit}`;
      const tpl = AisensyTemplates.challengeNudge(cp.challenge.title, line);
      const res = await sendWhatsApp({
        campaignName: tpl.campaignName,
        destination: cp.user.phone,
        userName: cp.user.name ?? "SSS Member",
        templateParams: tpl.templateParams,
      });
      await logWa(cp.user.phone, tpl.campaignName, res.success, res.body);
      return;
    }

    if (data.kind === "c25k_session") {
      const enr = await prisma.programEnrollment.findUnique({
        where: { id: data.enrollmentId },
        include: { member: true },
      });
      if (!enr) return;
      // Session line could be looked up from a plan table; kept simple here.
      const tpl = AisensyTemplates.c25kSession(String(enr.weekNo), "Today's session is ready in the app.");
      const res = await sendWhatsApp({
        campaignName: tpl.campaignName,
        destination: enr.member.phone,
        userName: enr.member.name ?? "SSS Member",
        templateParams: tpl.templateParams,
      });
      await logWa(enr.member.phone, tpl.campaignName, res.success, res.body);
      return;
    }

    if (data.kind === "challenge_nudge_scan") {
      const now = new Date();
      const challenges = await prisma.challenge.findMany({
        where: { startDate: { lte: now }, endDate: { gte: now } },
        include: { participants: true },
      });
      for (const ch of challenges) {
        const totalMs = Math.max(ch.endDate.getTime() - ch.startDate.getTime(), 1);
        const elapsedMs = Math.min(Math.max(now.getTime() - ch.startDate.getTime(), 0), totalMs);
        const expected = Math.floor((ch.targetValue * elapsedMs) / totalMs);
        for (const p of ch.participants) {
          if (p.progress >= ch.targetValue) continue;
          if (expected > 0 && p.progress < expected * 0.45) {
            await getNotificationsQueue().add("challenge_nudge", {
              kind: "challenge_nudge",
              userId: p.userId,
              challengeId: ch.id,
            });
          }
        }
      }
      return;
    }

    if (data.kind === "email") {
      const res = await sendEmail({ to: data.to, subject: data.subject, html: data.html });
      await prisma.notificationLog.create({
        data: {
          channel: "EMAIL",
          to: data.to,
          template: data.subject,
          status: res.success ? "SENT" : "FAILED",
          error: res.error ?? null,
        },
      });
      return;
    }
  },
  { connection: bullmqConnection, concurrency: 5 }
);

worker.on("ready", () => console.log("[worker] notifications worker ready"));
worker.on("failed", (job, err) => console.error("[worker] job failed", job?.id, err.message));

getNotificationsQueue()
  .add(
    "repeat-challenge-nudge-scan",
    { kind: "challenge_nudge_scan" } satisfies NotificationJob,
    { repeat: { every: 86_400_000 }, jobId: "repeat-challenge-nudge-scan" }
  )
  .catch((e) => console.error("[worker] repeatable register", e));
