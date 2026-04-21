"use client";

import { Post, POST_TYPE_LABELS } from "@/core/forum/domain/Forum";
import Image from "next/image";

interface PostCardProps {
  post: Post;
  onClick: () => void;
  currentUserId?: string;
  isMaster?: boolean;
  onModerate?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
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

const TYPE_ICONS: Record<string, string> = {
  question: "ask.svg",
  tip: "idea.svg",
  experience: "chat.svg",
  discussion: "discussion.svg",
};

export function PostCard({ post, onClick, currentUserId, isMaster, onModerate, onEdit, onDelete }: PostCardProps) {
  const score = post.upvotes - post.downvotes;
  const accent = TYPE_ACCENT[post.type] ?? "var(--primary)";
  const isAuthor = currentUserId === post.author_id;

  return (
    <article
      className="card !min-h-fit !h-auto flex flex-col p-5 bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border-light)] shadow-sm hover:shadow-md transition-all group overflow-hidden cursor-pointer"
      onClick={onClick}
      style={{ borderTop: `5px solid ${accent}` }}
    >
      {/* HEADER: Estilo Notes/Nursery */}
      <div className="grid grid-cols-[1fr_auto] gap-3 items-start mb-4">
        <div className="min-w-0">
          <h3 className="text-[var(--primary)] flex items-center gap-3 text-lg font-bold">
            <div className="w-8 h-8 flex items-center justify-center shrink-0 bg-[var(--bg-faint)] rounded-lg border border-[var(--border-light)]">
              <Image src={`/icons/common/${TYPE_ICONS[post.type] || "chat.svg"}`} alt="" width={20} height={20} />
            </div>
            <span className="truncate">@{post.author_name}</span>
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[0.65rem] font-black uppercase tracking-widest text-[var(--text-gray)] opacity-60">
              {POST_TYPE_LABELS[post.type]}
            </span>
            {post.pinned_at && (
              <span className="text-xs" title="Fijado">
                📌
              </span>
            )}
            {isAuthor && (
              <span className="text-[0.6rem] font-bold text-[var(--primary)] bg-[var(--bg-faint)] px-1.5 py-0.5 rounded border border-[var(--border-light)] uppercase">
                Tuyo
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="badge badge-info whitespace-nowrap">{timeAgo(post.created_at)}</span>
          <div className="flex gap-1">
            {isAuthor && onEdit && (
              <button
                className="p-2 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--primary)] hover:text-white flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                title="Editar post"
              >
                <Image src="/icons/common/pencil.svg" alt="Editar" width={14} height={14} className="brightness-0 invert group-hover:brightness-100 group-hover:invert-0" />
              </button>
            )}
            {(isMaster || isAuthor) && (onModerate || onDelete) && (
              <button
                className="p-2 rounded-xl bg-red-500/10 text-red-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  isAuthor ? onDelete?.() : onModerate?.();
                }}
                title={isAuthor ? "Eliminar mi post" : "Moderar (Eliminar post)"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BODY: Título y preview con diseño de quote */}
      <div className="flex-1 border-t border-[var(--border-light)] pt-4">
        {post.title && (
          <h4 className="text-[var(--text-brown)] font-black text-base mb-3 leading-tight line-clamp-2">
            {post.title}
          </h4>
        )}
        <div className="rounded-2xl p-4 border border-[var(--border-light)] italic text-[var(--text)] text-sm leading-relaxed break-words line-clamp-3">
          {post.content}
        </div>
      </div>

      {/* FOOTER: Stats y Tags */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--border-light)] text-[var(--text-muted)]">
        <div className="flex gap-4 font-bold text-[0.7rem] uppercase tracking-wider">
          <span className={`flex items-center gap-1 ${score > 0 ? "text-[var(--success)]" : score < 0 ? "text-[var(--danger)]" : ""}`}>
            {score > 0 ? "▲" : score < 0 ? "▼" : "•"} {Math.abs(score)} PTS
          </span>
          <span className="flex items-center gap-1 opacity-70">
            💬 {post.reply_count}
          </span>
        </div>
      </div>
    </article>
  );
}
