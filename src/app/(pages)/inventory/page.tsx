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
                <li key={`${item.name}-${index}`} className="inventory-item">
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button className="btn-text" style={{ fontSize: '1.1rem', padding: 0 }} onClick={() => openModal('calendar', { title: `Reponer: ${item.name}`, desc: `Cantidad actual: ${item.qty} ${item.unit}` })}>📅</button>
                        <strong>📦 {item.name}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-text" style={{ padding: 0 }} onClick={() => openModal('edit-item', { ...item, cat: cat.id, index })}>✏️</button>
                        <button className="btn-text" style={{ color: 'var(--danger)', padding: 0 }} onClick={() => handleRemove(cat.id, index)}>🗑️</button>
                      </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.3rem' }}>
                      <span>🧪 {item.qty} {item.unit}</span>
                      <div>
                          <button className="btn-backup" onClick={() => updateItemQty(cat.id, index, -1)}>-</button>
                          <button className="btn-backup" onClick={() => updateItemQty(cat.id, index, 1)}>+</button>
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
