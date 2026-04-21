"use client";

import { Post, POST_TYPE_EMOJI, POST_TYPE_LABELS } from "@/core/forum/domain/Forum";

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

const TYPE_ACCENT: Record<string, string> = {
  question: "var(--primary)",
  tip: "#f59e0b",
  experience: "#6366f1",
  discussion: "#ec4899",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

export function PostCard({ post, onClick }: PostCardProps) {
  const score = post.upvotes - post.downvotes;
  const accent = TYPE_ACCENT[post.type] ?? "var(--primary)";

  return (
    <article
      className="forum-post-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{ "--type-accent": accent } as React.CSSProperties}
    >
      <div className="forum-post-card__meta">
        <span className="forum-post-card__type">
          {POST_TYPE_EMOJI[post.type]} {POST_TYPE_LABELS[post.type]}
        </span>
        {post.pinned_at && <span className="forum-post-card__pin">📌</span>}
        <span className="forum-post-card__author">@{post.author_name}</span>
        <span className="forum-post-card__time">{timeAgo(post.created_at)}</span>
      </div>

      {post.title && <h3 className="forum-post-card__title">{post.title}</h3>}
      <p className="forum-post-card__preview">
        {post.content.length > 120 ? post.content.slice(0, 120) + "…" : post.content}
      </p>

      {post.tags.length > 0 && (
        <div className="forum-post-card__tags">
          {post.tags.map((t) => (
            <span key={t} className="forum-tag">#{t}</span>
          ))}
        </div>
      )}

      <div className="forum-post-card__stats">
        <span className={`forum-score ${score > 0 ? "positive" : score < 0 ? "negative" : ""}`}>
          ⬆ {score}
        </span>
        <span className="forum-replies">💬 {post.reply_count}</span>
      </div>
    </article>
  );
}
