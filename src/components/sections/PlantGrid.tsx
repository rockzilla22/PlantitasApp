"use client";

import { Plant } from "@/core/plant/domain/Plant";
import { useStore } from "@nanostores/react";
import { $selectedPlantId } from "@/store/plantStore";
import { useEffect, useState } from "react";
import Image from "next/image";
import { PLANT_TYPES } from "@/data/catalog";

interface PlantGridProps {
  plants: Plant[];
}

export function PlantGrid({ plants }: PlantGridProps) {
  const selectedId = useStore($selectedPlantId);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Nunca";
    return dateStr.split("-").reverse().join("/");
  };

  if (!hasMounted) {
    return (
      <div id="plants-list" className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-8 gap-y-8 w-full px-1 min-w-0">
        {/* Placeholder vacío para evitar mismatch */}
      </div>
    );
  }

  const sortedPlants = [...plants].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div id="plants-list" className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-8 gap-y-8 w-full px-1 min-w-0">
      {sortedPlants.length === 0 ? (
        <div className="col-span-full py-20 text-center text-[var(--text-brown)] italic border-2 border-dashed border-[var(--border)] rounded-[2rem]">
          No hay plantas registradas. ¡Añade tu primera planta!
        </div>
      ) : (
        sortedPlants.map((plant) => {
          const plantTypeInfo = PLANT_TYPES.find((t) => t.value === plant.type);
          const isCustom = !plantTypeInfo || plant.type === "CUSTOM";
          const plantImg = plantTypeInfo?.img || "/icons/environment/plants/alocasia.svg";

          return (
            <div
              key={plant.id}
              onClick={() => $selectedPlantId.set(plant.id)}
              className={`card min-h-fit h-auto flex flex-col bg-[var(--card-bg)] rounded-[2.5rem] border transition-all cursor-pointer group shadow-md hover:shadow-lg overflow-hidden gap-y-3 ${
                selectedId === plant.id ? "ring-2 ring-[var(--primary)]/20 bg-[var(--success-bg)]/10" : "border-[var(--border)]"
              }`}
              style={{ borderTop: `5px solid ${selectedId === plant.id ? "var(--primary)" : "var(--primary-light)"}` }}
            >
              {/* ROW 1: HEADER (Identidad) */}
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 registros-start min-w-0">
                <div className="flex flex-col gap-y-2 min-w-0">
                  <h3 className="text-[var(--primary)] mb-2 flex items-center gap-3 text-lg font-bold">
                    <div className="flex items-center justify-center shrink-0">
                      {plant.icon && !plant.icon.startsWith("/") ? (
                        <span className="text-2xl">{plant.icon}</span>
                      ) : (
                        <Image src={plant.icon || plantImg} alt={plant.type} width={26} height={26} className="object-contain" />
                      )}
                    </div>
                    <span className="truncate">{plant.name}</span>
                  </h3>
                  <div className="flex items-center gap-1">
                    <Image src="/icons/common/map.svg" alt="map" width={14} height={14} className="inline" />
                    <small className="text-xs text-[var(--text-brown)] uppercase tracking-widest truncate block">{plant.location}</small>
                  </div>
                </div>
                <div className="flex max-w-[9.5rem] flex-col registros-end gap-y-1 shrink-0">
                  <span className="badge badge-info block max-w-full truncate text-[0.7rem] px-3 py-1" title={plant.type}>
                    {plant.type}
                  </span>
                  {plant.subtype && (
                    <span className="text-[0.65rem] text-[var(--text-gray)] font-bold uppercase tracking-tight truncate max-w-full mt-4 px-1" title={plant.subtype}>
                      {plant.subtype}
                    </span>
                  )}
                </div>
              </div>

              {/* ROW 2: BODY (Info Técnica) */}
              <div className="pt-1">
                <div className="flex justify-between items-center rounded-2xl px-5">
                  <div className="flex flex-col gap-y-2">
                    <span className="text-[0.8rem] font-bold text-[var(--text-brown)] block mb-1">Último Riego</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[0.8rem] text-[var(--text-brown)] bg-[var(--card-bg)] px-3">
                      <Image src="/icons/environment/inventory/water_drops.svg" alt="" width={14} height={14} className="inline mr-1" />
                      {formatDate(plant.lastWateredDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ROW 3: FOOTER (Acciones) */}
              <div className="flex items-center justify-between mt-auto text-[var(--footer-bg)]">
                <div className="flex flex-col gap-y-2">
                  <span className="text-[0.85rem] italic">Perfil Completo</span>
                </div>
                <button className="text-xl group-hover:translate-x-2 transition-transform bg-[var(--bg-faint)] w-10 h-10 flex items-center justify-center rounded-full shadow-sm border border-[var(--border-light)]">
                  <span
                    aria-hidden="true"
                    className="inline-block h-[14px] w-[14px] bg-[var(--primary)] [mask-image:url('/icons/common/arrow_rigth.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-image:url('/icons/common/arrow_rigth.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]"
                  />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
