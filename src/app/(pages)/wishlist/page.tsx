"use client";

import { useStore } from "@nanostores/react";
import { $store, removeWish, checkCapLimit } from "@/store/plantStore";
import { openModal } from "@/store/modalStore";
import { useState, useMemo } from "react";
import Image from "next/image";

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
    if (checkCapLimit()) openModal("add-wish");
  };

  return (
    <section id="tab-wishlist" className="tab-content active">
      {/* Titular y botón de agregar */}
      <div className="view-header">
        <h2 className="text-[var(--primary)] font-bold">Lista de Deseos</h2>
        <button className="btn-primary h-9 min-h-[36px] px-4 text-xs font-bold" onClick={handleAddWish}>
          + Añadir
        </button>
      </div>

      {/* Filtros de prioridad */}
      <div className="flex registros-center gap-3 flex-wrap mb-6">
        <div className="group flex bg-[var(--black-soft)] p-1.5 rounded-2xl gap-1.5 shadow-sm">
          {["Todas", "Alta", "Media", "Baja"].map((p) => (
            <button
              key={p}
              className={`px-4 py-2 text-[0.8rem] font-bold rounded-xl min-w-[50px] min-h-[32px] transition-all ${
                priorityFilter === p
                  ? "bg-[var(--white)] text-[var(--primary)] shadow-sm"
                  : "text-[var(--text-brown)] hover:text-[var(--primary)] hover:bg-[var(--white-soft)]"
              }`}
              onClick={() => setPriorityFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Contenedor de deseos: Grid responsive con estados vacíos */}
      <div id="wishlist-container" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6 w-full px-1">
        {filteredWishlist.length === 0 ? (
          <div className="col-span-full py-20 text-center text-[var(--text-brown)] italic border-2 border-dashed border-[var(--border-light)] rounded-[2.5rem]">
            {wishlist.length === 0 ? "No hay deseos registrados." : "No hay coincidencias."}
          </div>
        ) : (
          filteredWishlist.map((item) => {
            const { name = "Sin nombre", priority = "Media", notes = "", id } = item;
            return (
              <div
                key={id}
                className="card wish-card !min-h-fit !h-auto flex flex-col p-8 bg-[var(--card-bg)] rounded-[2.5rem] shadow-md hover:shadow-lg transition-all group overflow-hidden gap-y-10"
                style={{
                  borderTop: `5px solid ${priority === "Alta" ? "var(--danger)" : priority === "Media" ? "var(--secondary)" : "var(--primary-light)"}`,
                }}
              >
                {/* HEADER: Grid 2 columnas estilo Nursery */}
                <div className="grid grid-cols-[1fr_auto] gap-4 registros-start">
                  <div className="flex flex-col gap-y-2 min-w-0">
                    <h3 className="text-[var(--primary)] flex registros-center gap-3 text-lg font-bold">
                      <Image src="/icons/common/stars.svg" alt="" width={24} height={24} /> {name}
                    </h3>
                  </div>
                  <div className="flex flex-col registros-end gap-y-2">
                    <span
                      className={`badge shrink-0 inline-flex registros-center gap-1 ${priority === "Alta" ? "badge-danger" : priority === "Media" ? "badge-warning" : "badge-primary"}`}
                    >
                      <Image
                        src={`/icons/common/prio_${priority === "Alta" ? 1 : priority === "Media" ? 2 : 3}.svg`}
                        alt=""
                        width={10}
                        height={10}
                      />
                      {priority}
                    </span>
                  </div>
                </div>

                {/* BODY: Notas con borde superior sutil */}
                <div className="flex-1 border-t border-[var(--border-light)]">
                  <p className="text-sm text-[var(--text-brown)] leading-relaxed italic break-words whitespace-pre-wrap">
                    {notes || "Sin notas adicionales."}
                  </p>
                </div>

                {/* FOOTER: Acciones con separador */}
                <div className="flex registros-center justify-between border-t border-[var(--border-light)] mt-auto text-[var(--footer-bg)]">
                  <button className="btn-primary h-8 min-h-[32px] px-4 text-[0.7rem] font-black" onClick={() => removeWish(id)}>
                    ¡Comprado!
                  </button>
                  <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-2 hover:scale-110 transition-transform"
                      onClick={() => openModal("calendar", { title: `Comprar: ${name}`, desc: `Prioridad: ${priority}. Notas: ${notes}` })}
                    >
                      <Image src="/icons/common/calendar.svg" alt="Recordatorio" width={20} height={20} />
                    </button>
                    <button className="p-2 hover:scale-110 transition-transform" onClick={() => openModal("edit-wish", item)}>
                      <Image src="/icons/common/pencil.svg" alt="Editar" width={18} height={18} />
                    </button>
                    <button
                      className="p-2 hover:scale-110 transition-transform"
                      onClick={() => {
                        openModal("confirm", {
                          title: "¿Eliminar deseo?",
                          message: "Se quitará de la lista.",
                          onConfirm: () => removeWish(id),
                        });
                      }}
                    >
                      <Image src="/icons/common/trash.svg" alt="Eliminar" width={18} height={18} />
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
