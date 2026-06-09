import * as fs from "fs";
import * as path from "path";
import { test, expect } from "@playwright/test";

const OUT_DIR = path.join(process.cwd(), "docs", "guide-screenshots");

function shot(name: string) {
  return path.join(OUT_DIR, name);
}

function deploymentHost(): string {
  try {
    return new URL(process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000").hostname;
  } catch {
    return "";
  }
}

/** Block signed-in captures on obvious production hosts unless explicitly allowed. */
function memberScreenshotsDisallowedOnProd(): boolean {
  const host = deploymentHost().toLowerCase();
  const looksProd =
    host.endsWith("intelliforge.tech") ||
    host === "sister-stride.vercel.app" ||
    (host.includes("vercel.app") && host.includes("sister-stride"));
  if (!looksProd) return false;
  return process.env.E2E_GUIDE_ALLOW_PROD_MEMBER !== "1";
}

test.beforeAll(() => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
});

test.describe("Member guide — public pages (safe on production)", () => {
  test("01 home", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({ path: shot("01-home.png"), fullPage: true });
  });

  test("02 login", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /^Sign in$/i })).toBeVisible();
    await page.screenshot({ path: shot("02-login.png"), fullPage: true });
  });

  test("03 login join tab", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByTestId("login-tab-register").click();
    await expect(page.getByRole("heading", { name: /^Join$/i })).toBeVisible();
    await page.screenshot({ path: shot("03-login-join.png"), fullPage: true });
  });

  test("04 forgot password", async ({ page }) => {
    await page.goto("/login/forgot-password", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /^Forgot password$/i })).toBeVisible();
    await page.screenshot({ path: shot("04-forgot-password.png"), fullPage: true });
  });

  test("05 walking to 5K registration", async ({ page }) => {
    await page.goto("/walking-to-5k/register", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Walking to 5K registration|Create your account/i })).toBeVisible({
      timeout: 45_000,
    });
    await page.screenshot({ path: shot("05-walking-register.png"), fullPage: true });
  });
});

test.describe("Member guide — signed-in member app", () => {
  test("captures dashboard and main tabs", async ({ page }) => {
    const email = process.env.E2E_PASSWORD_EMAIL?.trim();
    const password = process.env.E2E_PASSWORD?.trim();
    if (!email || !password) {
      test.skip();
      return;
    }
    if (memberScreenshotsDisallowedOnProd()) {
      test.skip();
      return;
    }

    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByTestId("login-identifier").fill(email);
    await page.getByTestId("login-password").fill(password);
    await page.getByTestId("login-password-submit").click();
    await page.waitForURL(/\/app/, { timeout: 60_000 });

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 30_000 });
    await page.screenshot({ path: shot("10-app-home.png"), fullPage: true });

    await page.goto("/app/score", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("score-page-title")).toBeVisible();
    await page.screenshot({ path: shot("11-app-score.png"), fullPage: true });

    await page.goto("/app/progress", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Progress/i })).toBeVisible();
    await page.screenshot({ path: shot("12-app-progress.png"), fullPage: true });

    await page.goto("/app/challenges", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Challenges/i })).toBeVisible();
    await page.screenshot({ path: shot("13-app-challenges.png"), fullPage: true });

    await page.goto("/app/events", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("events-page-title")).toBeVisible();
    await page.screenshot({ path: shot("14-app-events.png"), fullPage: true });

    await page.goto("/app/programs/couch-to-5k", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("c25k-page")).toBeVisible();
    await page.screenshot({ path: shot("15-app-c25k.png"), fullPage: true });

    await page.goto("/app/coaches", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Coaches/i })).toBeVisible();
    await page.screenshot({ path: shot("16-app-coaches.png"), fullPage: true });

    await page.goto("/app/community", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Community/i })).toBeVisible();
    await page.screenshot({ path: shot("17-app-community.png"), fullPage: true });
  });
});
