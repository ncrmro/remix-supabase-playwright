import React from "react";
import type { User } from "@supabase/supabase-js";
import type { Database } from "~/supabase.types";
import type { SupabaseClient } from "@supabase/supabase-js";

interface GlobalContextType {
  viewer: User | undefined;
  supabase: SupabaseClient<Database, "public"> | undefined;
}

export const GlobalContext = React.createContext<GlobalContextType>({
  viewer: undefined,
  supabase: undefined,
});
