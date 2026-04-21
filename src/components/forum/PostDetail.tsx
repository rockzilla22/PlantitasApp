"use client";

import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { Post, Reply, POST_TYPE_LABELS } from "@/core/forum/domain/Forum";
import { $replies, $userVotes, $userReplyVotes, $posts, loadReplies, createReply, votePost, acceptReply, voteReply, loadUserReplyVotes } from "@/store/forumStore";
import Image from "next/image";

interface PostDetailProps {
  post: Post;
  currentUserId?: string;
  currentUserName?: string;
  onBack: () => void;
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

const TYPE_ICONS: Record<string, string> = {
  question: "ask.svg",
  tip: "idea.svg",
  experience: "chat.svg",
  discussion: "discussion.svg",
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

export function PostDetail({
  post: initialPost,
  currentUserId,
  currentUserName,
  onBack,
  isMaster,
  onModerate,
  onEdit,
  onDelete,
}: PostDetailProps) {
  const allReplies = useStore($replies);
  const userVotes = useStore($userVotes);
  const userReplyVotes = useStore($userReplyVotes);
  const posts = useStore($posts);

  // Buscamos la versión más fresca del post en el store global
  const post = (posts.find((p: Post) => p.id === initialPost.id) || initialPost) as Post;
  const replies: Reply[] = allReplies[post.id] ?? [];

  const [replyContent, setReplyContent] = useState("");
  const [quoted, setQuoted] = useState<Reply | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReplies(post.id);
    if (currentUserId) loadUserReplyVotes(currentUserId);
  }, [post.id, currentUserId]);

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
    if (ok) {
      setReplyContent("");
      setQuoted(null);
    } else setError("Error al responder.");
  };

  const score = post.upvotes - post.downvotes;
  const myVote = userVotes[post.id];
  const isAuthor = currentUserId === post.author_id;
  const accent = TYPE_ACCENT[post.type] ?? "var(--primary)";

  return (
    <div className="forum-detail flex flex-col gap-6">
      {/* Botón Volver - Estilo App */}
      <div className="flex items-center justify-start">
        <button
          className="btn-text !py-2 !px-4 bg-[var(--white)] rounded-xl border border-[var(--border-light)] shadow-sm hover:text-[var(--primary)] transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
          onClick={onBack}
        >
          <Image src="/icons/common/arrow_rigth.svg" alt="" width={14} height={14} className="rotate-180 brightness-0 opacity-60" />
          Volver al foro
        </button>
      </div>

      {/* Tarjeta Principal: Estilo inventory-card (como Season Card) */}
      <article
        className="inventory-card bg-[var(--card-bg)] p-8 rounded-[2.5rem] shadow-xl border border-[var(--border-light)] flex flex-col"
        style={{ borderTop: `6px solid ${accent}` }}
      >
        {/* HEADER del Post: Estilo Season Header */}
        <div className="flex justify-between items-center border-b border-[var(--primary)]/10 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-[var(--white)] rounded-xl border border-[var(--border-light)] shadow-sm">
              <Image src={`/icons/common/${TYPE_ICONS[post.type] || "chat.svg"}`} alt="" width={24} height={24} />
            </div>
            <div className="flex flex-col">
              <h3 className="m-0 text-xl text-[var(--primary)] font-bold">@{post.author_name}</h3>
              <span className="text-[0.65rem] font-black uppercase tracking-widest text-[var(--text-gray)] opacity-60">
                {POST_TYPE_LABELS[post.type]} • {timeAgo(post.created_at)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {isAuthor && (
              <>
                <button
                  className="p-2 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all flex items-center justify-center border border-[var(--primary)]/20"
                  onClick={onEdit}
                  title="Editar post"
                >
                  <Image
                    src="/icons/common/pencil.svg"
                    alt="Editar"
                    width={16}
                    height={16}
                    className="brightness-0 invert hover:brightness-100 hover:invert-0"
                  />
                </button>
                <button
                  className="p-2 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center border border-red-500/20"
                  onClick={onDelete}
                  title="Eliminar mi post"
                >
                  <Image src="/icons/common/trash.svg" alt="Eliminar" width={16} height={16} />
                </button>
              </>
            )}
            {isMaster && !isAuthor && (
              <button
                className="btn-primary !h-10 !px-4 !text-[0.65rem] !bg-red-500/10 !border-red-500/20 !text-red-600 hover:!bg-red-600 hover:!text-white uppercase tracking-widest font-black"
                onClick={onModerate}
              >
                Moderar
              </button>
            )}
          </div>
        </div>

        {/* CONTENIDO del Post */}
        <div className="flex flex-col gap-4">
          {post.title && <h2 className="text-2xl font-black text-[var(--text-brown)] leading-tight tracking-tight">{post.title}</h2>}

          <div className="rounded-[1.5rem] p-6 bg-[var(--white)] border border-[var(--border-light)] shadow-sm italic text-[var(--text-brown)] text-lg leading-relaxed break-words whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Votaciones: Estilo Footer de Notas */}
          <div className="flex items-center gap-4 pt-6 mt-4 border-t border-[var(--primary)]/10">
            <div className="flex items-center bg-[var(--black-soft)] p-1 rounded-xl gap-1">
              <button
                className={`p-2 rounded-lg transition-all ${myVote === 1 ? "bg-[var(--success)] text-white shadow-md" : "hover:bg-[var(--white)] text-[var(--text-gray)]"}`}
                disabled={!currentUserId}
                onClick={() => currentUserId && votePost(post.id, currentUserId, 1)}
              >
                <span className="font-black">▲</span>
              </button>
              <span
                className={`px-2 font-black text-sm ${score > 0 ? "text-[var(--success)]" : score < 0 ? "text-[var(--danger)]" : "text-[var(--text-brown)]"}`}
              >
                {score}
              </span>
              <button
                className={`p-2 rounded-lg transition-all ${myVote === -1 ? "bg-[var(--danger)] text-white shadow-md" : "hover:bg-[var(--white)] text-[var(--text-gray)]"}`}
                disabled={!currentUserId}
                onClick={() => currentUserId && votePost(post.id, currentUserId, -1)}
              >
                <span className="font-black">▼</span>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* SECCIÓN DE RESPUESTAS */}
      <section className="flex flex-col gap-4 mt-4">
        <h4 className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[var(--text-gray)] opacity-60 ml-4">
          Comentarios ({replies.length})
        </h4>

        <div className="flex flex-col gap-3">
          {replies.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-[var(--border-light)] rounded-[2.5rem] italic text-[var(--text-gray)] opacity-50">
              Aún no hay respuestas. ¡Sé el primero en comentar!
            </div>
          ) : (
            replies.map((r) => (
              <div
                key={r.id}
                className={`inventory-item hover:bg-[var(--primary)]/[0.04] bg-[var(--white)] border border-[var(--border-light)] transition-all p-6 rounded-[2rem] flex flex-col gap-3 shadow-sm ${r.is_accepted ? "ring-2 ring-[var(--success)]/30 !bg-[var(--success-bg)]/20" : ""}`}
              >
                {r.quoted_content && (
                  <blockquote className="bg-[var(--bg-faint)] border-l-4 border-[var(--primary)] p-3 rounded-r-xl italic text-xs text-[var(--text-gray)] opacity-80 mb-1">
                    ↩ "{r.quoted_content.slice(0, 100)}
                    {r.quoted_content.length > 100 ? "…" : ""}"
                  </blockquote>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center font-black text-[0.6rem] text-[var(--primary)] uppercase shrink-0">
                      {r.author_name.slice(0, 2)}
                    </div>
                    <span className="text-sm font-bold text-[var(--text-brown)]">@{r.author_name}</span>
                    <span className="text-[0.6rem] font-medium text-[var(--text-gray)] opacity-50">{timeAgo(r.created_at)}</span>
                    {r.is_accepted && (
                      <span className="badge badge-success !text-[0.55rem] !px-2 font-black tracking-tighter">Respuesta Útil</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {currentUserId && (
                      <button
                        className="btn-text !p-2 !min-h-0 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-all"
                        onClick={() => setQuoted(r)}
                        title="Citar respuesta"
                      >
                        <Image src="/icons/common/notes2.svg" alt="Citar" width={14} height={14} />
                      </button>
                    )}
                    {isAuthor && post.type === "question" && !r.is_accepted && (
                      <button
                        className="btn-primary !h-8 !px-3 !text-[0.6rem] uppercase tracking-widest font-black"
                        onClick={() => acceptReply(r.id, post.id)}
                      >
                        ✓ Útil
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[0.95rem] leading-relaxed text-[var(--text-brown)] break-words whitespace-pre-wrap">{r.content}</p>

                <div className="flex items-center gap-3 pt-3 border-t border-[var(--border-light)] mt-1">
                  <div className="flex items-center bg-[var(--black-soft)] p-0.5 rounded-lg gap-1">
                    <button
                      className={`p-1 px-2 rounded-md transition-all text-[0.65rem] ${userReplyVotes[r.id] === 1 ? "bg-[var(--success)] text-white shadow-sm" : "hover:bg-[var(--white)] text-[var(--text-gray)]"}`}
                      disabled={!currentUserId}
                      onClick={() => currentUserId && voteReply(r.id, post.id, currentUserId, 1)}
                    >
                      <span className="font-black">▲</span>
                    </button>
                    <span
                      className={`px-1 font-black text-[0.7rem] ${r.upvotes - r.downvotes > 0 ? "text-[var(--success)]" : r.upvotes - r.downvotes < 0 ? "text-[var(--danger)]" : "text-[var(--text-brown)]"}`}
                    >
                      {r.upvotes - r.downvotes}
                    </span>
                    <button
                      className={`p-1 px-2 rounded-md transition-all text-[0.65rem] ${userReplyVotes[r.id] === -1 ? "bg-[var(--danger)] text-white shadow-sm" : "hover:bg-[var(--white)] text-[var(--text-gray)]"}`}
                      disabled={!currentUserId}
                      onClick={() => currentUserId && voteReply(r.id, post.id, currentUserId, -1)}
                    >
                      <span className="font-black">▼</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* FORMULARIO DE RESPUESTA */}
      <div className="mt-4">
        {currentUserId ? (
          <form
            className="bg-[var(--white)] border border-[var(--border-light)] rounded-[2.5rem] p-8 shadow-lg flex flex-col gap-4"
            onSubmit={handleReply}
          >
            <h4 className="m-0 text-lg font-black text-[var(--primary)] flex items-center gap-2">
              <Image src="/icons/common/chat.svg" alt="" width={20} height={20} />
              Tu Respuesta
            </h4>

            {quoted && (
              <div className="flex justify-between items-center bg-[var(--bg-faint)] p-3 rounded-xl border border-[var(--primary)]/20 animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="text-xs text-[var(--text-gray)] font-bold">
                  ↩ Citando a <strong className="text-[var(--primary)]">@{quoted.author_name}</strong>
                </span>
                <button type="button" className="text-[var(--text-gray)] hover:text-[var(--danger)]" onClick={() => setQuoted(null)}>
                  ✕
                </button>
              </div>
            )}

            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Comparte tu sabiduría botánica..."
              rows={4}
              required
              maxLength={1000}
              className="w-full !p-5 bg-[var(--input-bg)] border-2 border-[var(--border-light)] rounded-[1.5rem] focus:border-[var(--primary)] transition-all outline-none text-sm text-[var(--text-brown)] italic shadow-inner"
            />

            {error && <p className="forum-error text-red-600 text-xs font-bold">{error}</p>}

            <div className="flex justify-end mt-2">
              <button
                type="submit"
                className="btn-primary !h-12 !px-8 !text-xs uppercase tracking-widest font-black"
                disabled={sending || !replyContent.trim()}
              >
                {sending ? "Enviando..." : "Publicar Comentario"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center bg-[var(--bg-faint)] border-2 border-dashed border-[var(--border-light)] rounded-[2.5rem] italic text-[var(--text-gray)]">
            Iniciá sesión para participar en esta conversación. 🌿
          </div>
        )}
      </div>
    </div>
  );
}
