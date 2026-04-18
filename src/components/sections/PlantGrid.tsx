"use client";

import { Plant } from "@/core/plant/domain/Plant";
import { useStore } from "@nanostores/react";
import { $selectedPlantId } from "@/store/plantStore";

interface PlantGridProps {
  plants: Plant[];
}

export function PlantGrid({ plants }: PlantGridProps) {
  const selectedId = useStore($selectedPlantId);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Nunca';
    return dateStr.split('-').reverse().join('/');
  };

  const sortedPlants = [...plants].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div id="plants-list" className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-8 gap-y-8 w-full px-1 min-w-0">
      {sortedPlants.length === 0 ? (
        <div className="col-span-full py-20 text-center text-[var(--text-gray)] italic border-2 border-dashed border-[var(--border)] rounded-[2rem]">
          No hay plantas registradas. ¡Añadí tu primera planta!
        </div>
      ) : (
        sortedPlants.map((plant) => (
          <div
            key={plant.id}
            onClick={() => $selectedPlantId.set(plant.id)}
            className={`card min-h-fit h-auto flex flex-col bg-[var(--card-bg)] rounded-[2.5rem] border transition-all cursor-pointer group shadow-md hover:shadow-lg overflow-hidden gap-y-3 ${
              selectedId === plant.id
                ? 'ring-2 ring-[var(--primary)]/20 bg-[var(--success-bg)]/10'
                : 'border-[var(--border)]'
            }`}
            style={{ borderTop: `5px solid ${selectedId === plant.id ? 'var(--primary)' : 'var(--primary-light)'}` }}
          >
            {/* ROW 1: HEADER (Identidad) */}
            <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
                <div className="flex flex-col gap-y-2 min-w-0">
                    <h4 className="m-0 text-lg text-[var(--text)] leading-tight truncate">
                      {plant.icon} {plant.name}
                    </h4>
                    <small className="text-[0.8rem] font-bold text-[var(--text-gray)] uppercase tracking-widest truncate block opacity-70">
                      📍 {plant.location}
                    </small>
                </div>
                <div className="flex flex-col items-end gap-y-2 shrink-0">
                    <span className="badge badge-success text-[0.7rem] px-3 py-1">
                      {plant.type}
                    </span>
                    <small className="text-[0.7rem] text-[var(--primary)] opacity-50 uppercase tracking-tighter">
                      💡 {plant.light}
                    </small>
                </div>
            </div>

            {/* ROW 2: BODY (Info Técnica) */}
            <div className="pt-1">
               <div className="flex justify-between items-center rounded-2xl px-5 py-3">
                  <div className="flex flex-col gap-y-2">
                    <span className="text-[0.8rem] font-bold text-[var(--text-gray)] block mb-1 opacity-60">Último Riego</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[0.8rem] text-[var(--text)] bg-[var(--card-bg)] px-3 py-1">
                      💧 {formatDate(plant.lastWateredDate)}
                    </span>
                  </div>
               </div>
            </div>

            {/* ROW 3: FOOTER (Acciones) */}
            <div className="flex items-center justify-between pt-2 mt-auto text-[var(--footer-bg)]">
                <div className="flex flex-col gap-y-2">
                  <span className="text-[0.85rem] italic">Perfil Completo</span>
                </div>
                <button className="text-xl group-hover:translate-x-2 transition-transform bg-[var(--bg-faint)] w-10 h-10 flex items-center justify-center rounded-full shadow-sm border border-[var(--border-light)]">
                  ➔
                </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
