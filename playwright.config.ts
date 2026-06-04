import { defineConfig, devices } from "@playwright/test";

const baseURL = (process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000").trim();

/** Only auto-start Next dev server when the target is local (not Vercel/preview). */
function shouldStartLocalWebServer(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return true;
  }
}

const startLocalWebServer = shouldStartLocalWebServer(baseURL);
const e2eAuth = Boolean(
  process.env.E2E_PASSWORD_EMAIL?.trim() && process.env.E2E_PASSWORD?.trim()
);

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
  ...(startLocalWebServer
    ? {
        webServer: {
          command: "npm run dev",
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            ...process.env,
            E2E_PASSWORD_EMAIL: process.env.E2E_PASSWORD_EMAIL ?? "",
            E2E_PASSWORD: process.env.E2E_PASSWORD ?? "",
          },
        },
      }
    : {}),
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
