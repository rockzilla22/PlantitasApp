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
        <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--primary)]">
          📝 Notas Globales
        </h2>
        <button className="btn-primary h-9 min-h-[36px] px-4 text-xs font-bold" onClick={handleAddNote}>
          + Nueva Nota
        </button>
      </div>

      <div id="notes-list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6 w-full px-1">
        {globalNotes.length === 0 ? (
          <div className="col-span-full py-20 text-center text-[var(--text-gray)] italic border-2 border-dashed border-[var(--border-light)] rounded-[2rem]">
            No hay notas registradas. ¡Escribe tus pensamientos botánicos!
          </div>
        ) : (
          [...globalNotes].sort((a, b) => b.id - a.id).map(note => (
            <div key={note.id} className="card !min-h-fit !h-auto flex flex-col p-5 bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border-light)] shadow-sm hover:shadow-md transition-all group overflow-hidden gap-y-6" style={{ borderTop: '5px solid var(--primary-light)' }}>
              {/* HEADER: Estilo Nursery */}
              <div className="grid grid-cols-[1fr_auto] gap-3 items-start mb-4">
                  <div>
                      <h4 className="m-0 text-base font-black text-[var(--text)] leading-tight truncate w-[140px]">📝 Nota Global</h4>
                      <small className="text-[0.65rem] font-bold text-[var(--text-gray)] uppercase tracking-widest opacity-60">Pensamiento</small>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                      <span className="badge badge-info">📜 Nota</span>
                      <small className="text-[0.6rem] font-bold text-[var(--text-gray)] opacity-40">📅 {new Date(note.id).toLocaleDateString()}</small>
                  </div>
              </div>

              {/* BODY: El contenido de la nota con el diseño de quote */}
              <div className="flex-1 mb-6 border-t border-[var(--border-lightest)] pt-4">
                <div className="bg-[var(--light-surface)]/50 rounded-2xl p-4 border border-[var(--border-lightest)] italic text-[var(--text-gray)] text-sm leading-relaxed break-words whitespace-pre-wrap">
                  " {note.content} "
                </div>
              </div>

              {/* FOOTER: Acciones */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-lightest)] mt-auto text-[var(--text-muted)]">
                  <span className="text-[0.6rem] font-black opacity-40 tracking-tighter uppercase">REF: {note.id.toString().slice(-6)}</span>
                  <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-xl hover:scale-110 transition-transform" title="Recordatorio" onClick={() => openModal('calendar', { title: `Nota: ${note.content.substring(0, 15)}`, desc: note.content })}>📅</button>
                    <button className="p-2 text-base hover:scale-110 transition-transform" title="Editar" onClick={() => openModal('edit-note', note)}>✏️</button>
                    <button className="p-2 text-base text-[var(--danger)] hover:scale-110 transition-transform" title="Eliminar" onClick={() => {
                      openModal("confirm", {
                        title: "¿Eliminar nota?",
                        message: "Esta acción es definitiva.",
                        onConfirm: () => removeNote(note.id)
                      });
                    }}>🗑️</button>
                  </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
