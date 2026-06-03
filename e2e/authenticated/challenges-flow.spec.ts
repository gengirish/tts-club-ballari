import { test, expect } from "@playwright/test";

test.describe("challenges UI (authenticated)", () => {
  test("join first challenge from list", async ({ page }) => {
    await page.goto("/app/challenges");
    await expect(page.getByRole("heading", { name: /Challenges/i })).toBeVisible();
    const joinButtons = page.getByRole("button", { name: /^Join$/ });
    if ((await joinButtons.count()) === 0) {
      await expect(page.getByRole("button", { name: /^Joined$/ }).first()).toBeVisible();
      return;
    }
    await joinButtons.first().click();
    await expect(page.getByText(/Could not join/i)).toBeHidden({ timeout: 15_000 });
    const joinedBtn = page.getByRole("button", { name: /^Joined$/ }).first();
    await expect(joinedBtn).toBeVisible({ timeout: 15_000 });
    await expect(joinedBtn).toBeDisabled();
  });
});
