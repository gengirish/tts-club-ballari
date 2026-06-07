import { test, expect } from "@playwright/test";

test.describe("member area (authenticated)", () => {
  test("dashboard shows greeting, Walking to 5K CTA, and nav", async ({ page }) => {
    await page.goto("/app");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Walking to 5K/i })).toBeVisible();
    await expect(page.getByTestId("app-home-walking-to-5k-register")).toBeVisible();
    await expect(page.getByRole("link", { name: "Score" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Progress" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Challenges" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Events" })).toBeVisible();
  });

  test("Walking to 5K home CTA opens interactive registration", async ({ page }) => {
    await page.goto("/app");
    await page.getByTestId("app-home-walking-to-5k-register").click();
    await expect(page).toHaveURL(/\/walking-to-5k\/register/);
    await expect(page.getByRole("heading", { name: /Walking to 5K registration/i })).toBeVisible();
  });

  test("dashboard nav reaches C25K program page", async ({ page }) => {
    await page.goto("/app");
    await page.getByRole("link", { name: "C25K" }).click();
    await expect(page).toHaveURL(/\/app\/programs\/couch-to-5k/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
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

  test("events hub loads", async ({ page }) => {
    await page.goto("/app/events");
    await expect(page.getByTestId("events-page-title")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Events/i })).toBeVisible();
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

  test("C25K program page loads with Walking to 5K registration CTA", async ({ page }) => {
    await page.goto("/app/programs/couch-to-5k");
    await expect(page.getByTestId("c25k-page")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByTestId("c25k-walking-to-5k-register")).toBeVisible();
    await expect(page.getByTestId("c25k-walking-to-5k-register")).toHaveAttribute("href", "/walking-to-5k/register");
  });

  test("profile edit page loads for onboarded member", async ({ page }) => {
    await page.goto("/app/profile");
    await expect(page.getByRole("heading", { name: /Edit details/i })).toBeVisible();
    await expect(page.getByTestId("app-back-to-home")).toBeVisible();
  });

  test("community hub shows wellness section", async ({ page }) => {
    await page.goto("/app/community");
    await expect(page.getByRole("heading", { name: /Community/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Women's wellness/i })).toBeVisible();
  });

  test("C25K page shows hero and weekly session plan", async ({ page }) => {
    await page.goto("/app/programs/couch-to-5k");
    await expect(page.getByTestId("c25k-hero-title")).toBeVisible();
    await expect(page.getByTestId("c25k-session-blocks")).toBeVisible();
  });

  test("onboarded member visiting /app/onboarding is redirected to dashboard", async ({ page }) => {
    await page.goto("/app/onboarding");
    await expect(page).toHaveURL(/\/app\/?$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("events list to detail and back when events exist", async ({ page }) => {
    await page.goto("/app/events");
    await expect(page.getByTestId("events-page-title")).toBeVisible();
    const details = page.getByRole("link", { name: /^Details$/i }).first();
    if ((await details.count()) === 0) {
      await expect(page.getByText(/No upcoming events/i)).toBeVisible();
      return;
    }
    await details.click();
    await expect(page).toHaveURL(/\/app\/events\//);
    await expect(page.getByTestId("event-back-to-list")).toBeVisible();
    await page.getByTestId("event-back-to-list").click();
    await expect(page).toHaveURL(/\/app\/events$/);
  });
});
