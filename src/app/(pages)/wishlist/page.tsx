"use client";

import { useStore } from "@nanostores/react";
import { $store, removeWish } from "@/store/plantStore";
import { openModal } from "@/store/modalStore";
import { useState, useMemo } from "react";

export default function WishlistPage() {
  const { wishlist } = useStore($store);
  const [priorityFilter, setPriorityFilter] = useState("Todas");

  const filteredWishlist = useMemo(() => {
    return wishlist.filter((item) => {
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
          <h2 className="text-xl font-bold m-0">✨ Lista de Deseos</h2>
          <div className="sort-group flex bg-black/5 p-1 rounded-xl gap-1">
            {["Todas", "Alta", "Media", "Baja"].map((p) => (
              <button
                key={p}
                className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg transition-all ${
                  priorityFilter === p ? "bg-white text-[var(--primary)] shadow-sm" : "text-[var(--text-gray)] hover:text-[var(--primary)]"
                }`}
                onClick={() => setPriorityFilter(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <button className="btn-primary h-9 min-h-[36px] px-4 text-xs font-bold" onClick={handleAddWish}>
          + Añadir Deseo
        </button>
      </div>

      <div id="wishlist-container" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6 w-full px-1">
        {filteredWishlist.length === 0 ? (
          <div className="col-span-full py-20 text-center text-[var(--text-gray)] italic">
            {wishlist.length === 0 ? "No hay deseos registrados." : "No hay coincidencias."}
          </div>
        ) : (
          filteredWishlist.map((item) => {
            const { name = "Sin nombre", priority = "Media", notes = "", id } = item;
            return (
              <div
                key={id}
                className="card wish-card !min-h-fit !h-auto flex flex-col p-5 bg-white rounded-[2rem] shadow-md hover:shadow-lg transition-all group overflow-hidden gap-y-6"
                style={{
                  borderTop: `5px solid ${priority === "Alta" ? "var(--danger)" : priority === "Media" ? "var(--secondary)" : "var(--primary-light)"}`,
                }}
              >
                {/* HEADER: Grid 2 columnas estilo Nursery */}
                <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
                  <div className="flex flex-col gap-y-2 min-w-0">
                    <h4 className="m-0 text-base font-black text-zinc-800 leading-tight">✨ {name}</h4>
                  </div>
                  <div className="flex flex-col items-end gap-y-2">
                    <span className={`badge shrink-0 ${priority === "Alta" ? "badge-danger" : "badge-warning"}`}>{priority}</span>
                  </div>
                </div>

                {/* BODY: Notas con borde superior sutil */}
                <div className="flex-1 pt-8">
                  <p className="m-0 text-sm text-[var(--text-gray)] leading-relaxed italic opacity-80 break-words whitespace-pre-wrap">
                    📝 {notes || "Sin notas adicionales."}
                  </p>
                </div>

                {/* FOOTER: Acciones con separador */}
                <div className="flex items-center justify-between pt-8 mt-auto">
                  <button className="btn-primary h-6 text-base font-black" onClick={() => removeWish(id)}>
                    💸 ¡Comprado!
                  </button>
                  <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-2 text-xl hover:scale-110 transition-transform"
                      onClick={() => openModal("calendar", { title: `Comprar: ${name}`, desc: `Prioridad: ${priority}. Notas: ${notes}` })}
                    >
                      📅
                    </button>
                    <button className="p-2 text-base hover:scale-110 transition-transform" onClick={() => openModal("edit-wish", item)}>
                      ✏️
                    </button>
                    <button
                      className="p-2 text-base text-[var(--danger)] hover:scale-110 transition-transform"
                      onClick={() => {
                        openModal("confirm", {
                          title: "¿Eliminar deseo?",
                          message: "Se quitará de la lista.",
                          onConfirm: () => removeWish(id),
                        });
                      }}
                    >
                      🗑️
                    </button>
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
