"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CommentRow = {
  id: string;
  body: string;
  createdAt: string;
  author: { name: string | null };
};

type Post = {
  id: string;
  body: string;
  createdAt: string;
  author: { name: string | null };
  _count: { likes: number; comments: number };
  likes: { id: string }[];
  comments: CommentRow[];
};

export function CommunityComposer() {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Write something before posting.");
      return;
    }
    setError(null);
    setLoading(true);
    const res = await fetch("/api/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: trimmed }),
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: { message?: string } } | null;
    setLoading(false);
    if (res.ok && json?.ok) {
      setBody("");
      router.refresh();
      return;
    }
    setError(json?.error?.message ?? "Could not post. Try again.");
  }

  return (
    <form onSubmit={submit} className="rounded-card border border-paper-deep bg-white p-4 mb-6">
      <label className="text-sm font-semibold text-ink">Share a win or ask the circle</label>
      <textarea
        className="mt-2 w-full border border-paper-deep rounded-card px-3 py-2 min-h-[88px]"
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          if (error) setError(null);
        }}
        maxLength={5000}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "composer-error" : undefined}
      />
      {error ? (
        <p id="composer-error" className="mt-2 text-sm font-semibold text-magenta" role="alert">
          {error}
        </p>
      ) : null}
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
  const [liked, setLiked] = useState(post.likes.length > 0);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState(post.comments);

  const [commentCount, setCommentCount] = useState(post._count.comments);

  useEffect(() => {
    setLiked(post.likes.length > 0);
    setLikeCount(post._count.likes);
    setLocalComments(post.comments);
    setCommentCount(post._count.comments);
  }, [post.id, post.likes.length, post._count.likes, post._count.comments, post.comments]);

  async function toggleLike() {
    const res = await fetch(`/api/community/posts/${post.id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: { liked?: boolean } } | null;
    if (!res.ok || !json?.ok || json.data?.liked === undefined) return;
    const nextLiked = json.data.liked;
    setLiked(nextLiked);
    setLikeCount((c) => (nextLiked ? c + 1 : Math.max(0, c - 1)));
    router.refresh();
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = commentBody.trim();
    if (!trimmed) {
      setCommentError("Write a comment before sending.");
      return;
    }
    setCommentError(null);
    setCommentLoading(true);
    const res = await fetch(`/api/community/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: trimmed }),
    });
    const json = (await res.json().catch(() => null)) as {
      ok?: boolean;
      data?: { id: string; body: string; createdAt: string; author: { name: string | null } };
      error?: { message?: string };
    } | null;
    setCommentLoading(false);
    if (res.ok && json?.ok && json.data) {
      setCommentBody("");
      setLocalComments((prev) => [...prev, json.data!]);
      setCommentCount((n) => n + 1);
      router.refresh();
      return;
    }
    setCommentError(json?.error?.message ?? "Could not add comment.");
  }

  return (
    <article className="rounded-card border border-paper-deep bg-white p-4 overflow-hidden">
      <header className="flex justify-between text-xs text-ink/50 gap-2">
        <span className="font-bold text-violet shrink-0">{post.author.name ?? "Sister"}</span>
        <time className="shrink-0" dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleString("en-IN")}
        </time>
      </header>
      <p className="mt-2 text-sm text-ink whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
        {post.body}
      </p>
      <footer className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold">
        <button
          type="button"
          onClick={() => void toggleLike()}
          aria-pressed={liked}
          className={liked ? "text-magenta" : "text-ink/60"}
        >
          ♥ {likeCount}
        </button>
        <button
          type="button"
          onClick={() => {
            setCommentsOpen((o) => !o);
            setCommentError(null);
          }}
          className="text-ink/60 hover:text-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet rounded"
          aria-expanded={commentsOpen}
        >
          💬 {commentCount}
        </button>
      </footer>

      {commentsOpen && (
        <div className="mt-4 border-t border-paper-deep pt-4 space-y-3">
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {localComments.map((c) => (
              <li key={c.id} className="rounded-lg bg-paper px-3 py-2 text-sm">
                <span className="font-bold text-violet text-xs">{c.author.name ?? "Sister"}</span>
                <p className="text-ink/90 mt-0.5 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{c.body}</p>
              </li>
            ))}
          </ul>
          <form onSubmit={submitComment} className="space-y-2">
            <label className="sr-only" htmlFor={`comment-${post.id}`}>
              Add a comment
            </label>
            <textarea
              id={`comment-${post.id}`}
              className="w-full border border-paper-deep rounded-card px-3 py-2 text-sm min-h-[72px]"
              placeholder="Add a supportive comment…"
              value={commentBody}
              onChange={(e) => {
                setCommentBody(e.target.value);
                if (commentError) setCommentError(null);
              }}
              maxLength={2000}
              disabled={commentLoading}
            />
            {commentError ? (
              <p className="text-sm font-semibold text-magenta" role="alert">
                {commentError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={commentLoading}
              className="rounded-full bg-violet px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
            >
              {commentLoading ? "Sending…" : "Send comment"}
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
