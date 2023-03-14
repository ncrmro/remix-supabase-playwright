import { Link } from "@remix-run/react";
import useViewer from "~/utils/useViewer";

export default function Index() {
  const viewer = useViewer();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Remix Supabase Playwright</h1>
      {viewer && <p>Welcome back {viewer.email}</p>}
      <ul>
        {!viewer && (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/signup">Signup</Link>
            </li>
          </>
        )}
        {viewer && (
          <li>
            <Link to="/todos">Todos</Link>
          </li>
        )}
      </ul>
    </div>
  );
}
