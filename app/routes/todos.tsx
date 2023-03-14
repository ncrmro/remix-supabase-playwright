import { Database } from "~/supabase.types";
import { json, LoaderFunction } from "@remix-run/node";
import { supabaseAuthenticatedRoute } from "~/utils/supabase";
import { useLoaderData } from "@remix-run/react";

type Todo = Database["public"]["Tables"]["todos"]["Row"];

interface LoaderData {
  todos: Todo[];
}

export const loader: LoaderFunction = async (args) => {
  const [, supabase] = await supabaseAuthenticatedRoute(args);

  const { data: todos } = await supabase.from("todos").select("*");
  if (!todos) throw new Error("Error loading todos!");

  // in order for the set-cookie header to be set,
  // headers must be returned as part of the loader response
  return json<LoaderData>({ todos });
};

export default function TodosRoute() {
  const { todos } = useLoaderData<LoaderData>();
  return (
    <div>
      <h1>Your Todos</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.text} {String(todo.completed)}
          </li>
        ))}
      </ul>
    </div>
  );
}
