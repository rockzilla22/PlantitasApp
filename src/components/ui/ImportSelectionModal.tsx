"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { AppData, normalizeData, mergeData, setStoreData, $store } from "@/store/plantStore";
import { closeModal } from "@/store/modalStore";
import { getEffectiveMaxSlots } from "@/libs/syncService";
import { $user } from "@/store/authStore";
import { useStore } from "@nanostores/react";

interface FlattenedItem {
  id: string | number;
  type: string;
  name: string;
  originalCategory?: string;
  originalData: any;
}

export function ImportSelectionModal({ incomingData, mode }: { incomingData: any; mode: "merge" | "replace" }) {
  const user = useStore($user);
  const currentData = useStore($store);
  const normalized = normalizeData(incomingData);
  const maxSlots = getEffectiveMaxSlots(user);

  // Calculamos slots ya usados (si es merge)
  const currentUsed = mode === "merge" 
    ? (currentData.plants.length + currentData.propagations.length + currentData.wishlist.length + currentData.globalNotes.length + 
       Object.values(currentData.inventory).reduce((s, a) => s + a.length, 0) + 
       Object.values(currentData.seasonalTasks).reduce((s, a) => s + a.length, 0))
    : 0;

  const availableSlots = maxSlots - currentUsed;

  // Aplanamos todo para la lista
  const allItems: FlattenedItem[] = useMemo(() => {
    const list: FlattenedItem[] = [];
    normalized.plants.forEach(p => list.push({ id: `p-${p.id}`, type: "Planta", name: p.name, originalData: p }));
    normalized.propagations.forEach(p => list.push({ id: `pr-${p.id}`, type: "Propagación", name: p.name, originalData: p }));
    normalized.wishlist.forEach(p => list.push({ id: `w-${p.id}`, type: "Deseo", name: p.name, originalData: p }));
    normalized.globalNotes.forEach(p => list.push({ id: `n-${p.id}`, type: "Nota", name: p.content.slice(0, 30), originalData: p }));
    Object.entries(normalized.inventory).forEach(([cat, items]) => {
      items.forEach((item, idx) => list.push({ id: `i-${cat}-${idx}`, type: `Insumo (${cat})`, name: item.name, originalCategory: cat, originalData: item }));
    });
    return list;
  }, [normalized]);

  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const handleToggle = (id: string | number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      if (newSet.size >= availableSlots) return; // Bloqueo si excede CAP
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleImport = () => {
    const finalData: AppData = {
      plants: [], propagations: [], wishlist: [], globalNotes: [],
      inventory: { substrates: [], fertilizers: [], powders: [], liquids: [], meds: [], others: [] },
      seasonalTasks: normalized.seasonalTasks // Las tareas de temporada suelen ser fijas/pocas, las dejamos pasar
    };

    allItems.forEach(item => {
      if (selectedIds.has(item.id)) {
        if (item.type === "Planta") finalData.plants.push(item.originalData);
        else if (item.type === "Propagación") finalData.propagations.push(item.originalData);
        else if (item.type === "Deseo") finalData.wishlist.push(item.originalData);
        else if (item.type === "Nota") finalData.globalNotes.push(item.originalData);
        else if (item.originalCategory) {
           finalData.inventory[item.originalCategory as any].push(item.originalData);
        }
      }
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
          Tu plan permite <strong>{maxSlots}</strong> items. 
          {mode === "merge" ? ` Ya usás ${currentUsed}.` : ""}
          Disponibles: <span className={selectedIds.size >= availableSlots ? "text-[var(--danger)] font-bold" : "text-[var(--primary)] font-bold"}>
            {availableSlots - selectedIds.size}
          </span>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-6">
        {allItems.map(item => (
          <label 
            key={item.id} 
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
              selectedIds.has(item.id) ? "bg-[var(--primary-light)]/10 border-[var(--primary)]" : "bg-[var(--white)] border-[var(--border-light)] opacity-70"
            }`}
          >
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded-md border-[var(--border)] accent-[var(--primary)]"
              checked={selectedIds.has(item.id)}
              onChange={() => handleToggle(item.id)}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[var(--text)] m-0 truncate">{item.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-gray)] m-0">{item.type}</p>
            </div>
          </label>
        ))}
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
          Importar {selectedIds.size} {selectedIds.size === 1 ? "ítem" : "ítems"}
        </button>
      </div>
    </div>
  );
}
