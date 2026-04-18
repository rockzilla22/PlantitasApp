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
    { name: "Primavera", icon: "🌸" },
    { name: "Verano", icon: "☀️" },
    { name: "Otoño", icon: "🍂" },
    { name: "Invierno", icon: "❄️" },
  ];

  const handleAddTask = (season: Season) => {
    openModal("add-season-task", { season });
  };

  const getTaskIcon = (type: string) => {
    const icons: Record<string, string> = { Poda: "✂️", Siembra: "🌱", Trasplante: "🛒", Abonado: "🧪", Limpieza: "🧹", Otro: "📝" };
    return icons[type] || "📝";
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
      onConfirm: () => removeSeasonTask(season, index),
    });
  };

  return (
    <section id="tab-season" className="tab-content active">
      <div className="view-header">
        <h2 className="text-[var(--primary)] font-bold">Planeación</h2>
      </div>
      <div className="flex items-center gap-3 flex-wrap mb-6">
        <div className="sort-group flex bg-[var(--black-soft)] p-1 rounded-xl gap-1">
          <button
            className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg transition-all ${sortBy === "type" ? "bg-[var(--white)] text-[var(--primary)] shadow-sm" : "text-[var(--text-gray)] hover:text-[var(--primary)]"}`}
            onClick={() => setSortBy("type")}
          >
            🏷️ Tipo
          </button>
          <button
            className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg transition-all  ${sortBy === "desc" ? "bg-[var(--white)] text-[var(--primary)] shadow-sm" : "text-[var(--text-gray)] hover:text-[var(--primary)]"}`}
            onClick={() => setSortBy("desc")}
          >
            🔤 Descripción
          </button>
        </div>
      </div>

      <div className="inventory-sections grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1600px] mx-auto">
        {seasons.map((s) => (
          <div
            key={s.name}
            className="inventory-card bg-[var(--card-bg)] p-8 rounded-[2.5rem] shadow-xl border border-[var(--border-light)] flex flex-col"
          >
            <div className="flex justify-between items-center border-b border-[var(--primary)]/10 pb-4 mb-6">
              <h3 className="m-0 text-xl flex items-center gap-3 text-[var(--primary)] font-bold">
                <span className="text-3xl">{s.icon}</span> {s.name}
              </h3>
              <button className="btn-primary h-9 min-h-[36px] px-4 text-xs uppercase tracking-widest" onClick={() => handleAddTask(s.name)}>
                + Añadir
              </button>
            </div>

            <ul className="flex flex-col gap-3 p-0 m-0 list-none">
              {seasonalTasks[s.name]?.length === 0 && (
                <p className="text-[0.9rem] text-[var(--text-gray)] text-center py-8 italic opacity-50">Sin planes activos.</p>
              )}
              {getSortedTasks(s.name).map((t, idx) => (
                <li
                  key={`${t.type}-${idx}`}
                  className="inventory-item hover:bg-[var(--primary)]/[0.08] bg-[var(--input-bg)] border border-[var(--primary)]/10 transition-all py-4 px-4 rounded-[1.5rem] flex items-center justify-between gap-4"
                >
                  {/* Info Tarea */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span className="text-2xl shrink-0" title={t.type}>
                      {getTaskIcon(t.type)}
                    </span>
                    <p className="m-0 text-[0.95rem] text-[var(--text)] truncate leading-tight" title={t.desc}>
                      {t.desc}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 shrink-0 ml-2 border-l border-[var(--border)] pl-4">
                    <button
                      className="p-2 text-2xl hover:scale-125 transition-transform"
                      title="Agendar"
                      onClick={() => openModal("calendar", { title: `${t.type}: Plan de ${s.name}`, desc: t.desc })}
                    >
                      📅
                    </button>
                    <button
                      className="p-2 hover:bg-[var(--card-bg)] rounded-xl transition-all opacity-60 hover:opacity-100 "
                      title="Editar"
                      onClick={() => openModal("edit-season-task", { ...t, season: s.name, index: idx })}
                    >
                      ✏️
                    </button>
                    <button
                      className="p-2 text-[var(--danger)] hover:bg-[var(--danger-bg-light)] rounded-xl transition-all opacity-60 hover:opacity-100 "
                      title="Borrar"
                      onClick={() => handleRemove(s.name, idx)}
                    >
                      🗑️
                    </button>
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
