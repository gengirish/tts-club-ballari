import { test, expect } from "@playwright/test";

test.describe("member UI actions (authenticated)", () => {
  test("progress form saves steps for today", async ({ page }) => {
    await page.goto("/app/progress");
    await expect(page.getByRole("heading", { name: /Progress/i })).toBeVisible();
    await page.getByLabel(/^Steps$/i).fill("9123");
    await page.getByRole("button", { name: /Save progress/i }).click();
    await expect(page.getByText(/Saved for today/i)).toBeVisible({ timeout: 20_000 });
  });

  test("community composer posts and shows on feed", async ({ page }) => {
    const snippet = `E2E UI ${Date.now()}`;
    await page.goto("/app/community");
    await expect(page.getByRole("heading", { name: /Community/i })).toBeVisible();
    await page.getByTestId("community-composer-body").fill(snippet);
    await page.getByTestId("community-composer-submit").click();
    await expect(page.getByText(snippet, { exact: false })).toBeVisible({ timeout: 20_000 });
  });
});
