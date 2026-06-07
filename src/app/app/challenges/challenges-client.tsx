"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ChallengeRow = {
  id: string;
  title: string;
  description: string | null;
  unit: string;
  targetValue: number;
  participants: { userId: string; progress: number; user: { name: string | null } }[];
};

export function ChallengesClient({
  challenges,
  userId,
  joinedChallengeIds,
}: {
  challenges: ChallengeRow[];
  userId: string;
  joinedChallengeIds: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(challenges[0]?.id ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [optimisticJoined, setOptimisticJoined] = useState<string[]>([]);
  const joinedSet = new Set([...joinedChallengeIds, ...optimisticJoined]);

  const board = challenges.find((c) => c.id === selected);

  async function join(id: string) {
    if (joinedSet.has(id)) return;
    setMsg(null);
    const res = await fetch(`/api/challenges/${id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const body = await res.json();
    if (!res.ok || !body.ok) setMsg(body.error?.message ?? "Could not join");
    else {
      setOptimisticJoined((prev) => (prev.includes(id) ? prev : [...prev, id]));
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4">
        {challenges.map((c) => {
          const joined = joinedSet.has(c.id);
          return (
            <div
              key={c.id}
              data-testid="challenge-card"
              data-challenge-id={c.id}
              className="rounded-card border border-paper-deep bg-paper-raised p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <h2 className="font-display text-xl uppercase text-violet">{c.title}</h2>
                {c.description && <p className="text-sm text-ink/60 mt-1">{c.description}</p>}
                <p className="text-xs text-ink/50 mt-2">
                  Target {c.targetValue.toLocaleString("en-IN")} {c.unit}
                </p>
              </div>
              <button
                type="button"
                onClick={() => join(c.id)}
                disabled={joined}
                aria-disabled={joined}
                className="rounded-full bg-magenta px-5 py-2 text-sm font-extrabold text-white shrink-0 disabled:cursor-not-allowed disabled:bg-ink/25 disabled:text-white/90"
              >
                {joined ? "Joined" : "Join"}
              </button>
            </div>
          );
        })}
      </div>

      {board && (
        <div className="rounded-card border border-paper-deep bg-paper-raised p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {challenges.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id)}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  selected === c.id ? "bg-violet text-white" : "bg-paper-deep text-ink/60"
                }`}
              >
                {c.title.slice(0, 18)}
              </button>
            ))}
          </div>
          <h3 className="font-display text-lg uppercase text-magenta mb-3">Leaderboard</h3>
          <ol className="space-y-2">
            {[...board.participants]
              .sort((a, b) => b.progress - a.progress)
              .slice(0, 20)
              .map((p, i) => (
                <li
                  key={p.userId}
                  className={`flex justify-between rounded-lg px-3 py-2 text-sm ${
                    p.userId === userId ? "bg-energy-soft/40 ring-2 ring-magenta/50" : "bg-paper"
                  }`}
                >
                  <span className="font-semibold text-ink">
                    {i + 1}. {p.user.name ?? "Strider"}
                    {p.userId === userId ? " · you" : ""}
                  </span>
                  <span className="text-violet font-bold">
                    {p.progress} {board.unit}
                  </span>
                </li>
              ))}
          </ol>
        </div>
      )}

      {msg && <p className="text-sm font-semibold text-magenta">{msg}</p>}
    </div>
  );
}
