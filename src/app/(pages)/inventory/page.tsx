"use client";

import { useStore } from "@nanostores/react";
import { $store, updateItemQty, removeInventoryItem } from "@/store/plantStore";
import { InventoryCategory } from "@/core/inventory/domain/InventoryItem";
import { openModal } from "@/store/modalStore";
import { useState } from "react";

export default function InventoryPage() {
  const { inventory } = useStore($store);
  const [sortBy, setSortBy] = useState<"name" | "qty">("name");

  const categories: { id: InventoryCategory; label: string; icon: string }[] = [
    { id: "substrates", label: "Sustratos", icon: "🟤" },
    { id: "fertilizers", label: "Fertilizantes", icon: "🧴" },
    { id: "powders", label: "Polvos", icon: "⚪" },
    { id: "liquids", label: "Líquidos", icon: "🧪" },
    { id: "meds", label: "Insecticidas/Medicinas", icon: "💊" },
    { id: "others", label: "Otros", icon: "📦" },
  ];

  const handleAddItem = () => {
    openModal("add-item");
  };

  const getSortedItems = (catId: InventoryCategory) => {
    const items = [...(inventory[catId] || [])];
    if (sortBy === "name") {
      return items.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      return items.sort((a, b) => b.qty - a.qty);
    }
  };

  const handleRemove = (cat: InventoryCategory, name: string) => {
    openModal("confirm", {
      title: "¿Eliminar insumo?",
      message: "Se quitará del inventario.",
      onConfirm: () => removeInventoryItem(cat, name)
    });
  };

  return (
    <section id="tab-inventory" className="tab-content active">
      <div className="view-header">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-bold m-0 text-[var(--primary)]">📦 Inventario</h2>
          <div className="sort-group flex bg-[var(--black-soft)] p-1 rounded-xl gap-1">
            <button 
              className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg transition-all ${sortBy === 'name' ? 'bg-[var(--white)] text-[var(--primary)] shadow-sm' : 'text-[var(--text-gray)] hover:text-[var(--primary)]'}`} 
              onClick={() => setSortBy('name')}
            >
              🏷️ Nombre
            </button>
            <button 
              className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg transition-all ${sortBy === 'qty' ? 'bg-[var(--white)] text-[var(--primary)] shadow-sm' : 'text-[var(--text-gray)] hover:text-[var(--primary)]'}`} 
              onClick={() => setSortBy('qty')}
            >
              🔢 Cantidad
            </button>
          </div>
        </div>
        <button className="btn-primary h-9 min-h-[36px] px-4 text-xs font-bold uppercase tracking-widest" onClick={handleAddItem}>+ Añadir</button>
      </div>
      <div className="inventory-sections grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map(cat => (
          <div key={cat.id} className="inventory-card bg-[var(--card-bg)] p-8 rounded-[2.5rem] shadow-xl border border-[var(--border-light)]">
            <h3 className="text-[var(--primary)] mb-6 flex items-center gap-3 text-lg">
              <span className="text-2xl">{cat.icon}</span> {cat.label}
            </h3>
            <ul className="flex flex-col gap-3 p-0 m-0 list-none">
              {inventory[cat.id]?.length === 0 && (
                <p className="text-[0.9rem] text-[var(--text-gray)] text-center py-8 italic opacity-50">Vacío.</p>
              )}
              {getSortedItems(cat.id).map((item, index) => (
                <li key={`${item.name}-${index}`} className="inventory-item bg-[var(--primary)]/[0.05] hover:bg-[var(--primary)]/[0.08] border border-[var(--primary)]/10 transition-all py-3 px-4 rounded-[1.5rem] shadow-sm flex items-center justify-between gap-4">
                   {/* Izquierda: Info Principal */}
                   <div className="flex items-center gap-4 min-w-0 flex-1">
                      <button className="text-2xl p-0 hover:scale-125 transition-transform shrink-0" title="Reponer" onClick={() => openModal('calendar', { title: `Reponer: ${item.name}`, desc: `Cantidad actual: ${item.qty} ${item.unit}` })}>📅</button>
                      <strong className="text-[var(--text)] text-[0.95rem] truncate" title={item.name}>📦 {item.name}</strong>
                   </div>

                   {/* Centro/Derecha: Controles y Cantidad */}
                   <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center bg-[var(--card-bg)] rounded-xl border border-[var(--primary)]/10 p-1 shadow-sm">
                          <button className="w-8 h-8 flex items-center justify-center hover:text-[var(--primary)] transition-colors active:scale-75" onClick={() => updateItemQty(cat.id, item.name, -1)}>-</button>
                          <span className="text-[0.75rem] uppercase px-3 text-[var(--primary)] min-w-[70px] text-center">
                            {item.qty} {item.unit}
                          </span>
                          <button className="w-8 h-8 flex items-center justify-center hover:text-[var(--primary)] transition-colors active:scale-75" onClick={() => updateItemQty(cat.id, item.name, 1)}>+</button>
                      </div>

                      <div className="flex items-center gap-1 border-l border-[var(--border)] pl-4">
                        <button className="p-2 hover:bg-[var(--card-bg)] rounded-xl transition-all active:scale-90 opacity-60 hover:opacity-100 shadow-sm" onClick={() => openModal('edit-item', { ...item, cat: cat.id, index })}>✏️</button>
                        <button className="p-2 text-[var(--danger)] hover:bg-[var(--danger-bg-light)] rounded-xl transition-all active:scale-90 opacity-60 hover:opacity-100 shadow-sm" onClick={() => handleRemove(cat.id, item.name)}>🗑️</button>
                      </div>
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
