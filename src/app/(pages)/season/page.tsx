"use client";

import { useStore } from "@nanostores/react";
import { $store, removeSeasonTask } from "@/store/plantStore";
import { Season, SeasonTask } from "@/core/season/domain/SeasonTask";
import { openModal } from "@/store/modalStore";
import { useState } from "react";

export default function SeasonPage() {
  const { seasonalTasks } = useStore($store);
  const [sortBy, setSortBy] = useState<"type" | "desc">("type");

  const seasons: { name: Season; icon: string }[] = [
    { name: 'Primavera', icon: '🌸' },
    { name: 'Verano', icon: '☀️' },
    { name: 'Otoño', icon: '🍂' },
    { name: 'Invierno', icon: '❄️' }
  ];

  const handleAddTask = (season: Season) => {
    openModal("add-season-task", { season });
  };

  const getTaskIcon = (type: string) => {
    const icons: Record<string, string> = { Poda: '✂️', Siembra: '🌱', Trasplante: '🛒', Abonado: '🧪', Limpieza: '🧹', Otro: '📝' };
    return icons[type] || '📝';
  };

  const getSortedTasks = (season: Season) => {
    const tasks = [...(seasonalTasks[season] || [])];
    if (sortBy === "type") {
      return tasks.sort((a, b) => a.type.localeCompare(b.type));
    } else {
      return tasks.sort((a, b) => a.desc.localeCompare(b.desc));
    }
  };

  return (
    <section id="tab-season" className="tab-content active">
      <div className="view-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2>📅 Planeación Anual</h2>
          <div className="sort-group" style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '10px', gap: '2px' }}>
            <button 
              className={`btn-text ${sortBy === 'type' ? 'active' : ''}`} 
              style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '8px', background: sortBy === 'type' ? 'white' : 'transparent', color: sortBy === 'type' ? 'var(--primary)' : 'var(--text-gray)', boxShadow: sortBy === 'type' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}
              onClick={() => setSortBy('type')}
            >
              🏷️ Tipo
            </button>
            <button 
              className={`btn-text ${sortBy === 'desc' ? 'active' : ''}`} 
              style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '8px', background: sortBy === 'desc' ? 'white' : 'transparent', color: sortBy === 'desc' ? 'var(--primary)' : 'var(--text-gray)', boxShadow: sortBy === 'desc' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}
              onClick={() => setSortBy('desc')}
            >
              🔤 Descripción
            </button>
          </div>
        </div>
      </div>
      <div id="season-grid" className="season-grid">
        {seasons.map(s => (
          <div key={s.name} className="inventory-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--background)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{s.icon} {s.name}</h3>
                <button className="btn-primary" style={{ padding: '5px 12px', fontSize: '0.85rem' }} onClick={() => handleAddTask(s.name)}>+ Añadir Acción</button>
            </div>
            <ul className="season-task-list">
                {seasonalTasks[s.name]?.length === 0 && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', textAlign: 'center' }}>Sin planes.</p>
                )}
                {getSortedTasks(s.name).map((t, idx) => (
                  <li key={`${t.type}-${idx}`} className="season-task-item">
                    <div style={{ flex: 1 }}>
                      <strong>{getTaskIcon(t.type)} {t.type}</strong>
                      <p style={{ margin: '2px 0 0 0' }}>📝 {t.desc}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-text" style={{ fontSize: '1.1rem', padding: 0 }} onClick={() => openModal('calendar', { title: `${t.type}: Plan de ${s.name}`, desc: t.desc })}>📅</button>
                      <button className="btn-text" style={{ padding: 0 }} onClick={() => openModal('edit-season-task', { ...t, season: s.name, index: idx })}>✏️</button>
                      <button className="btn-text" style={{ color: 'var(--danger)', padding: 0 }} onClick={() => removeSeasonTask(s.name, idx)}>🗑️</button>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
