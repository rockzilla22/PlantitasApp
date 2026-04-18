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
        <h2 className="text-xl font-bold flex items-center gap-2">
          📝 Notas Globales
        </h2>
        <button className="btn-primary h-9 min-h-[36px] px-4 text-xs font-bold" onClick={handleAddNote}>
          + Nueva Nota
        </button>
      </div>

      <div id="notes-list" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4 w-full">
        {globalNotes.length === 0 ? (
          <div className="col-span-full py-20 text-center text-[var(--text-gray)] italic">
            No hay notas registradas. ¡Escribe tus pensamientos botánicos!
          </div>
        ) : (
          [...globalNotes].sort((a, b) => b.id - a.id).map(note => (
            <div key={note.id} className="card !min-h-fit !h-auto flex flex-col p-5 bg-white rounded-3xl border border-[var(--border)] shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <small className="text-[0.65rem] font-black uppercase tracking-widest text-[var(--primary)] opacity-60">
                      Fecha
                    </small>
                    <span className="text-[0.75rem] font-bold text-zinc-500">
                      📅 {new Date(note.id).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-xl hover:scale-110 transition-transform" title="Agendar recordatorio" onClick={() => openModal('calendar', { title: `Nota: ${note.content.substring(0, 15)}`, desc: note.content })}>📅</button>
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
              
              <div className="flex-1 bg-zinc-50/50 rounded-2xl p-4 border border-zinc-100 italic text-[var(--text-gray)] text-sm leading-relaxed break-words whitespace-pre-wrap">
                " {note.content} "
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-between items-center lg:hidden">
                  {/* Actions visible always on mobile */}
                  <span className="text-[0.6rem] font-bold text-zinc-400">ID: {note.id.toString().slice(-4)}</span>
                  <div className="flex gap-2">
                    <button className="text-xl" onClick={() => openModal('calendar', { title: `Nota: ${note.content.substring(0, 15)}`, desc: note.content })}>📅</button>
                    <button className="text-base" onClick={() => openModal('edit-note', note)}>✏️</button>
                    <button className="text-base text-[var(--danger)]" onClick={() => {
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
