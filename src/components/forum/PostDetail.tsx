"use client";

import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { Post, Reply, POST_TYPE_EMOJI, POST_TYPE_LABELS } from "@/core/forum/domain/Forum";
import { $replies, $userVotes, loadReplies, createReply, votePost, acceptReply } from "@/store/forumStore";

interface PostDetailProps {
  post: Post;
  currentUserId?: string;
  currentUserName?: string;
  onBack: () => void;
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

export function PostDetail({ post, currentUserId, currentUserName, onBack }: PostDetailProps) {
  const allReplies = useStore($replies);
  const userVotes = useStore($userVotes);
  const replies: Reply[] = allReplies[post.id] ?? [];

  const [replyContent, setReplyContent] = useState("");
  const [quoted, setQuoted] = useState<Reply | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { loadReplies(post.id); }, [post.id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !currentUserId || !currentUserName) return;
    setSending(true);
    const ok = await createReply({
      post_id: post.id,
      author_id: currentUserId,
      author_name: currentUserName,
      content: replyContent.trim(),
      quoted_reply_id: quoted?.id ?? null,
      quoted_content: quoted?.content ?? null,
    });
    setSending(false);
    if (ok) { setReplyContent(""); setQuoted(null); }
    else setError("Error al responder.");
  };

  const score = post.upvotes - post.downvotes;
  const myVote = userVotes[post.id];
  const isAuthor = currentUserId === post.author_id;
  const accent = TYPE_ACCENT[post.type] ?? "var(--primary)";

  return (
    <div className="forum-detail">
      <button className="forum-back-btn" onClick={onBack}>← Volver al foro</button>

      <article className="forum-detail__post" style={{ "--type-accent": accent } as React.CSSProperties}>
        <div className="forum-post-card__meta">
          <span className="forum-post-card__type">{POST_TYPE_EMOJI[post.type]} {POST_TYPE_LABELS[post.type]}</span>
          <span className="forum-post-card__author">@{post.author_name}</span>
          <span className="forum-post-card__time">{timeAgo(post.created_at)}</span>
        </div>

        {post.title && <h2 className="forum-detail__title">{post.title}</h2>}
        <p className="forum-detail__content">{post.content}</p>

        {post.tags.length > 0 && (
          <div className="forum-post-card__tags">
            {post.tags.map((t) => <span key={t} className="forum-tag">#{t}</span>)}
          </div>
        )}

        <div className="forum-vote-row">
          <button
            className={`forum-vote-btn ${myVote === 1 ? "active-up" : ""}`}
            disabled={!currentUserId}
            onClick={() => currentUserId && votePost(post.id, currentUserId, 1)}
          >⬆</button>
          <span className={`forum-score ${score > 0 ? "positive" : score < 0 ? "negative" : ""}`}>{score}</span>
          <button
            className={`forum-vote-btn ${myVote === -1 ? "active-down" : ""}`}
            disabled={!currentUserId}
            onClick={() => currentUserId && votePost(post.id, currentUserId, -1)}
          >⬇</button>
          <span className="forum-replies">💬 {post.reply_count} {post.reply_count === 1 ? "respuesta" : "respuestas"}</span>
        </div>
      </article>

      <section className="forum-replies-section">
        <h4 className="forum-replies-section__title">{replies.length} {replies.length === 1 ? "respuesta" : "respuestas"}</h4>

        {replies.map((r) => (
          <div key={r.id} className={`forum-reply ${r.is_accepted ? "accepted" : ""}`}>
            {r.quoted_content && (
              <blockquote className="forum-quote">↩ "{r.quoted_content.slice(0, 100)}{r.quoted_content.length > 100 ? "…" : ""}"</blockquote>
            )}
            <div className="forum-reply__meta">
              <span className="forum-post-card__author">@{r.author_name}</span>
              <span className="forum-post-card__time">{timeAgo(r.created_at)}</span>
              {r.is_accepted && <span className="forum-accepted-badge">✓ Aceptada</span>}
            </div>
            <p className="forum-reply__content">{r.content}</p>
            <div className="forum-reply__actions">
              <span className="forum-score">{r.upvotes - r.downvotes} pts</span>
              {currentUserId && (
                <button className="forum-cite-btn" onClick={() => setQuoted(r)}>↩ Citar</button>
              )}
              {isAuthor && post.type === "question" && !r.is_accepted && (
                <button className="forum-accept-btn" onClick={() => acceptReply(r.id, post.id)}>✓ Marcar aceptada</button>
              )}
            </div>
          </div>
        ))}
      </section>

      {currentUserId ? (
        <form className="forum-reply-form" onSubmit={handleReply}>
          {quoted && (
            <div className="forum-quoted-preview">
              <span>↩ Citando a <strong>@{quoted.author_name}</strong></span>
              <button type="button" onClick={() => setQuoted(null)}>✕</button>
            </div>
          )}
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Escribí tu respuesta..."
            rows={3}
            required
            maxLength={1000}
          />
          {error && <p className="forum-error">{error}</p>}
          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={sending || !replyContent.trim()}>
              {sending ? "Enviando…" : "Responder"}
            </button>
          </div>
        </form>
      ) : (
        <p className="forum-login-prompt">Iniciá sesión para responder.</p>
      )}
    </div>
  );
}
