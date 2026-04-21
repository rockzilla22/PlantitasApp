"use client";

import { useState, useEffect } from "react";
import { PostType, POST_TYPE_LABELS, FORUM_TAGS, Post } from "@/core/forum/domain/Forum";
import { createPost, updatePost } from "@/store/forumStore";
import Image from "next/image";

interface NewPostFormProps {
  authorId: string;
  authorName: string;
  onClose: () => void;
  postToEdit?: Post | null;
}

const TYPE_OPTIONS = Object.keys(POST_TYPE_LABELS) as PostType[];

const TYPE_ICONS: Record<PostType, string> = {
  question: "ask.svg",
  tip: "idea.svg",
  experience: "chat.svg",
  discussion: "discussion.svg",
};

export function NewPostForm({ authorId, authorName, onClose, postToEdit }: NewPostFormProps) {
  const [type, setType] = useState<PostType>("question");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (postToEdit) {
      setType(postToEdit.type);
      setTitle(postToEdit.title || "");
      setContent(postToEdit.content);
    } else {
      setType("question");
      setTitle("");
      setContent("");
    }
  }, [postToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("El contenido es obligatorio.");
      return;
    }
    setLoading(true);
    let ok = false;
    if (postToEdit) {
      ok = await updatePost(postToEdit.id, { title: title.trim(), content: content.trim(), type });
    } else {
      ok = await createPost({
        author_id: authorId,
        author_name: authorName,
        title: title.trim(),
        content: content.trim(),
        type,
      });
    }
    setLoading(false);
    if (ok) onClose();
    else setError("Error al guardar. Intentá de nuevo.");
  };

  return (
    <form className="new-post-form" onSubmit={handleSubmit}>
      <div className="new-post-form__header">
        <h3>{postToEdit ? "Editar post" : "Nuevo post"}</h3>
      </div>

      <div className="flex bg-[var(--black-soft)] p-1 rounded-2xl gap-1 flex-wrap mb-4">
        {TYPE_OPTIONS.map((t) => (
          <button
            key={t}
            type="button"
            className={`px-3 py-2 text-[0.7rem] font-black uppercase tracking-widest rounded-xl transition-all flex-1 items-center justify-center gap-2 whitespace-nowrap ${
              type === t
                ? "bg-[var(--white)] text-[var(--primary)] shadow-md ring-1 ring-[var(--border)]"
                : "text-[var(--text-brown)] opacity-70 hover:opacity-100 hover:bg-[var(--white)]/50"
            }`}
            onClick={() => setType(t)}
          >
            <Image src={`/icons/common/${TYPE_ICONS[t]}`} alt={POST_TYPE_LABELS[t]} width={18} height={18} />
            {POST_TYPE_LABELS[t]}
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
