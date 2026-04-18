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
        <h2>Laboratorio de Propagación</h2>
        <button className="btn-primary" onClick={handleAddProp}>
          Nueva Propagación
        </button>
      </div>
      <div className="filter-bar" style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button className={`btn-backup ${filter === "TODOS" ? "active" : ""}`} onClick={() => setFilter("TODOS")}>
          Todos
        </button>
        <button className={`btn-backup ${filter === "Activo" ? "active" : ""}`} onClick={() => setFilter("Activo")}>
          ⌛ Activos
        </button>
        <button className={`btn-backup ${filter === "Éxito" ? "active" : ""}`} onClick={() => setFilter("Éxito")}>
          ✅ Éxito
        </button>
        <button className={`btn-backup ${filter === "Trasplantada" ? "active" : ""}`} onClick={() => setFilter("Trasplantada")}>
          🌳 Trasplantadas
        </button>
        <button className={`btn-backup ${filter === "Fracaso" ? "active" : ""}`} onClick={() => setFilter("Fracaso")}>
          ❌ Fallos
        </button>
      </div>
      <div id="nursery-list" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full px-1">
        {filteredList.length === 0 ? (
          <div className="col-span-full py-20 text-center text-zinc-400 italic border-2 border-dashed border-zinc-100 rounded-[2rem]">
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
                className={`card !min-h-fit !h-auto flex flex-col bg-[var(--card-bg)] rounded-[2.5rem] border transition-all cursor-pointer group shadow-md hover:shadow-lg overflow-hidden gap-y-6`}
                style={{
                  borderTop: `5px solid ${prop.status === "Éxito" ? "var(--primary)" : prop.status === "Fracaso" ? "var(--danger)" : prop.status === "Trasplantada" ? "var(--info)" : "var(--secondary)"}`,
                }}
              >
                {/* HEADER: Estilo Nursery Pro */}
                <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
                  <div className="flex flex-col gap-y-2 min-w-0">
                    <h4 className="text-base font-black text-zinc-800 leading-tight truncate w-[140px]">🧪 {prop.name}</h4>
                    <br />
                    <small className="text-[0.7rem] font-bold text-zinc-400 uppercase tracking-widest gap-5">
                      {getMethodIcon(prop.method)} {prop.method}
                    </small>
                  </div>
                  <div className="flex flex-col items-end gap-y-2 shrink-0">
                    <span className={`badge ${badgeClass} !text-[0.7rem] !px-2`}>
                      {icon} {prop.status}
                    </span>
                    <br />
                    <small className="text-[0.7rem] font-bold text-zinc-400">📅 {formatDate(prop.startDate)}</small>
                  </div>
                </div>

                {/* BODY: Notas con borde superior sutil */}
                <div className="flex-1 border-t border-zinc-50">
                  <p className="text-sm text-[var(--text-gray)] leading-relaxed italic opacity-80 break-words whitespace-pre-wrap">
                    📝 {prop.notes || "Sin notas del proceso."}
                  </p>
                </div>

                {/* FOOTER: Acciones */}
                <div className="flex items-center justify-between border-t border-zinc-50">
                  <div className="flex">
                    {prop.status === "Activo" ? (
                      <>
                        <button
                          className="btn-primary h-8 min-h-[32px] px-3 text-[0.7rem] font-black"
                          onClick={() => updatePropStatus(prop.id, "Éxito")}
                        >
                          ✅ Logrado
                        </button>
                        <button
                          className="btn-text h-8 min-h-[32px] text-[var(--danger)] text-[0.7rem] font-black hover:bg-red-50 rounded-xl px-2"
                          onClick={() => updatePropStatus(prop.id, "Fracaso")}
                        >
                          ❌ Falló
                        </button>
                      </>
                    ) : prop.status === "Éxito" ? (
                      <button
                        className="btn-primary h-8 min-h-[32px] px-3 text-[0.7rem] font-black bg-[var(--secondary)]"
                        onClick={() => handleGraduate(prop)}
                      >
                        Plantar
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
