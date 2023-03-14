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
  await page.locator("a", { hasText: "todos" }).click();
  await page.locator("li", { hasText: "Read Remix Docs true" }).waitFor();
});

test("signup", async ({ page }) => {
  const time = Date.now();
  const username = `user${time}`;
  const email = `${username}@test.com`;
  await page.goto("/signup");
  await page.getByPlaceholder("email").fill(email);
  await page.getByPlaceholder("password").fill("testpassword");
  await page.locator("button", { hasText: "Submit" }).click();
  await page.waitForURL("/?index");
  await page.locator("p", { hasText: "Welcome back test@example.com" });
});
