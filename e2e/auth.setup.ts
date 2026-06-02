import * as fs from "fs";
import * as path from "path";
import { test as setup, expect } from "@playwright/test";

const authFile = path.join(__dirname, ".auth", "member.json");

setup("authenticate member", async ({ page }) => {
  const phone = process.env.E2E_TEST_PHONE?.trim();
  const otpRaw = process.env.E2E_TEST_OTP?.trim();
  if (!phone || !otpRaw) {
    throw new Error("E2E_TEST_PHONE and E2E_TEST_OTP must be set (see docs/E2E_PLAYWRIGHT.md).");
  }
  const otp = otpRaw.replace(/\D/g, "").padStart(6, "0").slice(0, 6);
  if (otp.length !== 6) {
    throw new Error("E2E_TEST_OTP must resolve to 6 digits.");
  }

  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  await page.goto("/login");
  await page.getByTestId("login-phone").fill(phone);
  await page.getByTestId("login-send-otp").click();
  await expect(page.getByTestId("login-otp")).toBeVisible();
  await page.getByTestId("login-otp").fill(otp);
  await page.getByTestId("login-verify").click();
  await page.waitForURL(/\/app(\/|$)/, { timeout: 45_000 });

  await page.context().storageState({ path: authFile });
});
