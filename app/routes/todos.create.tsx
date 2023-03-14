import React from "react";
import useSupabase from "~/utils/supabase";
import { useNavigate } from "react-router";

export default function TodosCreateRoute() {
  const supabase = useSupabase();
  const navigate = useNavigate();

  const [text, setText] = React.useState("");
  return (
    <form
      style={{ display: "flex", flexDirection: "column", gap: "1em" }}
      onSubmit={async (e) => {
        e.preventDefault();
        const { error } = await supabase.from("todos").insert({ text });
        if (!error) {
          navigate("/todos", {});
          navigate(0);
        }
      }}
    >
      <h2>New Todo</h2>
      <label>Text</label>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <div>
        <button type="submit" style={{ float: "right" }}>
          Create
        </button>
      </div>
    </form>
  );
}
