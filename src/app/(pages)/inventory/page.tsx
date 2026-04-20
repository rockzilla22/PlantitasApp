"use client";

import { useStore } from "@nanostores/react";
import { $store, updateItemQty, removeInventoryItem, checkCapLimit } from "@/store/plantStore";
import { InventoryCategory } from "@/core/inventory/domain/InventoryItem";
import { openModal } from "@/store/modalStore";
import { useState } from "react";
import Image from "next/image";
import { INVENTORY_CATEGORIES } from "@/data/catalog";

export default function InventoryPage() {
  const { inventory } = useStore($store);
  const [sortBy, setSortBy] = useState<"name" | "qty">("name");

  const categories = INVENTORY_CATEGORIES;

  const handleAddItem = () => {
    if (checkCapLimit()) openModal("add-item");
  };

  const getSortedItems = (catId: InventoryCategory) => {
    const registros = [...(inventory[catId] || [])];
    if (sortBy === "name") {
      return registros.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      return registros.sort((a, b) => b.qty - a.qty);
    }
  };

  const handleRemove = (cat: InventoryCategory, name: string) => {
    openModal("confirm", {
      title: "¿Eliminar insumo?",
      message: "Se quitará del inventario.",
      onConfirm: () => removeInventoryItem(cat, name),
    });
  };

  return (
    <section id="tab-inventory" className="tab-content active">
      <div className="view-header">
        <h2 className="text-[var(--primary)] font-bold">Inventario</h2>
        <button className="btn-primary h-9 min-h-[36px] px-4 text-xs font-bold uppercase tracking-widest" onClick={handleAddItem}>
          + Añadir
        </button>
      </div>
      <div className="flex registros-center gap-3 flex-wrap mb-6">
        <div className="sort-group flex bg-[var(--black-soft)] p-1 rounded-xl gap-1">
          <button
            className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg transition-all ${sortBy === "name" ? "bg-[var(--white)] text-[var(--primary)] shadow-sm" : "text-[var(--text-gray)] hover:text-[var(--primary)]"}`}
            onClick={() => setSortBy("name")}
          >
            Nombre
          </button>
          <button
            className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg transition-all ${sortBy === "qty" ? "bg-[var(--white)] text-[var(--primary)] shadow-sm" : "text-[var(--text-gray)] hover:text-[var(--primary)]"}`}
            onClick={() => setSortBy("qty")}
          >
            Cantidad
          </button>
        </div>
      </div>
      <div className="inventory-sections grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((cat) => (
          <div
            key={cat.value}
            className="inventory-card bg-[var(--card-bg)] p-8 rounded-[2.5rem] shadow-xl border border-[var(--border-light)]"
          >
            <h3 className="text-[var(--primary)] mb-6 flex registros-center gap-3 text-lg font-bold">
              {cat.img ? (
                <Image src={cat.img} alt={cat.label} width={32} height={32} className="object-contain" />
              ) : (
                <Image src="/icons/environment/inventory/box.svg" alt="" width={32} height={32} className="object-contain" />
              )}
              {cat.label}
            </h3>
            <ul className="flex flex-col gap-3 p-0 m-0 list-none">
              {inventory[cat.value as InventoryCategory]?.length === 0 && (
                <p className="text-[0.9rem] text-[var(--text-gray)] text-center py-8 italic opacity-50">Vacío.</p>
              )}
              {getSortedItems(cat.value as InventoryCategory).map((item, index) => (
                <li
                  key={`${item.name}-${index}`}
                  className="inventory-item bg-[var(--input-bg)] hover:bg-[var(--primary)]/[0.08] border border-[var(--primary)]/10 transition-all py-3 px-4 rounded-[1.5rem] shadow-sm flex registros-center justify-between gap-4"
                >
                  {/* Izquierda: Info Principal */}
                  <div className="flex registros-center gap-4 min-w-0 flex-1">
                    <button
                      className="text-2xl p-0 hover:scale-125 transition-transform shrink-0"
                      title="Reponer"
                      onClick={() =>
                        openModal("calendar", { title: `Reponer: ${item.name}`, desc: `Cantidad actual: ${item.qty} ${item.unit}` })
                      }
                    >
                      <Image src="/icons/common/calendar.svg" alt="Reponer" width={22} height={22} />
                    </button>
                    <strong className="text-[var(--text-brown)] font-semibold text-[0.95rem] truncate" title={item.name}>
                      {item.name}
                    </strong>
                  </div>

                  {/* Centro/Derecha: Controles y Cantidad */}
                  <div className="flex registros-center gap-4 shrink-0">
                    <div className="flex registros-center p-1">
                      <button
                        className="w-8 h-8 flex registros-center justify-center hover:text-[var(--primary)] hover:bg-[var(--input-bg)] rounded-xl transition-colors active:scale-75"
                        onClick={() => updateItemQty(cat.value as InventoryCategory, item.name, -1)}
                      >
                        -
                      </button>
                      <span className="text-[0.8rem] font-semibold uppercase px-3 text-[var(--primary)] min-w-[70px] text-center">
                        {item.qty} {item.unit}
                      </span>
                      <button
                        className="w-8 h-8 flex registros-center justify-center hover:text-[var(--primary)] hover:bg-[var(--input-bg)] rounded-xl transition-colors active:scale-75"
                        onClick={() => updateItemQty(cat.value as InventoryCategory, item.name, 1)}
                      >
                        +
                      </button>
                    </div>

                    <div className="flex registros-center gap-1 pl-4">
                      <button
                        className="p-2 hover:bg-[var(--input-bg)] rounded-xl transition-all active:scale-90 opacity-60 hover:opacity-100 "
                        onClick={() => openModal("edit-item", { ...item, cat: cat.value as InventoryCategory, index })}
                      >
                        <Image src="/icons/common/pencil.svg" alt="Editar" width={18} height={18} />
                      </button>
                      <button
                        className="p-2 hover:text-[var(--primary)] hover:bg-[var(--input-bg)] rounded-xl transition-all active:scale-90 opacity-60 hover:opacity-100"
                        onClick={() => handleRemove(cat.value as InventoryCategory, item.name)}
                      >
                        <Image src="/icons/common/trash.svg" alt="Eliminar" width={18} height={18} />
                      </button>
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
