import { test, expect } from "@playwright/test";

test.describe("authenticated API", () => {
  test("GET /api/events returns envelope", async ({ request }) => {
    const res = await request.get("/api/events");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { ok: boolean; data?: unknown };
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });
});
