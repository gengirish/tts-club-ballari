"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CoachType } from "@prisma/client";

const COACH_TYPES: CoachType[] = ["RUNNING", "WALKING", "STRENGTH", "YOGA", "NUTRITION", "PHYSIO"];

const inputClass =
  "mt-1 w-full rounded-card border border-paper-deep bg-paper-muted px-3 py-2.5 text-sm text-ink shadow-sm placeholder:text-ink/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2";

const labelClass = "block text-sm font-semibold text-ink";

export function AdminAddCoachForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "promote">("create");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const fd = new FormData(e.currentTarget);

    const sessionPaise = Number(fd.get("sessionPaise"));
    const experienceYrs = Number(fd.get("experienceYrs") || 0);
    const available = fd.get("available") === "on";

    const type = String(fd.get("type")) as CoachType;
    const bio = String(fd.get("bio") || "").trim() || undefined;
    const qualification = String(fd.get("qualification") || "").trim() || undefined;
    const specialty = String(fd.get("specialty") || "").trim() || undefined;

    let body: Record<string, unknown>;
    if (mode === "create") {
      body = {
        mode: "create",
        email: String(fd.get("email") || "").trim() || undefined,
        username: String(fd.get("username") || "").trim() || undefined,
        password: String(fd.get("password") || ""),
        name: String(fd.get("name") || "").trim() || undefined,
        type,
        bio,
        sessionPaise,
        qualification,
        experienceYrs,
        specialty,
        available,
      };
    } else {
      body = {
        mode: "promote",
        promoteEmail: String(fd.get("promoteEmail") || "").trim() || undefined,
        promoteUserId: String(fd.get("promoteUserId") || "").trim() || undefined,
        type,
        bio,
        sessionPaise,
        qualification,
        experienceYrs,
        specialty,
        available,
      };
    }

    try {
      const res = await fetch("/api/admin/coaches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json: unknown = await res.json();
      const rec = json as { ok?: boolean; data?: { coachId?: string }; error?: { message?: string } };
      if (!res.ok || !rec.ok) {
        setMessage({ kind: "err", text: rec.error?.message ?? "Request failed" });
        return;
      }
      setMessage({
        kind: "ok",
        text:
          mode === "create"
            ? `Coach created (coach id: ${rec.data?.coachId ?? "—"}). They can sign in with the password you set.`
            : `User promoted to coach (coach id: ${rec.data?.coachId ?? "—"}).`,
      });
      e.currentTarget.reset();
      router.refresh();
    } catch {
      setMessage({ kind: "err", text: "Network error — try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(ev) => void onSubmit(ev)} className="space-y-6 rounded-card border border-paper-deep bg-paper-raised p-6 shadow-sm">
      <fieldset className="space-y-3">
        <legend className="text-sm font-bold text-magenta">How to add</legend>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="modeUi"
              checked={mode === "create"}
              onChange={() => setMode("create")}
              className="text-violet focus:ring-violet"
            />
            New coach account (email or username + password)
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="modeUi"
              checked={mode === "promote"}
              onChange={() => setMode("promote")}
              className="text-violet focus:ring-violet"
            />
            Promote existing user (email or Prisma user id)
          </label>
        </div>
      </fieldset>

      {mode === "create" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>
              Email <span className="font-normal text-ink/50">(optional if username set)</span>
            </label>
            <input name="email" type="email" autoComplete="off" className={inputClass} disabled={loading} />
          </div>
          <div>
            <label className={labelClass}>Username</label>
            <input name="username" className={inputClass} autoComplete="off" disabled={loading} />
          </div>
          <div>
            <label className={labelClass}>
              Initial password <span className="text-magenta">*</span>
            </label>
            <input name="password" type="password" required minLength={8} className={inputClass} disabled={loading} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Display name</label>
            <input name="name" className={inputClass} disabled={loading} />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Member email</label>
            <input name="promoteEmail" type="email" className={inputClass} disabled={loading} />
          </div>
          <div>
            <label className={labelClass}>Or user id (cuid)</label>
            <input name="promoteUserId" className={inputClass} autoComplete="off" disabled={loading} />
          </div>
        </div>
      )}

      <div className="grid gap-4 border-t border-paper-deep pt-6 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Coach type</label>
          <select name="type" required className={inputClass} disabled={loading}>
            {COACH_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>
            Session price (paise) <span className="font-normal text-ink/50">e.g. 49900 = ₹499</span>
          </label>
          <input
            name="sessionPaise"
            type="number"
            required
            min={0}
            step={100}
            defaultValue={49900}
            className={inputClass}
            disabled={loading}
          />
        </div>
        <div>
          <label className={labelClass}>Experience (years)</label>
          <input
            name="experienceYrs"
            type="number"
            min={0}
            max={80}
            defaultValue={0}
            className={inputClass}
            disabled={loading}
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
            <input name="available" type="checkbox" defaultChecked className="rounded border-paper-deep text-violet" disabled={loading} />
            Listed on marketplace
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Qualification</label>
          <input name="qualification" className={inputClass} disabled={loading} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Specialty</label>
          <input name="specialty" className={inputClass} disabled={loading} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Bio</label>
          <textarea name="bio" rows={3} className={inputClass} disabled={loading} />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-energy px-6 py-3 text-sm font-extrabold text-white transition hover:brightness-105 disabled:opacity-60"
      >
        {loading ? "Saving…" : mode === "create" ? "Create coach" : "Promote to coach"}
      </button>

      {message ? (
        <p
          role="status"
          className={
            message.kind === "ok"
              ? "rounded-card border border-progress/35 bg-progress/10 px-3 py-2 text-sm font-semibold text-progress"
              : "rounded-card border border-magenta/25 bg-magenta/5 px-3 py-2 text-sm text-magenta"
          }
        >
          {message.text}
        </p>
      ) : null}
    </form>
  );
}
