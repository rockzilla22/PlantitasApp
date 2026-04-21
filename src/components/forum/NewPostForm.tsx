"use client";

import { useState } from "react";
import { PostType, POST_TYPE_LABELS, POST_TYPE_EMOJI, FORUM_TAGS } from "@/core/forum/domain/Forum";
import { createPost } from "@/store/forumStore";

interface NewPostFormProps {
  authorId: string;
  authorName: string;
  onClose: () => void;
}

const TYPE_OPTIONS = Object.keys(POST_TYPE_LABELS) as PostType[];

export function NewPostForm({ authorId, authorName, onClose }: NewPostFormProps) {
  const [type, setType] = useState<PostType>("question");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleTag = (tag: string) =>
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { setError("El contenido es obligatorio."); return; }
    setLoading(true);
    const ok = await createPost({ author_id: authorId, author_name: authorName, title: title.trim(), content: content.trim(), type, tags });
    setLoading(false);
    if (ok) onClose();
    else setError("Error al publicar. Intentá de nuevo.");
  };

  return (
    <form className="new-post-form" onSubmit={handleSubmit}>
      <div className="new-post-form__header">
        <h3>Nuevo post</h3>
        <button type="button" className="new-post-form__close" onClick={onClose}>✕</button>
      </div>

      <div className="flex bg-[var(--black-soft)] p-1 rounded-2xl gap-1 flex-wrap mb-4">
        {TYPE_OPTIONS.map((t) => (
          <button
            key={t}
            type="button"
            className={`px-3 py-2 text-[0.7rem] font-black uppercase tracking-widest rounded-xl transition-all flex-1 ${
              type === t
                ? "bg-[var(--white)] text-[var(--primary)] shadow-md ring-1 ring-[var(--border)]"
                : "text-[var(--text-brown)] opacity-70 hover:opacity-100 hover:bg-[var(--white)]/50"
            }`}
            onClick={() => setType(t)}
          >
            <span className="mr-1 text-base">{POST_TYPE_EMOJI[t]}</span> {POST_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="form-group">
        <label>Título {type === "tip" ? <span className="new-post-form__optional">(opcional)</span> : <span className="new-post-form__required">*</span>}</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={type === "question" ? "¿Cuál es tu pregunta?" : "Título corto"}
          required={type !== "tip"}
          maxLength={120}
        />
      </div>

      <div className="form-group">
        <label>Contenido <span className="new-post-form__required">*</span></label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Contá con detalle..."
          rows={5}
          required
          maxLength={2000}
        />
        <small className="new-post-form__counter">{content.length}/2000</small>
      </div>

      <div className="form-group">
        <label>Tags</label>
        <div className="forum-tags-picker">
          {FORUM_TAGS.map((t) => (
            <button
              key={t}
              type="button"
              className={`forum-tag-pick ${tags.includes(t) ? "selected" : ""}`}
              onClick={() => toggleTag(t)}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="forum-error">{error}</p>}

      <div className="modal-actions">
        <button type="button" className="btn-text" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Publicando…" : "Publicar"}
        </button>
      </div>
    </form>
  );
}
