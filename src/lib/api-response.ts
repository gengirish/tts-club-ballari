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
export const validationError = (details: unknown, msg = "Invalid input") =>
  fail("VALIDATION", msg, 422, details);
