import { test, expect } from "@playwright/test";

test.describe("member area (authenticated)", () => {
  test("dashboard shows greeting and nav", async ({ page }) => {
    await page.goto("/app");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Score" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Progress" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Challenges" })).toBeVisible();
  });

  test("fitness score page loads and recompute is clickable", async ({ page }) => {
    await page.goto("/app/score");
    await expect(page.getByTestId("score-page-title")).toBeVisible();
    await page.getByTestId("score-recompute").click();
    await expect(page.getByTestId("score-recompute")).toBeEnabled();
  });

  test("progress page shows log form", async ({ page }) => {
    await page.goto("/app/progress");
    await expect(page.getByRole("heading", { name: /Progress/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Save progress/i })).toBeVisible();
  });

  test("challenges page lists challenges UI", async ({ page }) => {
    await page.goto("/app/challenges");
    await expect(page.getByRole("heading", { name: /Challenges/i })).toBeVisible();
  });

  test("coaches marketplace loads", async ({ page }) => {
    await page.goto("/app/coaches");
    await expect(page.getByRole("heading", { name: /Coaches/i })).toBeVisible();
  });

  test("community hub loads", async ({ page }) => {
    await page.goto("/app/community");
    await expect(page.getByRole("heading", { name: /Community/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /SOS/i })).toBeVisible();
  });

  test("C25K program page loads", async ({ page }) => {
    await page.goto("/app/programs/couch-to-5k");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
