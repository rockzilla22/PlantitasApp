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

  const handleRemove = (cat: InventoryCategory, index: number) => {
    openModal("confirm", {
      title: "¿Eliminar insumo?",
      message: "Se quitará del inventario.",
      onConfirm: () => removeInventoryItem(cat, index)
    });
  };

  return (
    <section id="tab-inventory" className="tab-content active">
      <div className="view-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>📦 Inventario</h2>
          <div className="sort-group" style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', padding: '3px', borderRadius: '10px', gap: '2px' }}>
            <button 
              className={`btn-text ${sortBy === 'name' ? 'active' : ''}`} 
              style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '7px', background: sortBy === 'name' ? 'white' : 'transparent', color: sortBy === 'name' ? 'var(--primary)' : 'var(--text-gray)', boxShadow: sortBy === 'name' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}
              onClick={() => setSortBy('name')}
            >
              🏷️ Nombre
            </button>
            <button 
              className={`btn-text ${sortBy === 'qty' ? 'active' : ''}`} 
              style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '7px', background: sortBy === 'qty' ? 'white' : 'transparent', color: sortBy === 'qty' ? 'var(--primary)' : 'var(--text-gray)', boxShadow: sortBy === 'qty' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}
              onClick={() => setSortBy('qty')}
            >
              🔢 Cantidad
            </button>
          </div>
        </div>
        <button className="btn-primary" style={{ minHeight: '38px', height: '38px', padding: '0 12px', fontSize: '0.85rem' }} onClick={handleAddItem}>+ Añadir</button>
      </div>
      <div className="inventory-sections">
        {categories.map(cat => (
          <div key={cat.id} className="inventory-card">
            <h3>{cat.icon} {cat.label}</h3>
            <ul id={`list-${cat.id}`}>
              {inventory[cat.id]?.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', textAlign: 'center' }}>Vacío.</p>
              )}
              {getSortedItems(cat.id).map((item, index) => (
                <li key={`${item.name}-${index}`} className="inventory-item border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors py-4 px-2 first:pt-2 last:pb-2">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <button className="text-xl p-0 hover:scale-110 transition-transform" onClick={() => openModal('calendar', { title: `Reponer: ${item.name}`, desc: `Cantidad actual: ${item.qty} ${item.unit}` })}>📅</button>
                        <strong className="text-zinc-800 font-bold">📦 {item.name}</strong>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-zinc-100 rounded-lg transition-colors" onClick={() => openModal('edit-item', { ...item, cat: cat.id, index })}>✏️</button>
                        <button className="p-1 text-[var(--danger)] hover:bg-red-50 rounded-lg transition-colors" onClick={() => handleRemove(cat.id, index)}>🗑️</button>
                      </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-medium text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">🧪 {item.qty} {item.unit}</span>
                      <div className="flex gap-1">
                          <button className="w-8 h-8 flex items-center justify-center bg-white border border-zinc-200 rounded-lg font-black hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all" onClick={() => updateItemQty(cat.id, index, -1)}>-</button>
                          <button className="w-8 h-8 flex items-center justify-center bg-white border border-zinc-200 rounded-lg font-black hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all" onClick={() => updateItemQty(cat.id, index, 1)}>+</button>
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
