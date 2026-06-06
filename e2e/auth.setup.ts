import * as fs from "fs";
import * as path from "path";
import { test as setup, expect } from "@playwright/test";

const authFile = path.join(__dirname, ".auth", "member.json");

setup("authenticate member", async ({ page }) => {
  const email = process.env.E2E_PASSWORD_EMAIL?.trim();
  const password = process.env.E2E_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error(
      "E2E_PASSWORD_EMAIL and E2E_PASSWORD must be set (see docs/E2E_PLAYWRIGHT.md). Use the seeded beta member email and password from your .env — the WhatsApp OTP tab is not available in the UI."
    );
  }

  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  await page.goto("/login");
  await page.getByTestId("login-identifier").fill(email);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-password-submit").click();
  await page.waitForURL(/\/app(\/|$)/, { timeout: 45_000 });

  await page.context().storageState({ path: authFile });
});
