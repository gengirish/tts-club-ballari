import { test, expect } from "@playwright/test";
import { assertApiOk, assertApiEnvelope } from "../helpers/envelope";

test.describe("product flows — API + light browser (authenticated)", () => {
  test("GET /api/members/me returns profile form", async ({ request }) => {
    const res = await request.get("/api/members/me");
    expect(res.status()).toBe(200);
    const body: unknown = await res.json();
    assertApiOk(body);
    const form = (body as { data?: { form?: unknown } }).data?.form;
    expect(typeof form).toBe("object");
    expect(form).not.toBeNull();
  });

  test("GET /api/programs/walking-to-5k/enroll returns enrolled flag", async ({ request }) => {
    const res = await request.get("/api/programs/walking-to-5k/enroll");
    expect(res.status()).toBe(200);
    const body: unknown = await res.json();
    assertApiOk(body);
    expect(typeof (body as { data?: { enrolled?: unknown } }).data?.enrolled).toBe("boolean");
  });

  test("POST /api/challenges/:id/join succeeds for seeded challenge", async ({ page, request }) => {
    await page.goto("/app/challenges");
    const firstCard = page.locator("[data-challenge-id]").first();
    await expect(firstCard).toBeVisible({ timeout: 25_000 });
    const id = await firstCard.getAttribute("data-challenge-id");
    expect(id).toBeTruthy();
    const res = await request.post(`/api/challenges/${id}/join`, { data: {} });
    expect(res.status()).toBe(201);
    assertApiOk(await res.json());
  });

  test("POST /api/events/:id/register when upcoming events exist", async ({ request }) => {
    const listRes = await request.get("/api/events");
    expect(listRes.ok()).toBeTruthy();
    const listBody = (await listRes.json()) as { ok: boolean; data?: { id: string }[] };
    assertApiOk(listBody as unknown);
    const events = listBody.data ?? [];
    if (events.length === 0) {
      test.skip();
      return;
    }
    const eventId = events[0]!.id;
    const res = await request.post(`/api/events/${eventId}/register`, { data: {} });
    expect([200, 201]).toContain(res.status());
    assertApiOk(await res.json());
  });

  test("GET /api/events/:id is forbidden for member (host-only detail API)", async ({ request }) => {
    const listRes = await request.get("/api/events");
    const listBody = (await listRes.json()) as { ok: boolean; data?: { id: string }[] };
    if (!listBody.ok || !(listBody.data ?? []).length) {
      test.skip();
      return;
    }
    const eventId = listBody.data![0]!.id;
    const res = await request.get(`/api/events/${eventId}`);
    expect(res.status()).toBe(403);
    expect(assertApiEnvelope(await res.json()).ok).toBe(false);
  });

  test("POST /api/coaches/:id/book when coaches exist", async ({ page, request }) => {
    await page.goto("/app/coaches");
    const row = page.locator("[data-coach-id]").first();
    if ((await row.count()) === 0) {
      test.skip();
      return;
    }
    await expect(row).toBeVisible({ timeout: 20_000 });
    const coachId = await row.getAttribute("data-coach-id");
    expect(coachId).toBeTruthy();
    const res = await request.post(`/api/coaches/${coachId}/book`, { data: {} });
    expect(res.status()).toBe(200);
    assertApiOk(await res.json());
  });
});
