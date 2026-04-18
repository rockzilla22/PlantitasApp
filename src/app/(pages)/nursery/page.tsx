"use client";

import { useStore } from "@nanostores/react";
import { $store, removeProp, updatePropStatus } from "@/store/plantStore";
import { useState } from "react";
import { openModal } from "@/store/modalStore";

export default function NurseryPage() {
  const { propagations, plants } = useStore($store);
  const [filter, setFilter] = useState("TODOS");

  const handleAddProp = () => {
    openModal("add-prop");
  };

  const getMethodIcon = (method: string) => {
    const icons: Record<string, string> = { Agua: "💧", Sustrato: "🟤", Acodo: "🌳", Semilla: "🌱" };
    return icons[method] || "🧪";
  };

  const formatDate = (dateStr: string) => dateStr.split("-").reverse().join("/");

  const filteredList = propagations.filter((p) => filter === "TODOS" || p.status === filter);

  const handleGraduate = (prop: any) => {
    updatePropStatus(prop.id, "Trasplantada");
    const parentName = prop.parentId ? plants.find((p: any) => p.id === prop.parentId)?.name : null;
    openModal("add-plant", {
      initialName: parentName ? `Hija de ${parentName}` : `Hija de ${prop.name}`,
      propId: prop.id,
    });
  };

  const handleRemove = (id: number) => {
    openModal("confirm", {
      title: "¿Eliminar propagación?",
      message: "Esta acción es definitiva.",
      onConfirm: () => removeProp(id),
    });
  };

  return (
    <section id="tab-nursery" className="tab-content active">
      <div className="view-header">
        <h2 className="text-[var(--primary)] font-bold">Laboratorio de Propagación</h2>
        <button className="btn-primary" onClick={handleAddProp}>
          + Añadir
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap mb-6">
        <div className="sort-group flex bg-[var(--black-soft)] p-1 rounded-xl gap-1">
          <button
            className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg transition-all ${filter === "TODOS" ? "bg-[var(--white)] text-[var(--primary)] shadow-sm" : "text-[var(--text-gray)] hover:text-[var(--primary)]"}`}
            onClick={() => setFilter("TODOS")}
          >
            Todos
          </button>
          <button
            className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg transition-all ${filter === "Activo" ? "bg-[var(--white)] text-[var(--primary)] shadow-sm" : "text-[var(--text-gray)] hover:text-[var(--primary)]"}`}
            onClick={() => setFilter("Activo")}
          >
            ⌛ Activos
          </button>
          <button
            className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg transition-all  ${filter === "Éxito" ? "bg-[var(--white)] text-[var(--primary)] shadow-sm" : "text-[var(--text-gray)] hover:text-[var(--primary)]"}`}
            onClick={() => setFilter("Éxito")}
          >
            ✅ Éxito
          </button>
          <button
            className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg transition-all ${filter === "Trasplantada" ? "bg-[var(--white)] text-[var(--primary)] shadow-sm" : "text-[var(--text-gray)] hover:text-[var(--primary)]"}`}
            onClick={() => setFilter("Trasplantada")}
          >
            🌳 Trasplantadas
          </button>
          <button
            className={`px-3 py-1.5 text-[0.7rem] font-bold rounded-lg transition-all  ${filter === "Fracaso" ? "bg-[var(--white)] text-[var(--primary)] shadow-sm" : "text-[var(--text-gray)] hover:text-[var(--primary)]"}`}
            onClick={() => setFilter("Fracaso")}
          >
            ❌ Fallos
          </button>
        </div>
      </div>

      <div id="nursery-list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full px-1">
        {filteredList.length === 0 ? (
          <div className="col-span-full py-20 text-center text-[var(--text-gray)] italic border-2 border-dashed border-[var(--border-light)] rounded-[2rem]">
            No hay propagaciones registradas.
          </div>
        ) : (
          filteredList.map((prop) => {
            let badgeClass = "badge-warning";
            let icon = "⌛";
            if (prop.status === "Éxito") {
              badgeClass = "badge-success";
              icon = "✅";
            }
            if (prop.status === "Fracaso") {
              badgeClass = "badge-danger";
              icon = "❌";
            }
            if (prop.status === "Trasplantada") {
              badgeClass = "badge-info";
              icon = "🌳";
            }

            return (
              <div
                key={prop.id}
                className={`card !min-h-fit !h-auto flex flex-col p-8 bg-[var(--card-bg)] rounded-[2.5rem] border-[var(--border-light)] shadow-md hover:shadow-lg transition-all group overflow-hidden`}
                style={{
                  borderTop: `5px solid ${prop.status === "Éxito" ? "var(--primary)" : prop.status === "Fracaso" ? "var(--danger)" : prop.status === "Trasplantada" ? "var(--info)" : "var(--secondary)"}`,
                }}
              >
                {/* HEADER: Estilo Nursery Pro */}
                <div className="grid grid-cols-[1fr_auto] gap-3 items-start mb-4">
                  <div>
                    <h3 className="text-[var(--primary)] mb-6 flex items-center gap-3 text-lg font-bold">
                      <span className="text-2xl"> 🧪 </span> {prop.name}
                    </h3>
                    <small className="text-[0.65rem] font-bold text-[var(--text-gray)] uppercase tracking-widest opacity-60">
                      {getMethodIcon(prop.method)} {prop.method}
                    </small>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`badge ${badgeClass} !text-[0.6rem] !px-2`}>
                      {icon} {prop.status}
                    </span>
                    <small className="text-[0.6rem] font-bold text-[var(--text-gray)] opacity-40">📅 {formatDate(prop.startDate)}</small>
                  </div>
                </div>

                {/* BODY: Notas con borde superior sutil */}
                <div className="flex-1 mb-6 border-t border-[var(--border-light)] pt-3">
                  <p className="m-0 text-sm text-[var(--text-gray)] leading-relaxed italic opacity-80 break-words whitespace-pre-wrap">
                    📝 {prop.notes || "Sin notas del proceso."}
                  </p>
                </div>

                {/* FOOTER: Acciones */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)] mt-auto text-[var(--text-gray)]">
                  <div className="flex gap-2">
                    {prop.status === "Activo" ? (
                      <>
                        <button
                          className="btn-primary h-8 min-h-[32px] px-3 text-[0.7rem] font-black"
                          onClick={() => updatePropStatus(prop.id, "Éxito")}
                        >
                          ✅ Logrado
                        </button>
                        <button
                          className="btn-text h-8 min-h-[32px] text-[var(--danger)] text-[0.7rem] hover:bg-[var(--danger-bg-light)] rounded-xl px-2 transition-colors"
                          onClick={() => updatePropStatus(prop.id, "Fracaso")}
                        >
                          ❌ Falló
                        </button>
                      </>
                    ) : prop.status === "Éxito" ? (
                      <button
                        className="btn-primary h-8 min-h-[32px] px-3 text-[0.7rem] bg-[var(--secondary)]"
                        onClick={() => handleGraduate(prop)}
                      >
                        🪴 Graduar
                      </button>
                    ) : null}
                  </div>
                  <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-2 text-xl hover:scale-110 transition-transform"
                      title="Recordatorio"
                      onClick={() =>
                        openModal("calendar", { title: `Chequear: ${prop.name}`, desc: `Método: ${prop.method}. Notas: ${prop.notes}` })
                      }
                    >
                      📅
                    </button>
                    <button
                      className="p-2 text-base hover:scale-110 transition-transform"
                      title="Editar"
                      onClick={() => openModal("edit-prop", prop)}
                    >
                      ✏️
                    </button>
                    <button
                      className="p-2 text-base text-[var(--danger)] hover:scale-110 transition-transform"
                      title="Borrar"
                      onClick={() => handleRemove(prop.id)}
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
