# Welcome to Remix Supabase Playwright!

- [Remix Docs](https://remix.run/docs)
- [Playwright Docs](https://playwright.dev/docs/intro)
- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)

## Development

From your terminal:

```sh
supabase start
```

```sh
yarn run dev
```

This starts your app in development mode, rebuilding assets on file changes.

### Testing

Playwright tests can be ran with:

```sh
yarn test
```

Running only tests containing `signup`

```sh
yarn test -g signup
```

#### [Playwright fixtures](https://playwright.dev/docs/test-fixtures)

By specifying the user fixture `async ({ page, user })`

Playwright will set the Supabase session cookie and all the user will already be authenticated durign the test.

```typescript
import { test } from "./fixtures";

test("Already authenticated user", async ({ page, user }) => {
  await page.goto("/todos");
});
```

---

The database fixture `async ({ page, db })`

```typescript
import { test } from "./fixtures";

test("Already authenticated user", async ({ page, db }) => {
  await page.goto("/todos/new");
  // Create todo on frontend...

  await db.query(
    `SELECT * FROM todos WHERE user_id=$1`,
    [user.id]
  );
  
  // Wait for query will retry the query until the last paramter returns true or timeout.
  await db.waitForQuery(
    `SELECT * FROM todos WHERE user_id=$1`,
    [user.id],
    ({ rowCount }) => rowCount === 1
  );
});
```

## Deployment

If you've made any database migrations that are ready to be pushed to a live Supabase instance.

```sh
supabase db push
```

First, build your app for production:

```sh
yarn run build
```

Then run the app in production mode:

```sh
yarn start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`

### Using a Template

When you ran `npx create-remix@latest` there were a few choices for hosting. You can run that again to create a new project, then copy over your `app/` folder to the new project that's pre-configured for your target server.

```sh
cd ..
# create a new project, and pick a pre-configured host
npx create-remix@latest
cd my-new-remix-app
# remove the new project's app (not the old one!)
rm -rf app
# copy your app over
cp -R ../my-old-remix-app/app app
```
