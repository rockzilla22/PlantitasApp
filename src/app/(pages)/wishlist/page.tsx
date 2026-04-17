"use client";

import { useStore } from "@nanostores/react";
import { $store, removeWish } from "@/store/plantStore";
import { openModal } from "@/store/modalStore";
import { useState, useMemo } from "react";

export default function WishlistPage() {
  const { wishlist } = useStore($store);
  const [priorityFilter, setPriorityFilter] = useState("Todas");

  const filteredWishlist = useMemo(() => {
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
        {filteredWishlist.length === 0 ? (
          <div className="empty-state">
            <p>{wishlist.length === 0 ? "No hay deseos registrados." : "No se encontraron coincidencias."}</p>
          </div>
        ) : (
          filteredWishlist.map(item => (
            <div key={item.id} className="card wish-card" style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', wordBreak: 'break-word', flex: '1' }}>✨ {item.name}</h3>
                  <span className={`badge ${item.priority === 'Alta' ? 'badge-danger' : 'badge-warning'}`} style={{ whiteSpace: 'nowrap' }}>
                    {item.priority === 'Alta' ? 'Alta' : item.priority}
                  </span>
              </div>
              <p style={{ margin: '0.75rem 0', fontSize: '0.95rem', color: 'var(--text-gray)', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                📝 {item.notes || 'Sin notas'}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => removeWish(item.id)}>💸 ¡Listo!</button>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-text" style={{ fontSize: '1.2rem', padding: '4px' }} onClick={() => openModal('calendar', { title: `Comprar: ${item.name}`, desc: `Prioridad: ${item.priority}. Notas: ${item.notes}` })}>📅</button>
                    <button className="btn-text" style={{ padding: '4px' }} onClick={() => openModal('edit-wish', item)}>✏️</button>
                    <button className="btn-text" style={{ color: 'var(--danger)', padding: '4px' }} onClick={() => {
                      openModal("confirm", {
                        title: "¿Eliminar deseo?",
                        message: "Se quitará de la lista.",
                        onConfirm: () => removeWish(item.id)
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
