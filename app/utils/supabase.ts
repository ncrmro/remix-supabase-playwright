import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supabase.types";
import { createServerClient } from "@supabase/auth-helpers-remix";
import type { DataFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/router";
import { GlobalContext } from "~/utils/globalContext";
import React from "react";
import * as process from "process";

export function loadSupabaseVariables() {
  const { SUPABASE_API_URL, SUPABASE_ANON_KEY } = process.env;
  if (
    typeof SUPABASE_API_URL !== "string" ||
    typeof SUPABASE_ANON_KEY !== "string"
  )
    throw new Error(
      "Check Supabase variables SUPABASE_API_URL and SUPABASE_ANON_KEY"
    );
  return { SUPABASE_API_URL, SUPABASE_ANON_KEY };
}

export function supabaseServerClient(
  args: DataFunctionArgs,
  response: Response
) {
  const { SUPABASE_API_URL, SUPABASE_ANON_KEY } = loadSupabaseVariables();
  return createServerClient<Database, "public">(
    SUPABASE_API_URL,
    SUPABASE_ANON_KEY,
    {
      request: args.request,
      response,
    }
  );
}

export default function useSupabase() {
  const supabase = React.useContext(GlobalContext).supabase;
  if (!supabase) throw new Error("Supabase was not found in global context!");
  return supabase;
}

export async function supabaseAuthenticatedRoute(
  args: DataFunctionArgs,
  response = new Response()
): Promise<[Response, SupabaseClient<Database, "public">]> {
  const supabase = supabaseServerClient(args, response);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    // there is no session, therefore, we are redirecting
    // to the landing page. The `/?index` is required here
    // for Remix to correctly call our loaders
    return [
      redirect("/?index", {
        // we still need to return response.headers to attach the set-cookie header
        headers: response.headers,
      }),
      supabase,
    ];
  }
  return [response, supabase];
}
