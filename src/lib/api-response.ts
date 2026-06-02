import { NextResponse } from "next/server";

// Standard IntelliForge API envelope.
export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } };

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiResponse<T>>({ ok: true, data }, init);
}

export function fail(
  code: string,
  message: string,
  status = 400,
  details?: unknown
) {
  return NextResponse.json<ApiResponse<never>>(
    { ok: false, error: { code, message, details } },
    { status }
  );
}

// Common shorthands
export const unauthorized = (msg = "Authentication required") =>
  fail("UNAUTHORIZED", msg, 401);
export const forbidden = (msg = "Insufficient permissions") =>
  fail("FORBIDDEN", msg, 403);
export const notFound = (msg = "Not found") => fail("NOT_FOUND", msg, 404);

/** Build a single readable line from Zod `flatten()` output for `error.message`. */
function formatValidationMessage(details: unknown, fallback: string): string {
  if (!details || typeof details !== "object") return fallback;
  const rec = details as Record<string, unknown>;
  const parts: string[] = [];

  const formErrors = rec.formErrors;
  if (Array.isArray(formErrors)) {
    for (const m of formErrors) {
      if (typeof m === "string" && m.trim()) parts.push(m.trim());
    }
  }

  const fieldErrors = rec.fieldErrors;
  if (fieldErrors && typeof fieldErrors === "object") {
    const labels: Record<string, string> = {
      email: "Email",
      username: "Username",
      password: "Password",
      name: "Name",
      phone: "Phone",
      code: "Code",
    };
    for (const [key, val] of Object.entries(fieldErrors)) {
      if (!Array.isArray(val)) continue;
      const msgs = val.filter((m): m is string => typeof m === "string" && m.length > 0);
      if (!msgs.length) continue;
      const label = labels[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
      parts.push(`${label}: ${msgs.join(" ")}`);
    }
  }

  return parts.length > 0 ? parts.join(" · ") : fallback;
}

export const validationError = (details: unknown, msg = "Invalid input") =>
  fail("VALIDATION", formatValidationMessage(details, msg), 422, details);
