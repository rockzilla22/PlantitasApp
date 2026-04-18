"use client";

import { useStore } from "@nanostores/react";
import { $store, removeNote } from "@/store/plantStore";
import { openModal } from "@/store/modalStore";

export default function NotesPage() {
  const { globalNotes } = useStore($store);

  const handleAddNote = () => {
    openModal("add-note");
  };

  return (
    <section id="tab-notes" className="tab-content active">
      <div className="view-header">
        <h2 className="text-xl font-bold flex items-center gap-2">📝 Notas Globales</h2>
        <button className="btn-primary h-9 min-h-[36px] px-4 text-xs font-bold" onClick={handleAddNote}>
          + Nueva Nota
        </button>
      </div>

      <div id="notes-list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6 w-full px-1">
        {globalNotes.length === 0 ? (
          <div className="col-span-full py-20 text-center text-[var(--text-gray)] italic border-2 border-dashed border-zinc-100 rounded-[2rem]">
            No hay notas registradas. ¡Escribe tus pensamientos botánicos!
          </div>
        ) : (
          [...globalNotes]
            .sort((a, b) => b.id - a.id)
            .map((note) => (
              <div
                key={note.id}
                className="card !min-h-fit !h-auto flex flex-col p-5 bg-white rounded-[2.5rem] border-zinc-100 shadow-md hover:shadow-lg transition-all group overflow-hidden gap-y-6"
                style={{ borderTop: "5px solid var(--primary-light)" }}
              >
                {/* HEADER: Estilo Nursery */}
                <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
                  <div className="flex flex-col gap-y-2 min-w-0">
                    <h4 className="m-0 text-base font-black text-zinc-800 leading-tight truncate w-[140px]">📝 Nota Global</h4>
                  </div>
                  <div className="flex flex-col items-end gap-y-2">
                    <span className="badge badge-info">📜 {new Date(note.id).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* BODY: El contenido de la nota con el diseño de quote */}
                <div className="flex-1 pt-8">
                  <div className="rounded-2xl p-4 italic text-[var(--text-gray)] text-sm leading-relaxed break-words whitespace-pre-wrap">
                    " {note.content} "
                  </div>
                </div>

                {/* FOOTER: Acciones */}
                <div className="flex items-center justify-between pt-8 mt-auto">
                  <span className="text-[0.6rem] font-black text-zinc-300 tracking-tighter"></span>
                  <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-2 text-xl hover:scale-110 transition-transform"
                      title="Recordatorio"
                      onClick={() => openModal("calendar", { title: `Nota: ${note.content.substring(0, 15)}`, desc: note.content })}
                    >
                      📅
                    </button>
                    <button
                      className="p-2 text-base hover:scale-110 transition-transform"
                      title="Editar"
                      onClick={() => openModal("edit-note", note)}
                    >
                      ✏️
                    </button>
                    <button
                      className="p-2 text-base text-[var(--danger)] hover:scale-110 transition-transform"
                      title="Eliminar"
                      onClick={() => {
                        openModal("confirm", {
                          title: "¿Eliminar nota?",
                          message: "Esta acción es definitiva.",
                          onConfirm: () => removeNote(note.id),
                        });
                      }}
                    >
                      🗑️
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
