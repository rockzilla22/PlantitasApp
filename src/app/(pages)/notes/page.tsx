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
        <h2>📝 Notas Globales</h2>
        <button className="btn-primary" onClick={handleAddNote}>Nueva Nota</button>
      </div>
      <div id="notes-list" className="list-container">
        {globalNotes.length === 0 ? (
          <div className="empty-state">
            <p>No hay notas registradas.</p>
          </div>
        ) : (
          [...globalNotes].sort((a, b) => b.id - a.id).map(note => (
            <div key={note.id} className="note-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <small className="note-date">📅 {new Date(note.id).toLocaleString()}</small>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-text" style={{ fontSize: '1.1rem', padding: 0 }} onClick={() => openModal('calendar', { title: `Nota: ${note.content.substring(0, 15)}`, desc: note.content })}>📅</button>
                    <button className="btn-text" style={{ padding: 0 }} onClick={() => openModal('edit-note', note)}>✏️</button>
                    <button className="btn-text" style={{ color: 'var(--danger)', padding: 0 }} onClick={() => {
                      openModal("confirm", {
                        title: "¿Eliminar nota?",
                        message: "Esta acción es definitiva.",
                        onConfirm: () => removeNote(note.id)
                      });
                    }}>🗑️</button>
                  </div>
              </div>
              <p style={{ marginTop: '0.5rem' }}>📝 {note.content}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
