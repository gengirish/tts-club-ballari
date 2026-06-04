import { test, expect } from "@playwright/test";

/**
 * Covers Sister Stride beta bug fixes (logout, community UX, coaches, C25K assessment).
 * Requires E2E_PASSWORD_EMAIL + E2E_PASSWORD (see docs/E2E_PLAYWRIGHT.md). Run `npm run db:seed` so the beta member exists.
 */
test.describe("beta regression (authenticated UI)", () => {
  test("member app shows log out and signing out reaches login", async ({ page }) => {
    await page.goto("/app");
    await expect(page.getByTestId("app-logout")).toBeVisible();
    const signOutPost = page.waitForResponse(
      (res) =>
        res.url().includes("/api/auth/signout") && res.request().method() === "POST" && res.ok(),
      { timeout: 30_000 }
    );
    await page.getByTestId("app-logout").click();
    await signOutPost;
    await expect(page).toHaveURL(/\/login/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: /Welcome, sister/i })).toBeVisible();
  });

  test("community composer rejects whitespace-only post", async ({ page }) => {
    await page.goto("/app/community");
    await expect(page.getByRole("heading", { name: /Community/i })).toBeVisible();
    await page.getByTestId("community-composer-body").fill("   \n  ");
    await page.getByTestId("community-composer-submit").click();
    await expect(page.getByTestId("community-composer-error")).toContainText(/write something/i, {
      timeout: 10_000,
    });
  });

  test("community post like toggles and comments panel accepts input", async ({ page }) => {
    const snippet = `E2E beta ${Date.now()}`;
    await page.goto("/app/community");
    await page.getByTestId("community-composer-body").fill(snippet);
    await page.getByTestId("community-composer-submit").click();
    const card = page.getByRole("article").filter({ hasText: snippet });
    await expect(card).toBeVisible({ timeout: 20_000 });

    const likeBtn = card.getByTestId("community-post-like");
    await expect(likeBtn).toBeVisible();
    await expect(likeBtn).toHaveAttribute("aria-pressed", "false");
    await likeBtn.click();
    await expect(likeBtn).toHaveAttribute("aria-pressed", "true", { timeout: 15_000 });
    await likeBtn.click();
    await expect(likeBtn).toHaveAttribute("aria-pressed", "false", { timeout: 15_000 });

    await card.getByTestId("community-post-comments-toggle").click();
    await expect(card.getByTestId("community-post-comment-body")).toBeVisible();
    const commentLine = `E2E comment ${Date.now()}`;
    await card.getByTestId("community-post-comment-body").fill(commentLine);
    await card.getByTestId("community-post-comment-submit").click();
    await expect(card.getByText(commentLine, { exact: false })).toBeVisible({ timeout: 15_000 });
  });

  test("community long unbroken text stays within post card width", async ({ page }) => {
    const id = Date.now();
    const long = `${id}-${"a".repeat(300)}`;
    await page.goto("/app/community");
    await page.getByTestId("community-composer-body").fill(long);
    await page.getByTestId("community-composer-submit").click();
    const card = page.getByRole("article").filter({ hasText: String(id) });
    await expect(card).toBeVisible({ timeout: 20_000 });
    const body = card.locator("p").filter({ hasText: String(id) }).first();
    const narrow = await body.evaluate((el) => el.scrollWidth <= el.clientWidth + 2);
    expect(narrow).toBeTruthy();
  });

  test("coach book session becomes Requested and survives reload", async ({ page }) => {
    await page.goto("/app/coaches");
    await expect(page.getByRole("heading", { name: /Coaches/i })).toBeVisible();
    const bookBtn = page.getByRole("button", { name: /Book session/i }).first();
    if ((await bookBtn.count()) === 0) {
      test.skip();
      return;
    }
    await bookBtn.click();
    await expect(page.getByRole("button", { name: /^Requested$/ })).toBeVisible({ timeout: 20_000 });
    await page.reload();
    await expect(page.getByRole("button", { name: /^Requested$/ })).toBeVisible({ timeout: 15_000 });
  });

  test("C25K pay section shows friendly weight validation when under minimum", async ({ page }) => {
    await page.goto("/app/programs/couch-to-5k");
    await expect(page.getByTestId("c25k-page")).toBeVisible();
    if (await page.getByTestId("c25k-enrolled-banner").isVisible()) {
      test.skip();
      return;
    }
    await expect(page.getByTestId("c25k-pay-section")).toBeVisible();
    await page.getByTestId("c25k-assessment-weight").fill("10");
    await page.getByTestId("c25k-pay-cta").click();
    await expect(page.getByText(/weight must be at least 20/i)).toBeVisible({ timeout: 10_000 });
  });
});
