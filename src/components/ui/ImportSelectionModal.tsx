"use client";

import { useState, useMemo } from "react";
import { AppData, normalizeData, mergeData, setStoreData, $store } from "@/store/plantStore";
import { closeModal } from "@/store/modalStore";
import { getEffectiveMaxSlots } from "@/libs/syncService";
import { $user } from "@/store/authStore";
import { useStore } from "@nanostores/react";

interface FlattenedItem {
  id: string;
  type: string;
  name: string;
  originalCategory?: string;
  originalSeason?: string;
  originalData: any;
}

export function ImportSelectionModal({ incomingData, mode }: { incomingData: any; mode: "merge" | "replace" }) {
  const user = useStore($user);
  const currentData = useStore($store);
  const maxSlots = getEffectiveMaxSlots(user);

  const normalized = useMemo(() => normalizeData(incomingData), [incomingData]);

  const currentUsed = useMemo(() =>
    mode === "merge"
      ? currentData.plants.length + currentData.propagations.length + currentData.wishlist.length + currentData.globalNotes.length +
        Object.values(currentData.inventory).reduce((s, a) => s + a.length, 0) +
        Object.values(currentData.seasonalTasks).reduce((s, a) => s + a.length, 0)
      : 0,
  [mode, currentData]);

  const availableSlots = maxSlots - currentUsed;

  const allItems: FlattenedItem[] = useMemo(() => {
    const list: FlattenedItem[] = [];
    normalized.plants.forEach(p => list.push({ id: `p-${p.id}`, type: "Planta", name: p.name, originalData: p }));
    normalized.propagations.forEach(p => list.push({ id: `pr-${p.id}`, type: "Propagación", name: p.name, originalData: p }));
    normalized.wishlist.forEach(p => list.push({ id: `w-${p.id}`, type: "Deseo", name: p.name, originalData: p }));
    normalized.globalNotes.forEach(p => list.push({ id: `n-${p.id}`, type: "Nota", name: p.content.slice(0, 30), originalData: p }));
    Object.entries(normalized.inventory).forEach(([cat, registros]) => {
      (registros as any[]).forEach((item, idx) => list.push({ id: `i-${cat}-${idx}`, type: `Insumo (${cat})`, name: item.name, originalCategory: cat, originalData: item }));
    });
    Object.entries(normalized.seasonalTasks).forEach(([season, tasks]) => {
      (tasks as any[]).forEach((task, idx) => list.push({ id: `s-${season}-${idx}`, type: `Temporada (${season})`, name: task.desc || task.type, originalSeason: season, originalData: task }));
    });
    return list;
  }, [normalized]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const handleToggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= availableSlots) return prev;
        next.add(id);
      }
      return next;
    });
  };

  const handleImport = () => {
    const finalData: AppData = {
      plants: [], propagations: [], wishlist: [], globalNotes: [],
      inventory: { substrates: [], fertilizers: [], powders: [], liquids: [], meds: [], others: [] },
      seasonalTasks: { Primavera: [], Verano: [], Otoño: [], Invierno: [] },
    };

    allItems.forEach(item => {
      if (!selectedIds.has(item.id)) return;
      if (item.type === "Planta") finalData.plants.push(item.originalData);
      else if (item.type === "Propagación") finalData.propagations.push(item.originalData);
      else if (item.type === "Deseo") finalData.wishlist.push(item.originalData);
      else if (item.type === "Nota") finalData.globalNotes.push(item.originalData);
      else if (item.originalCategory) (finalData.inventory as Record<string, any[]>)[item.originalCategory].push(item.originalData);
      else if (item.originalSeason) (finalData.seasonalTasks as Record<string, any[]>)[item.originalSeason].push(item.originalData);
    });

    if (mode === "merge") mergeData(finalData);
    else setStoreData(finalData);

    closeModal();
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-[var(--primary)] m-0">Seleccionar Registros</h3>
        <p className="text-xs text-[var(--text-gray)] mt-1">
          Tu plan permite <strong>{maxSlots}</strong> registros.
          {mode === "merge" ? ` Ya usás ${currentUsed}.` : ""}
          {" "}Disponibles:{" "}
          <span className={selectedIds.size >= availableSlots ? "text-[var(--danger)] font-bold" : "text-[var(--primary)] font-bold"}>
            {availableSlots - selectedIds.size}
          </span>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-6">
        {allItems.map(item => {
          const checked = selectedIds.has(item.id);
          const blocked = !checked && selectedIds.size >= availableSlots;
          return (
            <div
              key={item.id}
              role="button"
              tabIndex={blocked ? -1 : 0}
              aria-disabled={blocked}
              onClick={() => !blocked && handleToggle(item.id)}
              onKeyDown={(e) => (e.key === " " || e.key === "Enter") && !blocked && handleToggle(item.id)}
              className={`flex registros-center gap-3 p-3 rounded-xl border transition-all select-none ${
                blocked ? "cursor-not-allowed opacity-40" : "cursor-pointer"
              } ${checked ? "bg-[var(--primary-light)]/10 border-[var(--primary)]" : "bg-[var(--white)] border-[var(--border-light)]"}`}
            >
              <input
                type="checkbox"
                className="w-5 h-5 accent-[var(--primary)] pointer-events-none"
                checked={checked}
                readOnly
                tabIndex={-1}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[var(--text)] m-0 truncate">{item.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-gray)] m-0">{item.type}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 mt-auto">
        <button onClick={closeModal} className="btn-text flex-1 py-3 text-xs uppercase font-bold text-[var(--danger)]">
          Cancelar
        </button>
        <button
          onClick={handleImport}
          disabled={selectedIds.size === 0}
          className="btn-primary flex-1 py-3 text-xs uppercase font-bold disabled:opacity-40"
        >
          Importar {selectedIds.size} {selectedIds.size === 1 ? "registro" : "Items"}
        </button>
      </div>
    </div>
  );
}
