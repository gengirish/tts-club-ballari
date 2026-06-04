import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { formatDateTimeIST } from "@/lib/utils/datetime";
import { getPublicAppOrigin } from "@/lib/public-app-url";

type Props = { params: { token: string } };

export default async function EventPassPage({ params }: Props) {
  const app = await prisma.eventApplication.findFirst({
    where: { passToken: params.token, status: "APPROVED" },
    include: {
      event: { select: { title: true, location: true, startsAt: true, type: true } },
    },
  });

  if (!app || !app.passToken) notFound();

  const passUrl = `${getPublicAppOrigin()}/e/pass/${encodeURIComponent(app.passToken)}`;
  const qrDataUrl = await QRCode.toDataURL(passUrl, { errorCorrectionLevel: "M", width: 280, margin: 2 });

  return (
    <main className="min-h-screen bg-paper px-4 py-10 flex flex-col items-center">
      <div className="max-w-md w-full rounded-card border-2 border-violet/40 bg-paper-raised p-6 shadow-lg">
        <p className="text-center text-xs font-bold uppercase text-magenta tracking-widest">SSS Club · Event pass</p>
        <h1 className="font-display text-2xl uppercase text-violet text-center mt-2 leading-tight">
          {app.event.title}
        </h1>
        <p className="text-center text-sm text-ink/65 mt-2">{formatDateTimeIST(app.event.startsAt)}</p>
        <p className="text-center text-sm text-ink/80 mt-1">{app.event.location}</p>

        <div className="mt-6 border-t border-paper-deep pt-5 space-y-1 text-sm">
          <p>
            <span className="text-ink/55">Name</span>{" "}
            <span className="font-semibold text-ink">{app.applicantName}</span>
          </p>
          <p>
            <span className="text-ink/55">Phone</span>{" "}
            <span className="font-mono text-ink">{app.phone}</span>
          </p>
          <p>
            <span className="text-ink/55">City</span> <span className="text-ink">{app.city}</span>
          </p>
        </div>

        <div className="flex justify-center mt-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR code for this pass" width={280} height={280} className="rounded-lg" />
        </div>
        <p className="text-xs text-center text-ink/50 mt-2">Show this QR at the check-in desk.</p>
      </div>
    </main>
  );
}
