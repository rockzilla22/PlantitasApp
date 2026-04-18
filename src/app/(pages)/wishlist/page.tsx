"use client";

import { useStore } from "@nanostores/react";
import { $store, removeWish } from "@/store/plantStore";
import { openModal } from "@/store/modalStore";
import { useState, useMemo } from "react";

export default function WishlistPage() {
  const { wishlist } = useStore($store);
  const [priorityFilter, setPriorityFilter] = useState("Todas");

  const filteredWishlist = useMemo(() => {
    return wishlist.filter(item => {
      const matchesPriority = priorityFilter === "Todas" || item.priority === priorityFilter;
      return matchesPriority;
    });
  }, [wishlist, priorityFilter]);

  const handleAddWish = () => {
    openModal("add-wish");
  };

  return (
    <section id="tab-wishlist" className="tab-content active">
      <div className="view-header">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg min-[820px]:text-xl font-bold m-0 text-[var(--primary)]">✨ Deseos</h2>
          <div className="sort-group flex bg-black/5 p-1 rounded-xl gap-1">
            {["Todas", "Alta", "Media", "Baja"].map(p => (
              <button
                key={p}
                className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg transition-all ${
                  priorityFilter === p 
                    ? 'bg-white text-[var(--primary)] shadow-sm' 
                    : 'text-[var(--text-gray)] hover:text-[var(--primary)]'
                }`}
                onClick={() => setPriorityFilter(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <button 
          className="btn-primary h-9 min-h-[36px] px-4 text-xs font-bold" 
          onClick={handleAddWish}
        >
          + Añadir
        </button>
      </div>

      <div id="wishlist-container" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4 w-full">
        {filteredWishlist.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[var(--text-gray)]">
            <p>{wishlist.length === 0 ? "No hay deseos registrados." : "No hay coincidencias."}</p>
          </div>
        ) : (
          filteredWishlist.map(item => {
            const { name = "Sin nombre", priority = "Media", notes = "", id } = item;
            return (
              <div key={id} className="card wish-card !min-h-fit !h-auto flex flex-col p-5 bg-white rounded-3xl border border-[var(--border)] shadow-sm">
                {/* TOP: Nombre y Badge */}
                <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="m-0 text-[1.1rem] leading-tight font-black text-gray-900 break-words flex-1">
                      ✨ {name}
                    </h3>
                    <span className={`badge shrink-0 ${priority === 'Alta' ? 'badge-danger' : 'badge-warning'}`}>
                      {priority}
                    </span>
                </div>

                {/* BODY: Notas */}
                <div className="flex-1 mb-6 min-h-[40px]">
                  <p className="m-0 text-sm text-[var(--text-gray)] leading-relaxed break-words whitespace-pre-wrap">
                    📝 {notes || 'Sin notas'}
                  </p>
                </div>

                {/* ACTIONS: Footer de la card */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <button 
                      className="btn-primary h-9 min-h-[36px] px-4 text-xs font-bold" 
                      onClick={() => removeWish(id)}
                    >
                      💸 ¡Listo!
                    </button>
                    <div className="flex gap-1">
                      <button className="p-2 text-xl hover:scale-110 transition-transform" onClick={() => openModal('calendar', { title: `Comprar: ${name}`, desc: `Prioridad: ${priority}. Notas: ${notes}` })}>📅</button>
                      <button className="p-2 text-base hover:scale-110 transition-transform" onClick={() => openModal('edit-wish', item)}>✏️</button>
                      <button className="p-2 text-base text-[var(--danger)] hover:scale-110 transition-transform" onClick={() => {
                        openModal("confirm", {
                          title: "¿Eliminar deseo?",
                          message: "Se quitará de la lista.",
                          onConfirm: () => removeWish(id)
                        });
                      }}>🗑️</button>
                    </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
