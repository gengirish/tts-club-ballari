import { defineConfig, devices } from "@playwright/test";

const baseURL = (process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000").trim();

function shouldStartLocalWebServer(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return true;
  }
}

const startLocalWebServer = shouldStartLocalWebServer(baseURL);

/** Serial product-demo screenshots for docs/demo-doc-print.html → PDF. */
export default defineConfig({
  testDir: "e2e",
  testMatch: /demo-doc\.spec\.ts$/,
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 2,
  reporter: [["list"]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    viewport: { width: 1280, height: 800 },
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  timeout: 120_000,
  expect: { timeout: 30_000 },
  ...(startLocalWebServer
    ? {
        webServer: {
          command: "npm run dev",
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }
    : {}),
});
