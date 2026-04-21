"use client";

import { useStore } from "@nanostores/react";
import { $store, removeNote, checkCapLimit } from "@/store/plantStore";
import { openModal } from "@/store/modalStore";
import Image from "next/image";

export default function NotesPage() {
  const { globalNotes } = useStore($store);

  const handleAddNote = () => {
    if (checkCapLimit()) openModal("add-note");
  };

  return (
    <section id="tab-notes" className="tab-content active">
      <div className="view-header">
        <h2 className="text-[var(--primary)] font-bold">Notas Globales</h2>
        <button className="btn-primary" onClick={handleAddNote}>
          + Añadir
        </button>
      </div>

      <div id="notes-list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6 w-full px-1">
        {globalNotes.length === 0 ? (
          <div className="col-span-full py-20 text-center text-[var(--text-gray)] italic border-2 border-dashed border-[var(--border-light)] rounded-[2rem]">
            No hay notas registradas. ¡Escribe tus pensamientos botánicos!
          </div>
        ) : (
          [...globalNotes]
            .sort((a, b) => b.id - a.id)
            .map((note) => (
              <div
                key={note.id}
                className="card !min-h-fit !h-auto flex flex-col p-5 bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border-light)] shadow-sm hover:shadow-md transition-all group overflow-hidden"
                style={{ borderTop: "5px solid var(--primary-light)" }}
              >
                {/* HEADER: Estilo Nursery */}
                <div className="grid grid-cols-[1fr_auto] gap-3 registros-start mb-4">
                  <div>
                    <h3 className="text-[var(--primary)] flex items-center gap-3 text-lg font-bold">
                      <Image src="/icons/common/notes.svg" alt="" width={24} height={24} /> Nota Global
                    </h3>
                  </div>
                  <div className="flex flex-col registros-end gap-1.5">
                    <span className="badge badge-info">{new Date(note.id).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* BODY: El contenido de la nota con el diseño de quote */}
                <div className="flex-1 border-t border-[var(--border-light)] pt-4">
                  <div className="rounded-2xl p-4 border border-[var(--border-light)] italic text-[var(--text)] text-sm leading-relaxed break-words whitespace-pre-wrap">
                    {note.content}
                  </div>
                </div>

                {/* FOOTER: Acciones */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)] text-[var(--text-muted)]">
                  <span className="text-[0.6rem] opacity-40 tracking-tighter uppercase"></span>
                  <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-2 hover:scale-110 transition-transform"
                      title="Recordatorio"
                      onClick={() => openModal("calendar", { title: `Nota: ${note.content.substring(0, 15)}`, desc: note.content })}
                    >
                      <Image src="/icons/common/calendar.svg" alt="Recordatorio" width={20} height={20} />
                    </button>
                    <button
                      className="p-2 hover:scale-110 transition-transform"
                      title="Editar"
                      onClick={() => openModal("edit-note", note)}
                    >
                      <Image src="/icons/common/pencil.svg" alt="Editar" width={18} height={18} />
                    </button>
                    <button
                      className="p-2 hover:scale-110 transition-transform"
                      title="Eliminar"
                      onClick={() => {
                        openModal("confirm", {
                          title: "¿Eliminar nota?",
                          message: "Esta acción es definitiva.",
                          onConfirm: () => removeNote(note.id),
                        });
                      }}
                    >
                      <Image src="/icons/common/trash.svg" alt="Eliminar" width={18} height={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </section>
  );
}
