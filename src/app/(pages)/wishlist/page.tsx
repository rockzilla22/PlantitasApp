"use client";

import { useStore } from "@nanostores/react";
import { $store, removeWish } from "@/store/plantStore";
import { openModal } from "@/store/modalStore";
import { useState, useMemo } from "react";

export default function wishlistPage() {
  const { wishlist } = useStore($store);
  const [priorityFilter, setPriorityFilter] = useState("Todas");

  const filteredwishlist = useMemo(() => {
    return wishlist.filter(item => {
      const matchesPriority = priorityFilter === "Todas" || item.priority === priorityFilter;
      return matchesPriority;
    });
  }, [wishlist, priorityFilter]);

  const handleAddWish = () => {
    openModal("add-wish");
  };

  return (
    <section id="tab-wishlist" className="tab-content active">
      <div className="view-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h2>✨ Lista de Deseos</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div className="sort-group" style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '10px', gap: '2px' }}>
              {["Todas", "Alta", "Media", "Baja"].map(p => (
                <button
                  key={p}
                  className={`btn-text ${priorityFilter === p ? 'active' : ''}`}
                  style={{ 
                    fontSize: '0.75rem', 
                    padding: '4px 10px', 
                    borderRadius: '8px', 
                    background: priorityFilter === p ? 'white' : 'transparent', 
                    color: priorityFilter === p ? 'var(--primary)' : 'var(--text-gray)',
                    boxShadow: priorityFilter === p ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
                  }}
                  onClick={() => setPriorityFilter(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button className="btn-primary" onClick={handleAddWish}>Añadir Deseo</button>
      </div>
      <div id="wishlist-container" className="grid-container">
        {filteredwishlist.length === 0 ? (
          <div className="empty-state">
            <p>{wishlist.length === 0 ? "No hay deseos registrados." : "No se encontraron coincidencias."}</p>
          </div>
        ) : (
          filteredwishlist.map(item => {
            const { name = "Sin nombre", priority = "Media", notes = "", id } = item;
            return (
              <div key={id} className="card wish-card">
                <div className="wish-card-top">
                    <h3 style={{ margin: 0, fontSize: '1.15rem', wordBreak: 'break-word', color: 'var(--text)' }}>
                      ✨ {name}
                    </h3>
                    <span className={`badge ${priority === 'Alta' ? 'badge-danger' : 'badge-warning'}`}>
                      {priority}
                    </span>
                </div>

                <div className="wish-card-body">
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-gray)', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    📝 {notes || 'Sin notas'}
                  </p>
                </div>

                <div className="wish-card-actions">
                    <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => removeWish(id)}>💸 ¡Listo!</button>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-text" style={{ fontSize: '1.2rem', padding: '4px' }} onClick={() => openModal('calendar', { title: `Comprar: ${name}`, desc: `Prioridad: ${priority}. Notas: ${notes}` })}>📅</button>
                      <button className="btn-text" style={{ padding: '4px' }} onClick={() => openModal('edit-wish', item)}>✏️</button>
                      <button className="btn-text" style={{ color: 'var(--danger)', padding: '4px' }} onClick={() => {
                        openModal("confirm", {
                          title: "¿Eliminar deseo?",
                          message: "Se quitará de la lista.",
                          onConfirm: () => removeWish(id)
                        });
                      }}>🗑️</button>
                    </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
