"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $store } from "@/store/plantStore";
import { $user } from "@/store/authStore";
import { supabaseBrowser } from "@/libs/db";
import { toast } from "react-hot-toast";
import Image from "next/image";

export function FeedbackSection() {
  const user = useStore($user);
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const storeData = useStore($store);
  const containerRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("Idea");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return toast.error("Llená los campos obligatorios");

    setIsSending(true);
    const sb = supabaseBrowser();

    const metadata = {
      browser: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      screen: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "Unknown",
      appState: storeData, // El export JSON "secreto"
    };

    const { error } = await sb.from("feedback").insert({
      title,
      type,
      description,
      attachment_url: typeof window !== "undefined" ? window.location.href : "",
      metadata,
      status: "nuevo",
      priority: "media"
    });

    setIsSending(false);

    if (error) {
      console.error("Feedback error:", error);
      toast.error("Hubo un error al enviar tu feedback");
    } else {
      toast.success("¡Gracias por tu feedback! 🌿");
      setTitle("");
      setDescription("");
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[1000]" ref={containerRef}>
      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-2xl hover:scale-110 transition-transform focus:outline-none border-4 border-white"
        title="Enviar Feedback"
      >
        <Image src="/icons/common/stars.svg" alt="Feedback" width={28} height={28} className="brightness-0 invert" />
      </button>

      {/* Formulario */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 w-[320px] sm:w-[380px] bg-[var(--card-bg)] border border-[var(--border-light)] rounded-[2.5rem] shadow-2xl p-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-[var(--primary)] flex items-center gap-2">
              <Image src="/icons/common/notes.svg" alt="Feedback" width={20} height={20} />
              Tu Feedback
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-[var(--text-gray)] hover:text-[var(--danger)]">
              <img src="/icons/common/fail.svg" width={14} height={14} alt="Cerrar" className="object-contain" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="text-xs font-bold uppercase opacity-60 tracking-widest mb-1 block">Título*</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Problema al regar"
                className="w-full p-3 rounded-2xl bg-[var(--bg-faint)] border border-[var(--border-light)] text-sm focus:border-[var(--primary)] outline-none"
                required
              />
            </div>

            <div className="form-group">
              <label className="text-xs font-bold uppercase opacity-60 tracking-widest mb-1 block">Tipo*</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 rounded-2xl bg-[var(--bg-faint)] border border-[var(--border-light)] text-sm focus:border-[var(--primary)] outline-none"
              >
                <option value="Bug">🐛 Bug / Error</option>
                <option value="Idea">💡 Idea / Sugerencia</option>
                <option value="Comentario">💬 Comentario</option>
              </select>
            </div>

            <div className="form-group">
              <label className="text-xs font-bold uppercase opacity-60 tracking-widest mb-1 block">Descripción*</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contanos más detalles..."
                rows={4}
                className="w-full p-3 rounded-2xl bg-[var(--bg-faint)] border border-[var(--border-light)] text-sm focus:border-[var(--primary)] outline-none resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-4 bg-[var(--primary)] text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              {isSending ? (
                "Enviando..."
              ) : (
                <>
                  Enviar Feedback
                  <Image src="/icons/common/success.svg" alt="Success" width={16} height={16} className="brightness-0 invert" />
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-[var(--text-gray)] opacity-60 italic">
              Se enviará info técnica de tu navegador y plantas para ayudarnos a mejorar.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
