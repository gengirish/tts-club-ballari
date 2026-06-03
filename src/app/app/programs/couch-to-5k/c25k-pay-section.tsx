"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { formatPaiseShort } from "@/lib/utils/money";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type Assessment = {
  currentWeightKg?: number;
  age?: number;
  activityLevel?: string;
  dailySteps?: number;
  injuryHistory?: string;
  prevRunning?: boolean;
};

export function C25kPaySection({
  amountPaise,
  hasEnrollment,
}: {
  amountPaise: number;
  hasEnrollment: boolean;
}) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const loadScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Razorpay script failed"));
      document.body.appendChild(s);
    });
  }, []);

  async function pay() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/programs/couch-to-5k/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setErr(body.error?.message ?? "Could not start checkout");
        setLoading(false);
        return;
      }
      const { orderId, keyId, amountPaise: amt, currency } = body.data as {
        orderId: string;
        keyId: string;
        amountPaise: number;
        currency: string;
      };
      await loadScript();
      const rzp = new window.Razorpay({
        key: keyId,
        amount: amt,
        currency,
        name: "Steel Sisters & Striders",
        description: "Couch to 5K — 12 weeks",
        order_id: orderId,
        handler: () => {
          router.refresh();
        },
        theme: { color: "#6320b3" },
      });
      rzp.open();
    } catch {
      setErr("Checkout could not open. Try again.");
    }
    setLoading(false);
  }

  if (hasEnrollment) {
    return (
      <div
        className="overflow-hidden rounded-card border border-progress/35 bg-white shadow-lg shadow-progress/10"
        data-testid="c25k-enrolled-banner"
      >
        <div className="bg-energy px-5 py-4 text-center">
          <span className="inline-flex rounded-full bg-white/25 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
            Enrolled
          </span>
          <p className="mt-2 font-display text-lg uppercase text-white">You are in the arc</p>
        </div>
        <p className="px-5 py-4 text-center text-sm font-semibold leading-relaxed text-ink/80">
          Weekly WhatsApp reminders are scheduled. Show up for your solo sessions and Sunday group — we will see you
          at the graduation run.
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-card border border-paper-deep bg-white/90 shadow-xl shadow-violet/10 backdrop-blur-sm"
      data-testid="c25k-pay-section"
    >
      <div className="border-b border-paper-deep bg-gradient-to-r from-violet/8 via-paper to-magenta/8 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl uppercase text-violet">Assessment & checkout</h2>
          <span className="rounded-full border border-white/40 bg-white/70 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-violet shadow-sm backdrop-blur-sm">
            Premium · {formatPaiseShort(amountPaise)}
          </span>
        </div>
        <p className="mt-1 text-xs text-ink/55">Coach intake + Razorpay — enrollment activates after webhook.</p>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="col-span-2 md:col-span-1">
            <span className="text-xs font-extrabold uppercase tracking-wide text-ink/50">Current weight (kg)</span>
            <input
              className="mt-1.5 w-full rounded-card border border-paper-deep bg-paper px-3 py-2.5 text-ink outline-none transition focus:border-violet focus:ring-2 focus:ring-violet/20"
              type="number"
              value={assessment.currentWeightKg ?? ""}
              onChange={(e) =>
                setAssessment((a) => ({
                  ...a,
                  currentWeightKg: e.target.value === "" ? undefined : Number(e.target.value),
                }))
              }
            />
          </label>
          <label className="col-span-2 md:col-span-1">
            <span className="text-xs font-extrabold uppercase tracking-wide text-ink/50">Age</span>
            <input
              className="mt-1.5 w-full rounded-card border border-paper-deep bg-paper px-3 py-2.5 text-ink outline-none transition focus:border-violet focus:ring-2 focus:ring-violet/20"
              type="number"
              value={assessment.age ?? ""}
              onChange={(e) =>
                setAssessment((a) => ({ ...a, age: e.target.value === "" ? undefined : Number(e.target.value) }))
              }
            />
          </label>
          <label className="col-span-2">
            <span className="text-xs font-extrabold uppercase tracking-wide text-ink/50">Activity today (short note)</span>
            <input
              className="mt-1.5 w-full rounded-card border border-paper-deep bg-paper px-3 py-2.5 text-ink outline-none transition focus:border-violet focus:ring-2 focus:ring-violet/20"
              value={assessment.activityLevel ?? ""}
              onChange={(e) => setAssessment((a) => ({ ...a, activityLevel: e.target.value }))}
            />
          </label>
          <label className="col-span-2 md:col-span-1">
            <span className="text-xs font-extrabold uppercase tracking-wide text-ink/50">Daily steps (avg)</span>
            <input
              className="mt-1.5 w-full rounded-card border border-paper-deep bg-paper px-3 py-2.5 text-ink outline-none transition focus:border-violet focus:ring-2 focus:ring-violet/20"
              type="number"
              value={assessment.dailySteps ?? ""}
              onChange={(e) =>
                setAssessment((a) => ({
                  ...a,
                  dailySteps: e.target.value === "" ? undefined : Number(e.target.value),
                }))
              }
            />
          </label>
          <label className="col-span-2">
            <span className="text-xs font-extrabold uppercase tracking-wide text-ink/50">Injury history (optional)</span>
            <textarea
              className="mt-1.5 min-h-[72px] w-full resize-y rounded-card border border-paper-deep bg-paper px-3 py-2.5 text-ink outline-none transition focus:border-violet focus:ring-2 focus:ring-violet/20"
              value={assessment.injuryHistory ?? ""}
              onChange={(e) => setAssessment((a) => ({ ...a, injuryHistory: e.target.value }))}
              rows={2}
            />
          </label>
          <label className="col-span-2 flex min-h-[44px] items-center gap-3 rounded-card border border-dashed border-paper-deep bg-paper/50 px-3 py-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-paper-deep text-violet focus:ring-violet"
              checked={!!assessment.prevRunning}
              onChange={(e) => setAssessment((a) => ({ ...a, prevRunning: e.target.checked }))}
            />
            <span className="text-sm font-semibold text-ink">I have run before (even casually)</span>
          </label>
        </div>

        <p className="text-[11px] leading-relaxed text-ink/50">
          Test mode: use Razorpay test cards from the Razorpay dashboard. The webhook must reach this deployment for
          enrollment to activate.
        </p>

        <button
          type="button"
          onClick={pay}
          disabled={loading}
          data-testid="c25k-pay-cta"
          className="flex min-h-[52px] w-full items-center justify-center rounded-full bg-energy px-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg shadow-magenta/25 transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {loading ? "Preparing…" : `Pay ${formatPaiseShort(amountPaise)}`}
        </button>
        {err && <p className="text-center text-sm font-semibold text-magenta">{err}</p>}
      </div>
    </div>
  );
}
