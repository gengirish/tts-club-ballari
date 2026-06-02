import { getSessionUser } from "@/lib/rbac";
import { redirect } from "next/navigation";

// Protected by middleware; this is the member home shell.
// Build the full dashboard UI from the design board (Prompt 6 in README).
export default async function AppHome() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen p-6">
      <h1 className="font-display text-3xl uppercase text-violet">Namaste 👋</h1>
      <p className="text-ink/60 mt-1">
        Signed in as <b>{user.name ?? "member"}</b> · role <b>{user.role}</b>
      </p>
      <p className="mt-6 text-sm text-ink/50">
        Dashboard widgets (steps ring, fitness score, challenges, events) get built here.
      </p>
    </main>
  );
}
