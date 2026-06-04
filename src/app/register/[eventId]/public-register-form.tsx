"use client";

import { useState } from "react";

const GENDERS = [
  { v: "FEMALE", label: "Female" },
  { v: "MALE", label: "Male" },
  { v: "OTHER", label: "Other" },
  { v: "UNDISCLOSED", label: "Prefer not to say" },
] as const;

type Props = {
  eventId: string;
  paymentInstructions: string | null;
};

export function PublicEventRegisterForm({ eventId, paymentInstructions }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<(typeof GENDERS)[number]["v"]>("FEMALE");
  const [city, setCity] = useState("Ballari");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [okId, setOkId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setOkId(null);
    if (!file) {
      setMsg("Please attach your payment screenshot.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMsg("Screenshot must be JPG, PNG, or WebP.");
      return;
    }

    setLoading(true);
    const base64 = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        const res = r.result;
        if (typeof res !== "string") {
          reject(new Error("read"));
          return;
        }
        const i = res.indexOf(",");
        resolve(i >= 0 ? res.slice(i + 1) : res);
      };
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    }).catch(() => "");

    if (!base64) {
      setLoading(false);
      setMsg("Could not read the image file.");
      return;
    }

    const res = await fetch(`/api/public/events/${eventId}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicantName: name.trim(),
        phone: phone.trim(),
        age: Number.parseInt(age, 10),
        gender,
        city: city.trim(),
        paymentScreenshotBase64: base64,
        paymentScreenshotMime: file.type,
      }),
    });
    const body = await res.json();
    setLoading(false);

    if (!res.ok || !body.ok) {
      setMsg(body.error?.message ?? "Submission failed");
      return;
    }

    setOkId(body.data.applicationId);
    setMsg(
      "Submitted. After a volunteer verifies your payment, you will receive your digital pass link (via WhatsApp from our team). Thank you!"
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-card border border-paper-deep bg-paper-raised p-6 space-y-4 shadow-sm"
    >
      {paymentInstructions ? (
        <section className="rounded-lg bg-energy-soft/30 border border-energy/20 p-4 text-sm text-ink/90 whitespace-pre-wrap">
          <p className="font-bold text-violet text-xs uppercase mb-2">Payment</p>
          {paymentInstructions}
        </section>
      ) : (
        <p className="text-sm text-ink/60">
          Complete payment as directed by your host, then upload the confirmation screenshot below.
        </p>
      )}

      <label className="block text-xs font-bold uppercase text-magenta">
        Full name
        <input
          className="mt-1 w-full border rounded-card px-3 py-2 text-sm font-normal text-ink"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
        />
      </label>

      <label className="block text-xs font-bold uppercase text-magenta">
        Mobile number
        <input
          className="mt-1 w-full border rounded-card px-3 py-2 text-sm font-normal text-ink"
          inputMode="tel"
          placeholder="9876543210 or +91..."
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs font-bold uppercase text-magenta">
          Age
          <input
            className="mt-1 w-full border rounded-card px-3 py-2 text-sm font-normal text-ink"
            type="number"
            min={10}
            max={100}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </label>
        <label className="block text-xs font-bold uppercase text-magenta">
          Gender
          <select
            className="mt-1 w-full border rounded-card px-3 py-2 text-sm font-normal text-ink"
            value={gender}
            onChange={(e) => setGender(e.target.value as (typeof GENDERS)[number]["v"])}
          >
            {GENDERS.map((g) => (
              <option key={g.v} value={g.v}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-xs font-bold uppercase text-magenta">
        City
        <input
          className="mt-1 w-full border rounded-card px-3 py-2 text-sm font-normal text-ink"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
      </label>

      <label className="block text-xs font-bold uppercase text-magenta">
        Payment screenshot
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-1 w-full text-sm"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-energy py-3 text-sm font-extrabold text-white disabled:opacity-60"
      >
        {loading ? "Submitting…" : "Submit registration"}
      </button>

      {msg ? (
        <p className={`text-sm font-semibold ${okId ? "text-violet" : "text-magenta"}`}>{msg}</p>
      ) : null}
    </form>
  );
}
