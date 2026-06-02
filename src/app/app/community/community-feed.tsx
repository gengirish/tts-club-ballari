"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Post = {
  id: string;
  body: string;
  createdAt: string;
  author: { name: string | null };
  _count: { likes: number; comments: number };
  likes: { id: string }[];
};

export function CommunityComposer() {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setLoading(false);
    if (res.ok) {
      setBody("");
      router.refresh();
    }
  }

  return (
    <form onSubmit={submit} className="rounded-card border border-paper-deep bg-white p-4 mb-6">
      <label className="text-sm font-semibold text-ink">Share a win or ask the circle</label>
      <textarea
        className="mt-2 w-full border border-paper-deep rounded-card px-3 py-2 min-h-[88px]"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={5000}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="mt-3 rounded-full bg-energy px-5 py-2 text-sm font-extrabold text-white disabled:opacity-60"
      >
        {loading ? "Posting…" : "Post"}
      </button>
    </form>
  );
}

export function CommunityPostCard({ post }: { post: Post }) {
  const router = useRouter();
  const liked = post.likes.length > 0;

  async function like() {
    await fetch(`/api/community/posts/${post.id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    router.refresh();
  }

  return (
    <article className="rounded-card border border-paper-deep bg-white p-4">
      <header className="flex justify-between text-xs text-ink/50">
        <span className="font-bold text-violet">{post.author.name ?? "Sister"}</span>
        <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString("en-IN")}</time>
      </header>
      <p className="mt-2 text-sm text-ink whitespace-pre-wrap">{post.body}</p>
      <footer className="mt-3 flex gap-3 text-xs font-semibold">
        <button
          type="button"
          onClick={like}
          className={liked ? "text-magenta" : "text-ink/60"}
        >
          ♥ {post._count.likes}
        </button>
        <span className="text-ink/50">💬 {post._count.comments}</span>
      </footer>
    </article>
  );
}
