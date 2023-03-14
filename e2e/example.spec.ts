import { expect, test } from "./fixtures";

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
  // Test todos route
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

test("User can create todo", async ({ page, user, db }) => {
  await page.goto("/todos");
  await page.locator("h1", { hasText: "Your Todos" }).waitFor();
  await page.locator("a", { hasText: "Add Todo" }).click();
  await page.locator("input").fill(`Test`);
  await page.locator("button", { hasText: "Create" }).click();
  await page.waitForURL("/todos");
  await page.locator("li", { hasText: "Test" });
  await db.waitForQuery(
    `SELECT * FROM todos WHERE user_id=$1`,
    [user.id],
    ({ rowCount }) => rowCount === 1
  );
});
