import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { loadSupabaseVariables, supabaseServerClient } from "~/utils/supabase";
import { json } from "@remix-run/node";
import type { Session } from "@supabase/auth-helpers-remix";
import React from "react";
import { createBrowserClient } from "@supabase/auth-helpers-remix";
import { Database } from "~/supabase.types";
import { GlobalContext } from "./utils/globalContext";

type LoaderData = {
  env: {
    SUPABASE_API_URL: string;
    SUPABASE_ANON_KEY: string;
  };
  session: Session | null;
};

export const loader: LoaderFunction = async (args) => {
  const response = new Response();
  const supabaseClient = supabaseServerClient(args, response);
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  return json<LoaderData>(
    {
      env: {
        ...loadSupabaseVariables(),
      },
      session,
    },
    {
      headers: response.headers,
    }
  );
};
export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix Supabase Playwright",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  const { env, session } = useLoaderData<LoaderData>();

  const [supabase] = React.useState(() =>
    createBrowserClient<Database>(env.SUPABASE_API_URL, env.SUPABASE_ANON_KEY)
  );
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <GlobalContext.Provider value={{ viewer: session?.user, supabase }}>
          <Outlet />
        </GlobalContext.Provider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
