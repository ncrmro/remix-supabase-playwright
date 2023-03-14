import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Remix Supabase Playwright/);
});

test("login with seed user", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("email").fill("test@example.com");
  await page.getByPlaceholder("password").fill("password");
  await page.locator("button", { hasText: "Login" }).click();
  await page.waitForURL("/?index");
  await page.locator("p", { hasText: "Welcome back test@example.com" });
});
