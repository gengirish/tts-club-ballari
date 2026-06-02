"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

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
      <p className="rounded-card border border-progress/40 bg-white p-4 text-progress font-bold">
        You are enrolled — your weekly reminders are scheduled.
      </p>
    );
  }

  return (
    <div className="rounded-card border border-paper-deep bg-white p-6 space-y-4">
      <h2 className="font-display text-xl uppercase text-violet">Assessment & checkout</h2>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="col-span-2 md:col-span-1">
          Current weight (kg)
          <input
            className="mt-1 w-full border rounded-card px-3 py-2"
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
          Age
          <input
            className="mt-1 w-full border rounded-card px-3 py-2"
            type="number"
            value={assessment.age ?? ""}
            onChange={(e) =>
              setAssessment((a) => ({ ...a, age: e.target.value === "" ? undefined : Number(e.target.value) }))
            }
          />
        </label>
        <label className="col-span-2">
          Activity today (short note)
          <input
            className="mt-1 w-full border rounded-card px-3 py-2"
            value={assessment.activityLevel ?? ""}
            onChange={(e) => setAssessment((a) => ({ ...a, activityLevel: e.target.value }))}
          />
        </label>
        <label className="col-span-2 md:col-span-1">
          Daily steps (avg)
          <input
            className="mt-1 w-full border rounded-card px-3 py-2"
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
        <label className="flex items-center gap-2 col-span-2 md:col-span-1 mt-6">
          <input
            type="checkbox"
            checked={!!assessment.prevRunning}
            onChange={(e) => setAssessment((a) => ({ ...a, prevRunning: e.target.checked }))}
          />
          <span>Ran before</span>
        </label>
      </div>
      <p className="text-xs text-ink/50">
        Test mode: use Razorpay test cards in the Razorpay dashboard docs. Webhook must reach this deployment for
        enrollment to activate.
      </p>
      <button
        type="button"
        onClick={pay}
        disabled={loading}
        className="w-full rounded-full bg-energy py-3 text-sm font-extrabold text-white disabled:opacity-60"
      >
        {loading ? "Preparing…" : `Pay ₹${(amountPaise / 100).toLocaleString("en-IN")}`}
      </button>
      {err && <p className="text-sm text-magenta font-semibold">{err}</p>}
    </div>
  );
}
