import { test, expect } from "@playwright/test";
import { assertApiEnvelope } from "./helpers/envelope";

test.describe("public shell", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("login page shows phone step", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/Welcome, sister/i)).toBeVisible();
    await expect(page.getByTestId("login-phone")).toBeVisible();
    await expect(page.getByTestId("login-send-otp")).toBeVisible();
  });

  test("login password tab shows identifier + password fields", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-tab-password").click();
    await expect(page.getByTestId("login-identifier")).toBeVisible();
    await expect(page.getByTestId("login-password")).toBeVisible();
    await expect(page.getByTestId("login-password-submit")).toBeVisible();
  });

  test("login register tab shows sign-up fields", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-tab-register").click();
    await expect(page.getByTestId("register-email")).toBeVisible();
    await expect(page.getByTestId("register-username")).toBeVisible();
    await expect(page.getByTestId("register-password")).toBeVisible();
    await expect(page.getByTestId("register-submit")).toBeVisible();
  });

  test("POST /api/auth/register rejects malformed JSON body", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      headers: { "Content-Type": "application/json" },
      data: '{"not": "closed"',
    });
    expect(res.status()).toBe(400);
    const body: unknown = await res.json();
    expect(assertApiEnvelope(body).ok).toBe(false);
    expect((body as { error?: { code?: string } }).error?.code).toBe("INVALID_JSON");
  });

  test("GET /api/events without session returns 401", async ({ request }) => {
    const res = await request.get("/api/events");
    expect(res.status()).toBe(401);
    const body: unknown = await res.json();
    expect(assertApiEnvelope(body).ok).toBe(false);
  });

  test("GET /api/community/posts without session returns 401", async ({ request }) => {
    const res = await request.get("/api/community/posts");
    expect(res.status()).toBe(401);
    const body: unknown = await res.json();
    expect(assertApiEnvelope(body).ok).toBe(false);
  });

  test("POST /api/progress without session returns 401", async ({ request }) => {
    const res = await request.post("/api/progress", {
      data: { steps: 1000 },
    });
    expect(res.status()).toBe(401);
    const body: unknown = await res.json();
    expect(assertApiEnvelope(body).ok).toBe(false);
  });

  test("POST /api/auth/register returns 422 when email and username missing", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      data: { password: "ValidLen8!" },
    });
    expect(res.status()).toBe(422);
    const body: unknown = await res.json();
    expect(assertApiEnvelope(body).ok).toBe(false);
  });

  test("verify-request page loads", async ({ page }) => {
    await page.goto("/login/verify-request");
    await expect(page.getByRole("heading", { name: /Check your email/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to sign in/i })).toBeVisible();
  });
});
