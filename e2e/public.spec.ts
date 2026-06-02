import { test, expect } from "@playwright/test";

test.describe("public shell", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("login page shows phone step", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/Welcome, sister/i)).toBeVisible();
    await expect(page.getByTestId("login-phone")).toBeVisible();
    await expect(page.getByTestId("login-send-otp")).toBeVisible();
  });
});
