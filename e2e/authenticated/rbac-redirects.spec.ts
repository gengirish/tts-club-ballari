import { test, expect } from "@playwright/test";

test.describe("RBAC redirects (member session)", () => {
  test("/admin redirects away for non-admin", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).not.toHaveURL(/\/admin/);
    await expect(page).toHaveURL(/\/app/);
  });

  test("/coach redirects away for non-coach", async ({ page }) => {
    await page.goto("/coach");
    await expect(page).not.toHaveURL(/\/coach/);
    await expect(page).toHaveURL(/\/app/);
  });

  test("/host redirects away for non-host", async ({ page }) => {
    await page.goto("/host");
    await expect(page).not.toHaveURL(/\/host/);
    await expect(page).toHaveURL(/\/app/);
  });
});
