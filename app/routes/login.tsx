import React from "react";
import { Link } from "@remix-run/react";
import { redirect } from "@remix-run/router";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import useSupabase, { supabaseServerClient } from "~/utils/supabase";

export const loader: LoaderFunction = async (args) => {
  const response = new Response();
  // Redirect authenticated users
  const supabase = supabaseServerClient(args, response);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session)
    // there is no session, therefore, we are redirecting
    // to the landing page. The `/?index` is required here
    // for Remix to correctly call our loaders
    return redirect("/?index", {
      // we still need to return response.headers to attach the set-cookie header
      headers: response.headers,
    });
  return json(
    {},
    {
      headers: response.headers,
    }
  );
};

export function authFieldReducer(
  state: { email: string; password: string },
  event: React.ChangeEvent<HTMLInputElement>
) {
  const { name, value } = event.target;
  switch (name) {
    case "email":
    case "password":
      state[name] = value;
      break;
    default:
      throw new Error("Field was not expected");
  }
  return structuredClone(state);
}

export default function LoginRoute() {
  const supabase = useSupabase();
  const [state, setState] = React.useReducer(authFieldReducer, {
    email: "",
    password: "",
  });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const { data } = await supabase.auth.signInWithPassword(state);
        if (data.session) window.location.reload();
      }}
    >
      <h1>Login</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
        <input
          name="email"
          placeholder="Email"
          value={state.email}
          onChange={setState}
          autoComplete="email"
          type="email"
          required
        />
        <input
          name="password"
          placeholder="Password"
          value={state.password}
          onChange={setState}
          autoComplete="current-password"
          type="password"
          required
        />
        <div>
          <div style={{ display: "flex", gap: "1em" }}>
            <Link to="/reset-password">Reset Password</Link>
            <Link to="/signup">Create an account</Link>
          </div>
          <button type="submit" style={{ float: "right" }}>
            Login
          </button>
        </div>
      </div>
    </form>
  );
}
