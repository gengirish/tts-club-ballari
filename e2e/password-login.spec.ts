import { test, expect } from "@playwright/test";
import { assertApiEnvelope } from "./helpers/envelope";

/** Strong enough for registerSchema (min 8). */
const E2E_PASSWORD = "E2ePass!99";

test.describe("email + password login", () => {
  test("POST /api/auth/register then password tab reaches /app", async ({
    page,
    request,
  }) => {
    const email = `e2e-${Date.now()}@example.com`;

    const regRes = await request.post("/api/auth/register", {
      data: {
        email,
        password: E2E_PASSWORD,
        name: "E2E Password Member",
      },
    });

    const regBody: unknown = await regRes.json();
    expect(regRes.status(), JSON.stringify(regBody)).toBe(201);
    expect(assertApiEnvelope(regBody).ok).toBe(true);

    await page.goto("/login");
    await page.getByTestId("login-identifier").fill(email);
    await page.getByTestId("login-password").fill(E2E_PASSWORD);
    await page.getByTestId("login-password-submit").click();
    await page.waitForURL(/\/app(\/|$)/, { timeout: 45_000 });
  });

  test("POST /api/auth/register with username only then password tab reaches /app", async ({
    page,
    request,
  }) => {
    const username = `e2e_u_${Date.now()}`;

    const regRes = await request.post("/api/auth/register", {
      data: {
        username,
        password: E2E_PASSWORD,
      },
    });

    const regBody: unknown = await regRes.json();
    expect(regRes.status(), JSON.stringify(regBody)).toBe(201);
    expect(assertApiEnvelope(regBody).ok).toBe(true);

    await page.goto("/login");
    await page.getByTestId("login-identifier").fill(username);
    await page.getByTestId("login-password").fill(E2E_PASSWORD);
    await page.getByTestId("login-password-submit").click();
    await page.waitForURL(/\/app/, { timeout: 45_000 });
  });

  test("password sign-in accepts unique display name as identifier", async ({ page, request }) => {
    const email = `e2e-name-${Date.now()}@example.com`;
    const displayName = `E2E Unique ${Date.now()}`;
    const regRes = await request.post("/api/auth/register", {
      data: {
        email,
        password: E2E_PASSWORD,
        name: displayName,
      },
    });
    expect(regRes.status()).toBe(201);
    expect(assertApiEnvelope(await regRes.json()).ok).toBe(true);

    await page.goto("/login");
    await page.getByTestId("login-identifier").fill(displayName);
    await page.getByTestId("login-password").fill(E2E_PASSWORD);
    await page.getByTestId("login-password-submit").click();
    await page.waitForURL(/\/app/, { timeout: 45_000 });
  });
});
