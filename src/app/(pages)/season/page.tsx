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

  const handleRemove = (season: Season, index: number) => {
    openModal("confirm", {
      title: "¿Eliminar tarea?",
      message: "Se quitará del plan de temporada.",
      onConfirm: () => removeSeasonTask(season, index)
    });
  };

  return (
    <section id="tab-season" className="tab-content active">
      <div className="view-header">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-bold m-0">📅 Planeación</h2>
          <div className="sort-group flex bg-black/5 p-1 rounded-xl gap-1">
            <button 
              className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg transition-all ${sortBy === 'type' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-[var(--text-gray)] hover:text-[var(--primary)]'}`} 
              onClick={() => setSortBy('type')}
            >
              🏷️ Tipo
            </button>
            <button 
              className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg transition-all ${sortBy === 'desc' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-[var(--text-gray)] hover:text-[var(--primary)]'}`} 
              onClick={() => setSortBy('desc')}
            >
              🔤 Descripción
            </button>
          </div>
        </div>
      </div>

      <div className="inventory-sections">
        {seasons.map(s => (
          <div key={s.name} className="inventory-card !flex flex-col">
            <div className="flex justify-between items-center border-b border-[var(--primary)]/10 pb-3 mb-4">
                <h3 className="m-0 text-lg font-black flex items-center gap-2">
                  <span className="text-2xl">{s.icon}</span> {s.name}
                </h3>
                <button className="btn-primary h-8 min-h-[32px] px-3 text-[0.7rem] font-black" onClick={() => handleAddTask(s.name)}>
                  + Acción
                </button>
            </div>
            
            <ul className="flex flex-col gap-2 p-0 m-0 list-none">
                {seasonalTasks[s.name]?.length === 0 && (
                  <p className="text-[0.8rem] text-zinc-400 text-center py-4 italic">Sin planes activos.</p>
                )}
                {getSortedTasks(s.name).map((t, idx) => (
                  <li key={`${t.type}-${idx}`} className="inventory-item bg-[var(--primary)]/5 hover:bg-[var(--primary)]/10 border border-[var(--primary)]/10 transition-all py-3 px-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between gap-3">
                    {/* Info Tarea */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xl shrink-0" title={t.type}>{getTaskIcon(t.type)}</span>
                      <p className="m-0 text-[0.85rem] font-bold text-zinc-800 truncate leading-tight" title={t.desc}>
                        {t.desc}
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-1 shrink-0 ml-2 border-l border-zinc-200 pl-3">
                      <button className="p-1.5 text-xl hover:scale-125 transition-transform" title="Agendar" onClick={() => openModal('calendar', { title: `${t.type}: Plan de ${s.name}`, desc: t.desc })}>📅</button>
                      <button className="p-1.5 hover:bg-white rounded-lg transition-all opacity-60 hover:opacity-100" title="Editar" onClick={() => openModal('edit-season-task', { ...t, season: s.name, index: idx })}>✏️</button>
                      <button className="p-1.5 text-[var(--danger)] hover:bg-red-50 rounded-lg transition-all opacity-60 hover:opacity-100" title="Borrar" onClick={() => handleRemove(s.name, idx)}>🗑️</button>
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
