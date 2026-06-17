import { test, expect } from "@playwright/test";
import { assertApiEnvelope, assertApiOk } from "./helpers/envelope";

test.describe("public shell", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Sign in$/i })).toHaveAttribute("href", "/login");
    await expect(page.getByRole("link", { name: /Walking to 5K registration/i })).toHaveAttribute(
      "href",
      "/walking-to-5k/register"
    );
  });

  test("public theme toggle persists after reload", async ({ page }) => {
    await page.goto("/");

    const themeToggle = page.getByRole("button", { name: /switch to (light|dark) mode/i });
    await expect(themeToggle).toBeVisible();

    const initialTheme = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(initialTheme === "light" || initialTheme === "dark").toBeTruthy();
    if (initialTheme !== "light" && initialTheme !== "dark") {
      throw new Error(`Unexpected initial theme: ${String(initialTheme)}`);
    }

    const expectedTheme = initialTheme === "dark" ? "light" : "dark";

    await themeToggle.click();

    await expect
      .poll(async () => page.evaluate(() => document.documentElement.dataset.theme))
      .toBe(expectedTheme);
    await expect
      .poll(async () =>
        page.evaluate((theme) => document.documentElement.classList.contains(theme), expectedTheme)
      )
      .toBe(true);
    await expect.poll(async () => page.evaluate(() => window.localStorage.getItem("sss-theme"))).toBe(expectedTheme);
    await expect(themeToggle).toHaveAccessibleName(new RegExp(`switch to ${initialTheme} mode`, "i"));

    await page.reload();

    await expect
      .poll(async () => page.evaluate(() => document.documentElement.dataset.theme))
      .toBe(expectedTheme);
    await expect
      .poll(async () =>
        page.evaluate((theme) => document.documentElement.classList.contains(theme), expectedTheme)
      )
      .toBe(true);
    await expect.poll(async () => page.evaluate(() => window.localStorage.getItem("sss-theme"))).toBe(expectedTheme);
    await expect(themeToggle).toHaveAccessibleName(new RegExp(`switch to ${initialTheme} mode`, "i"));
  });

  test("login page shows password sign-in by default", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /^Sign in$/i })).toBeVisible();
    await expect(page.getByTestId("login-identifier")).toBeVisible();
    await expect(page.getByTestId("login-password")).toBeVisible();
    await expect(page.getByTestId("login-password-submit")).toBeVisible();
  });

  test("login password shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-identifier").fill("not-a-real-user@example.com");
    await page.getByTestId("login-password").fill("wrong-pass-xyz");
    await page.getByTestId("login-password-submit").click();
    await expect(page.getByTestId("login-form-error")).toContainText(/invalid|password|timed out/i, {
      timeout: 35_000,
    });
  });

  test("login join flow shows sign-up fields", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-tab-register").click();
    await expect(page.getByRole("heading", { name: /^Join$/i })).toBeVisible();
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

  test("forgot password page loads", async ({ page }) => {
    await page.goto("/login/forgot-password");
    await expect(page.getByRole("heading", { name: /^Forgot password$/i })).toBeVisible();
    await expect(page.getByTestId("forgot-password-email")).toBeVisible();
    await expect(page.getByTestId("forgot-password-submit")).toBeVisible();
  });

  test("POST /api/auth/forgot-password returns ok envelope (generic response)", async ({ request }) => {
    const res = await request.post("/api/auth/forgot-password", {
      data: { email: `e2e-no-user-${Date.now()}@example.com` },
    });
    expect(res.status()).toBe(200);
    const body: unknown = await res.json();
    assertApiOk(body);
  });

  test("login email link tab shows magic email field", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-tab-magic").click();
    await expect(page.getByTestId("login-magic-email")).toBeVisible();
    await expect(page.getByTestId("login-magic-submit")).toBeVisible();
  });

  test("GET /llms.txt returns markdown with Sister Stride", async ({ request }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toMatch(/Sister Stride/i);
    expect(text).toMatch(/llms-full/i);
  });

  test("GET /robots.txt lists AI crawlers and sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain("GPTBot");
    expect(text.toLowerCase()).toContain("sitemap");
  });

  test("GET /sitemap.xml lists public paths", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain("urlset");
    expect(text).toContain("login");
  });
});

test.describe("walking to 5K", () => {
  test("programme overview redirects guests to registration", async ({ page }) => {
    await page.goto("/walking-to-5k");
    await expect(page).toHaveURL(/\/walking-to-5k\/register/);
    await expect(page.getByRole("heading", { name: /Create your account/i })).toBeVisible();
  });
});

/** Stable fake CUID-shaped id that should not exist after a normal seed. */
const NONEXISTENT_EVENT_ID = "cle2epublic0000000000001";

test.describe("public event APIs", () => {
  test("GET /api/public/events/:id returns 404 envelope when event missing", async ({ request }) => {
    const res = await request.get(`/api/public/events/${NONEXISTENT_EVENT_ID}`);
    expect(res.status()).toBe(404);
    const body: unknown = await res.json();
    expect(assertApiEnvelope(body).ok).toBe(false);
    expect((body as { error?: { code?: string } }).error?.code).toBe("NOT_FOUND");
  });

  test("POST /api/public/events/:id/apply returns 404 when event missing", async ({ request }) => {
    const res = await request.post(`/api/public/events/${NONEXISTENT_EVENT_ID}/apply`, {
      data: { applicantName: "x" },
    });
    expect(res.status()).toBe(404);
    const body: unknown = await res.json();
    expect(assertApiEnvelope(body).ok).toBe(false);
  });
});

test.describe("auth-related public APIs", () => {
  test("GET /api/members/me without session returns 401", async ({ request }) => {
    const res = await request.get("/api/members/me");
    expect(res.status()).toBe(401);
    const body: unknown = await res.json();
    expect(assertApiEnvelope(body).ok).toBe(false);
  });

  test("POST /api/auth/reset-password returns 400 for invalid token", async ({ request }) => {
    const res = await request.post("/api/auth/reset-password", {
      data: { token: "e2e-invalid-reset-token-24chars", password: "ValidLen8!" },
    });
    expect(res.status()).toBe(400);
    const body: unknown = await res.json();
    expect(assertApiEnvelope(body).ok).toBe(false);
    expect((body as { error?: { code?: string } }).error?.code).toBe("INVALID_OR_EXPIRED_TOKEN");
  });

  test("POST /api/auth/otp returns 422 for invalid phone", async ({ request }) => {
    const res = await request.post("/api/auth/otp", {
      data: { phone: "123" },
    });
    expect(res.status()).toBe(422);
    const body: unknown = await res.json();
    expect(assertApiEnvelope(body).ok).toBe(false);
  });
});

test.describe("password reset page", () => {
  test("reset password page loads with form fields", async ({ page }) => {
    await page.goto("/login/reset-password");
    await expect(page.getByRole("heading", { name: /^Reset password$/i })).toBeVisible();
    await expect(page.getByTestId("reset-password-new")).toBeVisible();
    await expect(page.getByTestId("reset-password-confirm")).toBeVisible();
    await expect(page.getByTestId("reset-password-submit")).toBeVisible();
  });
});
