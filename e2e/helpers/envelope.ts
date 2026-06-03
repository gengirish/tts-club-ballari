/** Standard `ApiResponse<T>` from `lib/api-response.ts`. */
export function assertApiOk(body: unknown): asserts body is { ok: true } {
  if (typeof body !== "object" || body === null || !("ok" in body)) {
    throw new Error("Expected API envelope object");
  }
  if ((body as { ok: unknown }).ok !== true) {
    throw new Error(`Expected ok: true, got ${JSON.stringify(body)}`);
  }
}

export function assertApiEnvelope(body: unknown): { ok: boolean } {
  if (typeof body !== "object" || body === null || !("ok" in body)) {
    throw new Error("Expected API envelope { ok: boolean, ... }");
  }
  const ok = (body as { ok: unknown }).ok;
  if (typeof ok !== "boolean") {
    throw new Error("Expected envelope.ok to be boolean");
  }
  return { ok };
}
