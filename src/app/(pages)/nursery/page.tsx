"use client";

import { useStore } from "@nanostores/react";
import { $store, removeProp, updatePropStatus } from "@/store/plantStore";
import { useState } from "react";
import { openModal } from "@/store/modalStore";

export default function NurseryPage() {
  const { propagations, plants } = useStore($store);
  const [filter, setFilter] = useState("TODOS");

  const handleAddProp = () => {
    openModal("add-prop");
  };

  const getMethodIcon = (method: string) => {
    const icons: Record<string, string> = { Agua: '💧', Sustrato: '🟤', Acodo: '🌳', Semilla: '🌱' };
    return icons[method] || '🧪';
  };

  const formatDate = (dateStr: string) => dateStr.split('-').reverse().join('/');

  const filteredList = propagations.filter(p => filter === "TODOS" || p.status === filter);

  const handleGraduate = (prop: any) => {
    updatePropStatus(prop.id, 'Trasplantada');
    const parentName = prop.parentId ? plants.find((p: any) => p.id === prop.parentId)?.name : null;
    openModal("add-plant", {
      initialName: parentName ? `Hija de ${parentName}` : `Hija de ${prop.name}`,
      propId: prop.id
    });
  };

  const handleRemove = (id: number) => {
    openModal("confirm", {
      title: "¿Eliminar propagación?",
      message: "Esta acción es definitiva.",
      onConfirm: () => removeProp(id)
    });
  };

  return (
    <section id="tab-nursery" className="tab-content active">
      <div className="view-header">
        <h2>Laboratorio de Propagación</h2>
        <button className="btn-primary" onClick={handleAddProp}>Nueva Propagación</button>
      </div>
      <div className="filter-bar" style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button className={`btn-backup ${filter === "TODOS" ? "active" : ""}`} onClick={() => setFilter("TODOS")}>Todos</button>
        <button className={`btn-backup ${filter === "Activo" ? "active" : ""}`} onClick={() => setFilter("Activo")}>⌛ Activos</button>
        <button className={`btn-backup ${filter === "Éxito" ? "active" : ""}`} onClick={() => setFilter("Éxito")}>✅ Éxito</button>
        <button className={`btn-backup ${filter === "Trasplantada" ? "active" : ""}`} onClick={() => setFilter("Trasplantada")}>🌳 Trasplantadas</button>
        <button className={`btn-backup ${filter === "Fracaso" ? "active" : ""}`} onClick={() => setFilter("Fracaso")}>❌ Fallos</button>
      </div>
      <div id="nursery-list" className="prop-grid">
        {filteredList.length === 0 ? (
          <div className="empty-state">
            <p>No hay propagaciones registradas.</p>
          </div>
        ) : (
          filteredList.map(prop => {
            let badgeClass = 'badge-warning';
            let icon = '⌛';
            if (prop.status === 'Éxito') { badgeClass = 'badge-success'; icon = '✅'; }
            if (prop.status === 'Fracaso') { badgeClass = 'badge-danger'; icon = '❌'; }
            if (prop.status === 'Trasplantada') { badgeClass = 'badge-info'; icon = '🌳'; }
            
            return (
              <div key={prop.id} className={`prop-card prop-status-${prop.status.toLowerCase().replace(' ', '-')}`}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'start', marginBottom: '0.8rem' }}>
                    <div>
                        <h4 style={{ margin: 0 }}>🧪 {prop.name}</h4>
                        <small style={{ color: 'var(--text-gray)' }}>{getMethodIcon(prop.method)} {prop.method}</small>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                        <span className={`badge ${badgeClass}`}>{icon} {prop.status}</span>
                        <small style={{ color: 'var(--text-gray)', whiteSpace: 'nowrap' }}>📅 {formatDate(prop.startDate)}</small>
                    </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '1rem', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                  📝 {prop.notes || 'Sin notas'}
                </p>
                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {prop.status === 'Activo' ? (
                          <>
                            <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => updatePropStatus(prop.id, 'Éxito')}>✅ Éxito</button>
                            <button className="btn-text" style={{ color: 'var(--danger)', padding: '4px' }} onClick={() => updatePropStatus(prop.id, 'Fracaso')}>❌ Fallo</button>
                          </>
                        ) : prop.status === 'Éxito' ? (
                            <button 
                              className="btn-primary" 
                              style={{ padding: '4px 8px', fontSize: '0.8rem', background: 'var(--secondary)' }}
                              onClick={() => handleGraduate(prop)}
                            >
                              🪴 Convertir
                            </button>
                        ) : null}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-text" style={{ fontSize: '1.1rem', padding: 0 }} onClick={() => openModal('calendar', { title: `Chequear: ${prop.name}`, desc: `Método: ${prop.method}. Notas: ${prop.notes}` })}>📅</button>
                        <button className="btn-text" style={{ padding: 0 }} onClick={() => openModal('edit-prop', prop)}>✏️</button>
                        <button className="btn-text" style={{ color: 'var(--danger)', padding: 0 }} onClick={() => handleRemove(prop.id)}>🗑️</button>
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
