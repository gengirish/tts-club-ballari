import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const e2eAuth = Boolean(process.env.E2E_TEST_PHONE?.trim() && process.env.E2E_TEST_OTP?.trim());

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  timeout: 60_000,
  expect: { timeout: 15_000 },
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      E2E_TEST_PHONE: process.env.E2E_TEST_PHONE ?? "",
      E2E_TEST_OTP: process.env.E2E_TEST_OTP ?? "",
    },
  },
  projects: e2eAuth
    ? [
        { name: "setup", testMatch: /auth\.setup\.ts/ },
        {
          name: "chromium",
          testDir: "e2e/authenticated",
          use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/member.json" },
          dependencies: ["setup"],
        },
        {
          name: "public",
          testMatch: [/public\.spec\.ts$/, /password-login\.spec\.ts$/],
          use: { ...devices["Desktop Chrome"] },
        },
      ]
    : [
        {
          name: "public",
          testMatch: [/public\.spec\.ts$/, /password-login\.spec\.ts$/],
          use: { ...devices["Desktop Chrome"] },
        },
      ],
});
