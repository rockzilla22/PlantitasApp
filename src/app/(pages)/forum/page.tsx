"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { $posts, $forumLoading, $userVotes, loadPosts, loadUserVotes, deletePost } from "@/store/forumStore";
import { $user } from "@/store/authStore";
import { Post, PostType, POST_TYPE_LABELS } from "@/core/forum/domain/Forum";
import { PostCard } from "@/components/forum/PostCard";
import { PostDetail } from "@/components/forum/PostDetail";
import { NewPostForm } from "@/components/forum/NewPostForm";
import Image from "next/image";
import { openModal } from "@/store/modalStore";
import { getPlanLevel } from "@/libs/syncService";

type Tab = "all" | PostType;
type SortMode = "recent" | "top" | "unanswered";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "all", label: "Todas", icon: "world_chat.svg" },
  { id: "question", label: POST_TYPE_LABELS.question, icon: "ask.svg" },
  { id: "tip", label: POST_TYPE_LABELS.tip, icon: "idea.svg" },
  { id: "experience", label: POST_TYPE_LABELS.experience, icon: "chat.svg" },
  { id: "discussion", label: POST_TYPE_LABELS.discussion, icon: "discussion.svg" },
];

const SORT_LABELS: Record<SortMode, string> = {
  recent: "Recientes",
  top: "Top",
  unanswered: "Sin responder",
};

export default function ForumPage() {
  const posts = useStore($posts);
  const loading = useStore($forumLoading);
  const user = useStore($user);
  const composeDialogRef = useRef<HTMLDialogElement>(null);

  const [tab, setTab] = useState<Tab>("all");
  const [sort, setSort] = useState<SortMode>("recent");
  const [search, setSearch] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);

  useEffect(() => {
    loadPosts();
    if (user?.id) loadUserVotes(user.id);
  }, [user?.id]);

  useEffect(() => {
    const dialog = composeDialogRef.current;
    if (!dialog) {
      return;
    }

    if ((showNewPost || postToEdit) && user) {
      if (!dialog.open) {
        dialog.showModal();
      }
      return;
    }

    if (dialog.open) {
      dialog.close();
    }
  }, [showNewPost, postToEdit, user]);

  useEffect(() => {
    const dialog = composeDialogRef.current;
    if (!dialog) {
      return;
    }

    const handleDialogClose = () => {
      setShowNewPost(false);
      setPostToEdit(null);
    };
    dialog.addEventListener("close", handleDialogClose);

    return () => dialog.removeEventListener("close", handleDialogClose);
  }, []);

  const authorName = user?.user_metadata?.custom_name ?? user?.user_metadata?.full_name ?? user?.email ?? "Anónimo";
  const planLevel = getPlanLevel(user);
  const isMaster = planLevel.toUpperCase() === "MASTER";

  const handleModerate = (postId: string, isAuthor: boolean = false) => {
    openModal("confirm", {
      title: isAuthor ? "¿Eliminar tu post?" : "Moderar Post",
      message: isAuthor
        ? "Esta acción borrará tu publicación de forma permanente."
        : "¿Deseas eliminar este post por incumplimiento de las normas de la comunidad?",
      confirmText: "Eliminar Post",
      onConfirm: async () => {
        const ok = await deletePost(postId);
        if (ok && selectedPost?.id === postId) setSelectedPost(null);
      },
    });
  };

  const handleEdit = (post: Post) => {
    setPostToEdit(post);
  };

  const filtered = useMemo(() => {
    let result = [...posts];
    if (tab !== "all") result = result.filter((p) => p.type === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.title?.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.author_name.toLowerCase().includes(q),
      );
    }
    if (sort === "top") result.sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes));
    else if (sort === "unanswered") result = result.filter((p) => p.reply_count === 0);
    return result;
  }, [posts, tab, search, sort]);

  if (selectedPost) {
    return (
      <div className="forum-page">
        <PostDetail
          post={selectedPost}
          currentUserId={user?.id}
          currentUserName={authorName}
          onBack={() => setSelectedPost(null)}
          isMaster={isMaster}
          onModerate={() => handleModerate(selectedPost.id)}
          onEdit={() => handleEdit(selectedPost)}
          onDelete={() => handleModerate(selectedPost.id, true)}
        />
        <style jsx>{`
          ${forumStyles}
        `}</style>
      </div>
    );
  }

  return (
    <div className="forum-page">
      {/* Header — unificado con el estándar de la app */}
      <div className="view-header">
        <div className="flex flex-col">
          <h2 className="text-[var(--primary)] font-bold m-0">Foro</h2>
          <p className="text-xs text-[var(--text-gray)] font-medium uppercase tracking-wider opacity-70">La comunidad de plant lovers 🌱</p>
        </div>
        {user ? (
          <button className="btn-primary h-10 px-6 text-xs uppercase tracking-widest" onClick={() => setShowNewPost((v) => !v)}>
            {showNewPost || postToEdit ? "Cancelar" : "Nuevo post"}
          </button>
        ) : (
          <span className="forum-guest-hint">Iniciá sesión para participar</span>
        )}
      </div>

      {user && (
        <dialog
          ref={composeDialogRef}
          className="forum-compose-modal"
          onCancel={() => {
            setShowNewPost(false);
            setPostToEdit(null);
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowNewPost(false);
              setPostToEdit(null);
            }
          }}
        >
          <div className="forum-compose-shell">
            <div className="forum-compose-orb forum-compose-orb--primary" aria-hidden="true" />
            <div className="forum-compose-orb forum-compose-orb--secondary" aria-hidden="true" />
            <div className="forum-compose-panel">
              <NewPostForm
                authorId={user.id}
                authorName={authorName}
                postToEdit={postToEdit}
                onClose={() => {
                  setShowNewPost(false);
                  setPostToEdit(null);
                  loadPosts();
                }}
              />
            </div>
          </div>
        </dialog>
      )}

      {/* Tabs — nursery pill style unificado */}
      <div className="flex bg-[var(--black-soft)] p-1 rounded-2xl gap-1 flex-wrap mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`px-4 py-2 text-[0.7rem] font-black uppercase tracking-widest rounded-xl transition-all flex flex-1 items-center justify-center gap-2 whitespace-nowrap min-w-[100px] ${
              tab === t.id
                ? "bg-[var(--white)] text-[var(--primary)] shadow-md ring-1 ring-[var(--border)]"
                : "text-[var(--text-brown)] opacity-70 hover:opacity-100 hover:bg-[var(--white)]/50"
            }`}
            onClick={() => setTab(t.id)}
          >
            <Image src={`/icons/common/${t.icon}`} alt={t.label} width={18} height={18} /> {t.label}
          </button>
        ))}
      </div>

      {/* Toolbar — Search + Sort */}
      <div className="forum-toolbar mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="search-input-wrapper">
          <input
            type="text"
            id="global-search"
            placeholder="Buscar..."
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            className="bg-[var(--input-bg)] text-[var(--text)] border-[var(--border)] rounded-full"
          />
          <span className="search-icon">
            <Image src="/icons/common/search.svg" alt="Buscar" width={16} height={16} />
          </span>
        </div>

        <div className="flex bg-[var(--black-soft)] p-1 rounded-xl gap-1 shrink-0">
          {(Object.keys(SORT_LABELS) as SortMode[]).map((k) => (
            <button
              key={k}
              className={`px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-tighter rounded-lg transition-all whitespace-nowrap ${
                sort === k ? "bg-[var(--white)] text-[var(--primary)] shadow-sm" : "text-[var(--text-gray)] hover:text-[var(--primary)]"
              }`}
              onClick={() => setSort(k)}
            >
              {SORT_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="forum-state">
          <span className="forum-state__icon animate-bounce">🌿</span>
          <p className="font-bold">Cultivando publicaciones...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="forum-state forum-state--empty">
          <p className="italic">{search ? "No hay brotes que coincidan con tu búsqueda." : "Todavía no hay semillas plantadas aquí."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6 w-full px-1">
          {filtered.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              onClick={() => setSelectedPost(p)}
              currentUserId={user?.id}
              isMaster={isMaster}
              onModerate={() => handleModerate(p.id)}
              onEdit={() => handleEdit(p)}
              onDelete={() => handleModerate(p.id, true)}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        ${forumStyles}
      `}</style>
    </div>
  );
}

const forumStyles = `
  .forum-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 0.5rem 1rem 4rem;
  }

  /* Hero unificado */
  .view-header {
    background: transparent !important;
    border: none !important;
    padding: 1.5rem 0 2rem !important;
  }

  .forum-guest-hint {
    font-size: 0.75rem;
    color: var(--text-gray);
    font-style: italic;
    background: var(--bg-faint);
    padding: 0.5rem 1rem;
    border-radius: 1rem;
  }

  .forum-compose-modal {
    width: min(92vw, 52rem);
    max-height: calc(100dvh - 3rem);
    margin: auto;
    padding: 0;
    border: none;
    background: transparent;
    overflow: visible;
  }

  .forum-compose-modal::backdrop {
    background:
      radial-gradient(circle at top, color-mix(in srgb, var(--primary) 18%, transparent), transparent 44%),
      rgba(18, 27, 22, 0.42);
    backdrop-filter: blur(10px);
  }

  .forum-compose-shell {
    position: relative;
    padding: 1rem;
  }

  .forum-compose-panel {
    position: relative;
    z-index: 1;
    overflow: auto;
    max-height: calc(100dvh - 5rem);
    border: 1px solid color-mix(in srgb, var(--border) 80%, white 20%);
    border-radius: 2.5rem;
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--white) 92%, var(--primary-light) 8%), var(--card-bg));
    box-shadow:
      0 1.25rem 3.5rem rgba(0, 0, 0, 0.14),
      inset 0 1px 0 rgba(255, 255, 255, 0.75);
  }

  .forum-compose-orb {
    position: absolute;
    border-radius: 999px;
    filter: blur(2px);
    opacity: 0.55;
    pointer-events: none;
  }

  .forum-compose-orb--primary {
    top: -0.5rem;
    right: 2rem;
    width: 8rem;
    height: 8rem;
    background: color-mix(in srgb, var(--primary) 20%, white 80%);
  }

  .forum-compose-orb--secondary {
    bottom: 0.5rem;
    left: 1rem;
    width: 5.5rem;
    height: 5.5rem;
    background: color-mix(in srgb, var(--secondary) 24%, white 76%);
  }

  /* Search + sort toolbar */
  .forum-toolbar {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .forum-search-wrap {
    flex: 1;
    min-width: 200px;
    position: relative;
    display: flex;
    align-items: center;
  }

  .forum-search-icon {
    position: absolute;
    right: 1rem;
    opacity: 0.5;
    pointer-events: none;
    display: flex;
    align-items: center;
  }

  .forum-search-input {
    width: 100%;
    padding: 0.75rem 2.75rem 0.75rem 1.25rem;
    border: 2px solid var(--border);
    border-radius: 2rem;
    background: var(--input-bg);
    font-size: 0.9rem;
    color: var(--text);
    transition: all 0.2s;
    outline: none;
  }

  .forum-search-input:focus { 
    border-color: var(--primary);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 10%, transparent);
  }

  :global(.new-post-form) {
    padding: clamp(1.35rem, 2vw, 2rem);
  }

  :global(.new-post-form__header) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  :global(.new-post-form__header h3) {
    margin: 0;
    color: var(--primary);
    font-size: clamp(1.3rem, 2.4vw, 1.75rem);
    font-weight: 900;
    letter-spacing: -0.02em;
  }

  :global(.new-post-form__close) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: color-mix(in srgb, var(--white) 80%, transparent);
    color: var(--text-brown);
    font-size: 1rem;
    font-weight: 900;
    transition:
      transform 0.2s ease,
      background 0.2s ease,
      color 0.2s ease;
  }

  :global(.new-post-form__close:hover) {
    transform: translateY(-1px);
    background: var(--white);
    color: var(--primary);
  }

  :global(.new-post-form__optional),
  :global(.new-post-form__required) {
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  :global(.new-post-form__optional) {
    color: var(--text-gray);
  }

  :global(.new-post-form__required) {
    color: var(--primary);
  }

  :global(.new-post-form textarea) {
    min-height: 9rem;
    resize: vertical;
  }

  :global(.new-post-form__counter) {
    display: inline-block;
    margin-top: 0.5rem;
    color: var(--text-gray);
    font-size: 0.72rem;
    font-weight: 700;
  }

  :global(.forum-tags-picker) {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
  }

  :global(.forum-tag-pick) {
    border-radius: 999px;
    border: 1px solid var(--border);
    padding: 0.45rem 0.85rem;
    background: color-mix(in srgb, var(--white) 86%, var(--bg-faint) 14%);
    color: var(--text-brown);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.03em;
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      background 0.2s ease,
      color 0.2s ease;
  }

  :global(.forum-tag-pick:hover) {
    transform: translateY(-1px);
    border-color: var(--primary);
    color: var(--primary);
  }

  :global(.forum-tag-pick.selected) {
    border-color: var(--primary);
    background: color-mix(in srgb, var(--primary) 14%, white 86%);
    color: var(--primary);
    box-shadow: 0 0.5rem 1rem color-mix(in srgb, var(--primary) 14%, transparent);
  }

  :global(.forum-error) {
    margin: 1rem 0 0;
    border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
    border-radius: 1rem;
    background: color-mix(in srgb, var(--danger) 10%, white 90%);
    padding: 0.85rem 1rem;
    color: var(--danger);
    font-size: 0.82rem;
    font-weight: 700;
  }

  @media (max-width: 640px) {
    .forum-compose-modal {
      width: min(96vw, 52rem);
      max-height: calc(100dvh - 1.5rem);
    }

    .forum-compose-shell {
      padding: 0.35rem;
    }

    .forum-compose-panel {
      max-height: calc(100dvh - 2rem);
      border-radius: 1.75rem;
    }
  }

  /* Feed */
  .forum-feed {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  /* Empty / loading state */
  .forum-state {
    text-align: center;
    padding: 5rem 2rem;
    color: var(--text-gray);
    border: 2px dashed var(--border);
    border-radius: 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    background: var(--card-bg);
  }

  .forum-state__icon { font-size: 3.5rem; }
  .forum-state p { font-size: 1rem; margin: 0; }

  /* PostDetail Styles */
  :global(.forum-detail__post) {
    background: var(--white);
    border: 1px solid var(--border);
    border-top: 6px solid var(--type-accent, var(--primary));
    border-radius: 2.5rem;
    padding: 2.5rem;
    box-shadow: 0 10px 40px rgba(0,0,0,0.06);
    margin-top: 1rem;
  }

  :global(.forum-detail__title) {
    font-size: 1.75rem;
    font-weight: 900;
    color: var(--text-brown);
    margin: 0.75rem 0 1.25rem;
    line-height: 1.15;
  }

  :global(.forum-detail__content) {
    font-size: 1.05rem;
    line-height: 1.8;
    color: var(--text-brown);
    white-space: pre-wrap;
    margin-bottom: 2rem;
  }

  :global(.forum-vote-row) {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-light);
  }

  :global(.forum-vote-btn) {
    background: var(--bg-faint);
    border: 2px solid var(--border);
    border-radius: 1rem;
    padding: 0.5rem 1rem;
    font-weight: 900;
    transition: all 0.2s;
  }

  :global(.forum-vote-btn.active-up) { background: var(--success-bg); border-color: var(--success); color: var(--success); }
  :global(.forum-vote-btn.active-down) { background: var(--danger-bg); border-color: var(--danger); color: var(--danger); }

  /* Replies Styles */
  :global(.forum-reply) {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-left: 5px solid var(--border);
    border-radius: 2rem;
    padding: 1.5rem 2rem;
    margin-bottom: 1rem;
  }

  :global(.forum-reply.accepted) {
    border-left-color: var(--success);
    background: var(--success-bg);
    border-color: color-mix(in srgb, var(--success) 20%, transparent);
  }

  :global(.forum-back-btn) {
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.75rem;
    color: var(--primary);
    background: var(--bg-faint);
    padding: 0.6rem 1.25rem;
    border-radius: 2rem;
    border: 1px solid var(--border);
  }

  :global(.forum-reply-form) {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 2.5rem;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  }
`;
