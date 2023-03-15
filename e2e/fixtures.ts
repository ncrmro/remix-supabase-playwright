import { test as base } from "@playwright/test";
import {
  DatabaseClient,
  databasePool,
  databaseClientTestFixture,
} from "./utils/database";
import { Pool } from "pg";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export { expect } from "@playwright/test";

export type TestFixtures = {
  db: DatabaseClient;
  user: { id: string; email: string; password: string };
};

type WorkerFixtures = {
  databasePoolClient: Pool;
  supabase: SupabaseClient;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  databasePoolClient: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const databaseClient = await databasePool();
      await use(databaseClient);
    },
    { scope: "worker" },
  ],
  supabase: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { SUPABASE_API_URL, SUPABASE_ANON_KEY } = process.env;
      if (
        typeof SUPABASE_API_URL !== "string" ||
        typeof SUPABASE_ANON_KEY !== "string"
      )
        throw new Error("Check supabase environment variables");
      const supabase = await createClient(SUPABASE_API_URL, SUPABASE_ANON_KEY);
      await use(supabase);
    },
    { scope: "worker" },
  ],
  db: async ({ databasePoolClient }, use) => {
    const db = await databaseClientTestFixture(databasePoolClient);
    await use(db);
    await db.release();
  },
  user: async ({ db, supabase, context }, use, testInfo) => {
    const time = Date.now();
    const username = `user${testInfo.workerIndex}${time}`;
    const email = `${username}@test.com`;
    const password = "password";
    const {
      rows: [user],
    } = await db.query<{ id: string; email: string }>(
      `
                INSERT INTO auth.users (instance_id, id,
                                        aud,
                                        "role",
                                        email,
                                        encrypted_password,
                                        email_confirmed_at, last_sign_in_at,
                                        raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at,
                                        updated_at, phone,
                                        phone_confirmed_at, confirmation_token, email_change,
                                        email_change_token_new, recovery_token)
                VALUES ('00000000-0000-0000-0000-000000000000'::uuid, gen_random_uuid(),
                        'authenticated',
                        'authenticated', $1,
                        '$2a$10$PznXR5VSgzjnAp7T/X7PCu6vtlgzdFt1zIr41IqP0CmVHQtShiXxS',
                        '2022-02-11 21:02:04.547', '2022-02-11 22:53:12.520',
                        '{ "provider": "email", "providers": [ "email" ] }', '{}', FALSE, '2022-02-11 21:02:04.542',
                        '2022-02-11 21:02:04.542', NULL, NULL, '', '', '', '')
                returning id, email`,
      [email]
    );
    await db.query(
      `
                INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at,
                                             updated_at)
                VALUES (gen_random_uuid(), $1::uuid, json_build_object('sub', $1), 'email', '2022-02-11 21:02:04.545',
                        '2022-02-11 21:02:04.545',
                        '2022-02-11 21:02:04.545');
            `,
      [user.id]
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    const session = data?.session;
    if (!session)
      throw new Error(
        "Error cleaning up user, supabase didn't return a session"
      );
    await context.addCookies([
      {
        name: "supabase-auth-token",
        value: JSON.stringify([
          session.access_token,
          session.refresh_token,
          null,
          null,
          null,
        ]),
        domain: "localhost",
        path: "/",
        sameSite: "Lax",
      },
    ]);
    await use({ ...user, password: "password" });
    await db.query(
      `DELETE
                        FROM todos
                        WHERE user_id = $1`,
      [user.id]
    );
    await db.query(
      `DELETE
                        FROM profiles
                        WHERE id = $1`,
      [user.id]
    );
    await db.query(
      `DELETE
                        FROM auth.users
                        WHERE id = $1`,
      [user.id]
    );
  },
});
