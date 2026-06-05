"use client";

import { useState } from "react";
import { isValidPhone } from "@/lib/utils/phone";

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

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_PAYMENT_IMAGE_BYTES = 5 * 1024 * 1024;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs font-semibold text-magenta" role="alert">
      {message}
    </p>
  );
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function setFieldError(field: string, message?: string) {
    setFieldErrors((prev) => {
      if (!message) {
        if (!(field in prev)) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      }
      if (prev[field] === message) return prev;
      return { ...prev, [field]: message };
    });
  }

  function validateFile(nextFile: File | null): string | undefined {
    if (!nextFile) return "Please attach your payment screenshot.";
    if (!ACCEPTED_IMAGE_TYPES.includes(nextFile.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
      return "Screenshot must be JPG, PNG, or WebP.";
    }
    if (nextFile.size > MAX_PAYMENT_IMAGE_BYTES) {
      return `Screenshot must be ${formatFileSize(MAX_PAYMENT_IMAGE_BYTES)} or smaller.`;
    }
    return undefined;
  }

  function validateForm(): boolean {
    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 2) nextErrors.name = "Enter your full name (at least 2 characters).";
    if (!phone.trim()) nextErrors.phone = "Enter your mobile number.";
    else if (!isValidPhone(phone.trim())) {
      nextErrors.phone = "Enter a valid 10-digit Indian mobile number (you can include +91 or spaces).";
    }

    const ageNumber = Number.parseInt(age, 10);
    if (!Number.isFinite(ageNumber)) nextErrors.age = "Enter your age.";
    else if (ageNumber < 10 || ageNumber > 100) nextErrors.age = "Age must be between 10 and 100.";

    if (!city.trim()) nextErrors.city = "Enter your city.";
    const fileError = validateFile(file);
    if (fileError) nextErrors.file = fileError;

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setMsg(Object.values(nextErrors)[0] ?? "Please correct the highlighted fields.");
      return false;
    }
    return true;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setOkId(null);
    if (!validateForm()) return;

    const selectedFile = file;
    if (!selectedFile) {
      setFieldError("file", "Please attach your payment screenshot.");
      setMsg("Please attach your payment screenshot.");
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
      r.readAsDataURL(selectedFile);
    }).catch(() => "");

    if (!base64) {
      setLoading(false);
      setFieldError("file", "Could not read the image file. Please reselect it and try again.");
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
        paymentScreenshotMime: selectedFile.type,
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
          onChange={(e) => {
            const value = e.target.value;
            setName(value);
            if (value.trim().length >= 2) setFieldError("name");
          }}
          onBlur={() =>
            setFieldError(
              "name",
              name.trim().length >= 2 ? undefined : "Enter your full name (at least 2 characters)."
            )
          }
          required
          minLength={2}
        />
        <FieldError message={fieldErrors.name} />
      </label>

      <label className="block text-xs font-bold uppercase text-magenta">
        Mobile number
        <input
          className="mt-1 w-full border rounded-card px-3 py-2 text-sm font-normal text-ink"
          inputMode="tel"
          placeholder="9876543210 or +91..."
          value={phone}
          onChange={(e) => {
            const value = e.target.value;
            setPhone(value);
            if (!value.trim() || isValidPhone(value.trim())) setFieldError("phone");
          }}
          onBlur={() =>
            setFieldError(
              "phone",
              !phone.trim()
                ? "Enter your mobile number."
                : isValidPhone(phone.trim())
                  ? undefined
                  : "Enter a valid 10-digit Indian mobile number (you can include +91 or spaces)."
            )
          }
          required
        />
        <p className="mt-1 text-[11px] font-normal normal-case text-ink/55">
          Use a 10-digit Indian number (you can include +91 or spaces).
        </p>
        <FieldError message={fieldErrors.phone} />
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
            onChange={(e) => {
              const value = e.target.value;
              setAge(value);
              const ageNumber = Number.parseInt(value, 10);
              if (!value.trim()) return;
              if (Number.isFinite(ageNumber) && ageNumber >= 10 && ageNumber <= 100) setFieldError("age");
            }}
            onBlur={() => {
              const ageNumber = Number.parseInt(age, 10);
              setFieldError(
                "age",
                !age.trim()
                  ? "Enter your age."
                  : Number.isFinite(ageNumber) && ageNumber >= 10 && ageNumber <= 100
                    ? undefined
                    : "Age must be between 10 and 100."
              );
            }}
            required
          />
          <FieldError message={fieldErrors.age} />
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
          onChange={(e) => {
            const value = e.target.value;
            setCity(value);
            if (value.trim()) setFieldError("city");
          }}
          onBlur={() => setFieldError("city", city.trim() ? undefined : "Enter your city.")}
          required
        />
        <FieldError message={fieldErrors.city} />
      </label>

      <label className="block text-xs font-bold uppercase text-magenta">
        Payment screenshot
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-1 w-full text-sm"
          onChange={(e) => {
            const nextFile = e.target.files?.[0] ?? null;
            setFile(nextFile);
            setFieldError("file", validateFile(nextFile));
          }}
        />
        {file ? (
          <p className="mt-1 text-[11px] font-normal normal-case text-ink/55">
            Selected: {file.name} ({formatFileSize(file.size)})
          </p>
        ) : (
          <p className="mt-1 text-[11px] font-normal normal-case text-ink/55">
            Accepted: JPG, PNG, WebP up to {formatFileSize(MAX_PAYMENT_IMAGE_BYTES)}.
          </p>
        )}
        <FieldError message={fieldErrors.file} />
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
