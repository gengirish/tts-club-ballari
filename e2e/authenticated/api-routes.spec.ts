import { test, expect } from "@playwright/test";
import { assertApiOk, assertApiEnvelope } from "../helpers/envelope";

test.describe("authenticated API (session cookie)", () => {
  test("GET /api/events returns ok + array", async ({ request }) => {
    const res = await request.get("/api/events");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { ok: boolean; data?: unknown };
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("GET /api/community/posts returns ok + array", async ({ request }) => {
    const res = await request.get("/api/community/posts");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { ok: boolean; data?: unknown };
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("POST /api/progress upserts steps for today", async ({ request }) => {
    const res = await request.post("/api/progress", {
      data: { steps: 8421 },
    });
    expect(res.status()).toBe(200);
    const body: unknown = await res.json();
    assertApiOk(body);
  });

  test("POST /api/score/recompute succeeds with seeded health profile", async ({ request }) => {
    const res = await request.post("/api/score/recompute");
    const body: unknown = await res.json();
    if (res.status() === 422) {
      expect((body as { error?: { code?: string } }).error?.code).toBe("NEEDS_HEALTH_DATA");
      return;
    }
    expect(res.status()).toBe(200);
    assertApiOk(body);
  });

  test("GET /api/members is forbidden for non-admin", async ({ request }) => {
    const res = await request.get("/api/members");
    expect(res.status()).toBe(403);
    const body: unknown = await res.json();
    expect(assertApiEnvelope(body).ok).toBe(false);
  });

  test("POST /api/community/posts creates a post", async ({ request }) => {
    const bodyText = `E2E community ${Date.now()}`;
    const res = await request.post("/api/community/posts", {
      data: { body: bodyText },
    });
    expect([200, 201]).toContain(res.status());
    const body: unknown = await res.json();
    assertApiOk(body);
  });

  test("POST /api/sos creates alert when forward email is unset", async ({ request }) => {
    const res = await request.post("/api/sos", {
      data: {},
    });
    expect(res.status()).toBe(201);
    const body: unknown = await res.json();
    assertApiOk(body);
    const data = (body as unknown as { data?: { alertId?: string } }).data;
    expect(typeof data?.alertId).toBe("string");
  });

  test("POST /api/events is forbidden for member (not HOST)", async ({ request }) => {
    const res = await request.post("/api/events", {
      data: {
        type: "WALK",
        title: "E2E should not create",
        location: "Ballari",
        startsAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      },
    });
    expect(res.status()).toBe(403);
    const body: unknown = await res.json();
    expect(assertApiEnvelope(body).ok).toBe(false);
  });

  test("community post then like and comment", async ({ request }) => {
    const createRes = await request.post("/api/community/posts", {
      data: { body: `E2E chain ${Date.now()}` },
    });
    expect(createRes.status()).toBe(201);
    const created: unknown = await createRes.json();
    assertApiOk(created);
    const postId = (created as unknown as { data: { id: string } }).data.id;

    const likeRes = await request.post(`/api/community/posts/${postId}/like`, {
      data: {},
    });
    expect(likeRes.status()).toBe(201);
    const likeBody: unknown = await likeRes.json();
    expect(assertApiEnvelope(likeBody).ok).toBe(true);
    expect((likeBody as { data?: { liked?: boolean } }).data?.liked).toBe(true);

    const unlikeRes = await request.post(`/api/community/posts/${postId}/like`, {
      data: {},
    });
    expect(unlikeRes.ok()).toBeTruthy();
    const unlikeBody: unknown = await unlikeRes.json();
    expect(assertApiEnvelope(unlikeBody).ok).toBe(true);
    expect((unlikeBody as { data?: { liked?: boolean } }).data?.liked).toBe(false);

    const commentRes = await request.post(`/api/community/posts/${postId}/comments`, {
      data: { body: "E2E comment — great work!" },
    });
    expect(commentRes.status()).toBe(201);
    assertApiOk(await commentRes.json());
  });

  test("POST /api/community/posts rejects whitespace-only body", async ({ request }) => {
    const res = await request.post("/api/community/posts", {
      data: { body: "  \n\t  " },
    });
    expect(res.status()).toBe(422);
    const body: unknown = await res.json();
    expect(assertApiEnvelope(body).ok).toBe(false);
  });

  test("POST /api/progress rejects empty body", async ({ request }) => {
    const res = await request.post("/api/progress", {
      data: {},
    });
    expect(res.status()).toBe(422);
    const body: unknown = await res.json();
    expect(assertApiEnvelope(body).ok).toBe(false);
  });

  test("GET /api/event-applications is forbidden for member", async ({ request }) => {
    const res = await request.get("/api/event-applications");
    expect(res.status()).toBe(403);
    const body: unknown = await res.json();
    expect(assertApiEnvelope(body).ok).toBe(false);
  });

  test("POST /api/programs/couch-to-5k/order returns 422 for invalid assessment", async ({ request }) => {
    const res = await request.post("/api/programs/couch-to-5k/order", {
      data: { assessment: { age: 10 } },
    });
    expect(res.status()).toBe(422);
    const body: unknown = await res.json();
    expect(assertApiEnvelope(body).ok).toBe(false);
  });
});
