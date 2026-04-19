"use client";

import { useState, useEffect } from "react";
import { $resizerWidth } from "@/store/uiStore";
import { $store, $selectedPlantId, addPlantLog, removePlantLog, removePlant, updatePlantLog } from "@/store/plantStore";
import { useStore } from "@nanostores/react";
import { openModal } from "@/store/modalStore";
import Image from "next/image";
import { LOG_ACTIONS, LOG_ACTION_ICON_BY_VALUE, LOG_ACTION_INVENTORY_CATEGORY_BY_VALUE, PLANT_TYPES } from "@/data/catalog";

export function PlantDetailPanel() {
  const resizerWidth = useStore($resizerWidth);
  const selectedId = useStore($selectedPlantId);
  const { plants, inventory } = useStore($store);
  const [isWideLayout, setIsWideLayout] = useState(true);

  const [logAction, setLogAction] = useState("Riego");
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [logDetail, setLogDetail] = useState("");
  const [inventoryItem, setInventoryItem] = useState("");
  const [logFilter, setLogFilter] = useState("Todos");
  const [logSortOrder, setLogSortOrder] = useState<"desc" | "asc">("desc");

  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [editLogDate, setEditLogDate] = useState("");
  const [editLogAction, setEditLogAction] = useState("");
  const [editLogDetail, setEditLogDetail] = useState("");

  const plant = plants.find((p) => p.id === selectedId);

  useEffect(() => {
    const syncLayout = () => {
      setIsWideLayout(window.innerWidth >= 820);
    };

    syncLayout();
    window.addEventListener("resize", syncLayout);
    return () => window.removeEventListener("resize", syncLayout);
  }, []);

  // Hook 14: useEffect
  useEffect(() => {
    if (!plant) return;

    const category = LOG_ACTION_INVENTORY_CATEGORY_BY_VALUE[logAction] as keyof typeof inventory | undefined;
    const items = category ? inventory[category] : [];

    if (category && items.length === 0) {
      openModal("confirm", {
        title: `¡Inventario de ${logAction} vacío!`,
        message: `No tenés ${logAction.toLowerCase()} cargados en el inventario. ¿Querés ir a añadir uno ahora?`,
        confirmText: "Ir al Inventario",
        confirmClass: "secondary",
        onConfirm: () => {
          window.location.href = "/inventory";
        },
      });
    }
  }, [plant, logAction, inventory]);

  if (!plant) {
    return (
      <aside id="plant-detail-panel" className="detail-panel" style={isWideLayout ? { width: `${resizerWidth}px` } : undefined}>
        <div className="empty-state">
          <p>Seleccioná una planta para ver su detalle profesional</p>
        </div>
      </aside>
    );
  }

  const plantTypeInfo = PLANT_TYPES.find((t) => t.value === plant.type);
  const isCustom = !plantTypeInfo || plant.type === "CUSTOM";
  const plantImg = plantTypeInfo?.img || "/icons/environment/plants/alocasia.svg";

  const inventoryCategory = LOG_ACTION_INVENTORY_CATEGORY_BY_VALUE[logAction] as keyof typeof inventory | undefined;

  const handleAddLog = () => {
    let detail = logDetail;
    if (inventoryItem) {
      detail = detail ? `[${inventoryItem}] ${detail}` : `Usado: ${inventoryItem}`;
    }
    if (!detail) detail = `Acción: ${logAction}`;

    addPlantLog(plant.id, {
      date: logDate,
      actionType: logAction as any,
      detail,
    });
    setLogDetail("");
    setInventoryItem("");
  };

  const handleStartEdit = (log: any) => {
    setEditingLogId(log.id);
    setEditLogDate(log.date);
    setEditLogAction(log.actionType);
    setEditLogDetail(log.detail);
  };

  const handleSaveEdit = () => {
    if (editingLogId === null) return;
    updatePlantLog(plant.id, editingLogId, {
      date: editLogDate,
      actionType: editLogAction as any,
      detail: editLogDetail,
    });
    setEditingLogId(null);
  };

  const handleDeletePlant = () => {
    openModal("confirm", {
      title: "¿Eliminar planta?",
      message: "Se borrarán todos sus registros de forma permanente.",
      onConfirm: () => removePlant(plant.id),
    });
  };

  const formatDate = (dateStr: string) => dateStr.split("-").reverse().join("/");

  return (
    <aside id="plant-detail-panel" className="detail-panel active" style={isWideLayout ? { width: `${resizerWidth}px` } : undefined}>
      {/* --- Name and Buttons --- */}
      <div className="text-[var(--primary)] text-xl font-bold flex flex-start justify-between">
        <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            {isCustom ? (
              <span className="text-2xl">{plant.icon}</span>
            ) : (
              <Image src={plantImg} alt={plant.type} width={40} height={40} className="object-contain" />
            )}
          </div>
          {plant.name}
        </h2>
        <div className="flex gap-1">
          {!isWideLayout && (
            <button className="icon-btn" onClick={() => $selectedPlantId.set(null)} title="Cerrar detalle">
              <img src="/icons/common/fail.svg" width={14} height={14} alt="Cerrar" className="object-contain" />
            </button>
          )}
          <button
            className="icon-btn"
            onClick={() => openModal("calendar", { title: `Cuidar: ${plant.name}`, desc: `Ubicación: ${plant.location}` })}
          >
            <Image src="/icons/common/calendar.svg" alt="Calendario" width={18} height={18} />
          </button>
          <button className="icon-btn" onClick={() => openModal("edit-plant", plant)}>
            <Image src="/icons/common/pencil.svg" alt="Editar" width={18} height={18} />
          </button>
          <button className="icon-btn icon-btn--danger" onClick={handleDeletePlant}>
            <Image src="/icons/common/trash.svg" alt="Eliminar" width={18} height={18} />
          </button>
        </div>
      </div>

      {/* --- Badge --- */}
      <div className="microclima-info py-2">
        <span className="microclima-tag">{plant.location}</span>
        <span className="microclima-tag"><Image src="/icons/environment/sun.svg" alt="" width={14} height={14} className="inline mr-1" />{plant.light}</span>
        <span className="microclima-tag">{plant.potType}</span>
        <span className="microclima-tag"><Image src="/icons/common/sleep.svg" alt="" width={14} height={14} className="inline mr-1" />{plant.dormancy}</span>
      </div>

      {/* --- Registro --- */}
      <div
        className="log-section"
        style={{ background: "var(--bg-faint)", padding: "1rem", borderRadius: "var(--radius)", marginTop: "1rem" }}
      >
        <h3 className="text-[var(--text-brown)] text-xl font-bold mb-3">Registro</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <select
            value={logAction}
            onChange={(e) => {
              setLogAction(e.target.value);
              setInventoryItem("");
            }}
          >
            {LOG_ACTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
        </div>

        {inventoryCategory && inventory[inventoryCategory].length > 0 && (
          <div style={{ marginTop: "0.5rem" }}>
            <select style={{ width: "100%" }} value={inventoryItem} onChange={(e) => setInventoryItem(e.target.value)}>
              <option value="">-- Elegir de Inventario --</option>
              {inventory[inventoryCategory].map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name} ({item.qty} {item.unit})
                </option>
              ))}
            </select>
          </div>
        )}

        <input
          type="text"
          placeholder="Detalle..."
          style={{ marginTop: "0.5rem" }}
          value={logDetail}
          onChange={(e) => setLogDetail(e.target.value)}
        />
        <button className="btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} onClick={handleAddLog}>
          Guardar
        </button>
      </div>

      {/* --- Historial de Logs --- */}
      <div className="log-list" style={{ marginTop: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <h3 className="text-[var(--text-brown)] text-xl font-bold">Historial</h3>
          <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
            <small style={{ fontSize: "0.7rem", color: "var(--text-gray)", marginRight: "0.25rem" }}>Ordenar:</small>
            <button
              className="btn-text"
              style={{ padding: "2px 4px", borderRadius: "4px", background: logSortOrder === "desc" ? "var(--border)" : "transparent" }}
              onClick={() => setLogSortOrder("desc")}
              title="Más reciente primero"
            >
              <Image src="/icons/common/sort-down.svg" alt="Reciente" width={16} height={16} />
            </button>
            <button
              className="btn-text"
              style={{ padding: "2px 4px", borderRadius: "4px", background: logSortOrder === "asc" ? "var(--border)" : "transparent" }}
              onClick={() => setLogSortOrder("asc")}
              title="Más antiguo primero"
            >
              <Image src="/icons/common/sort-up.svg" alt="Antiguo" width={16} height={16} />
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          {["Todos", "Registro Nuevo", "Riego", "Fertilizante", "Sustrato", "Trasplante", "Plaga/Enfermedad", "Nota"].map((f) => (
            <button
              key={f}
              className="btn-backup"
              style={{
                padding: "2px 8px",
                fontSize: "0.75rem",
                ...(logFilter === f ? { background: "var(--primary)", color: "var(--text-white)" } : {}),
              }}
              onClick={() => setLogFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        {[...plant.logs]
          .filter((log) => logFilter === "Todos" || log.actionType === logFilter)
          .sort((a, b) => {
            const dateCompare = logSortOrder === "desc" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return logSortOrder === "desc" ? b.id - a.id : a.id - b.id;
          })
          .map((log) => {
            const actionCfg = LOG_ACTIONS.find((a) => a.value === log.actionType);
            const isEditing = editingLogId === log.id;

            return (
              <div key={log.id} className="log-item">
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <select 
                        value={editLogAction} 
                        onChange={(e) => setEditLogAction(e.target.value)}
                        className="flex-1 text-sm py-1 px-2 rounded border border-[var(--border)]"
                      >
                        {LOG_ACTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <input 
                        type="date" 
                        value={editLogDate} 
                        onChange={(e) => setEditLogDate(e.target.value)}
                        className="text-sm py-1 px-2 rounded border border-[var(--border)]"
                      />
                    </div>
                    <input 
                      type="text" 
                      value={editLogDetail} 
                      onChange={(e) => setEditLogDetail(e.target.value)}
                      className="text-sm py-1 px-2 rounded border border-[var(--border)] w-full"
                      placeholder="Detalle..."
                    />
                    <div className="flex justify-end gap-2 mt-1">
                      <button className="btn-text text-xs uppercase font-bold text-[var(--text-gray)]" onClick={() => setEditingLogId(null)}>Cancelar</button>
                      <button className="btn-primary text-xs py-1 px-3" onClick={handleSaveEdit}>Guardar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          {actionCfg?.img ? (
                            <Image src={actionCfg.img} alt={log.actionType} width={18} height={18} className="object-contain" />
                          ) : (
                            <Image src={LOG_ACTION_ICON_BY_VALUE[log.actionType] || "/icons/common/notes.svg"} alt={log.actionType} width={18} height={18} className="object-contain" />
                          )}
                        </div>
                        <strong className="text-[var(--primary)]">{log.actionType}</strong>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <small><Image src="/icons/common/calendar.svg" alt="" width={12} height={12} className="inline mr-1" />{formatDate(log.date)}</small>
                        <div className="flex gap-1">
                          <button
                            className="btn-text"
                            style={{ padding: 0 }}
                            onClick={() => handleStartEdit(log)}
                            title="Editar registro"
                          >
                            <Image src="/icons/common/pencil.svg" alt="Editar" width={14} height={14} />
                          </button>
                          <button
                            className="btn-text"
                            style={{ color: "var(--danger)", padding: 0 }}
                            onClick={() => {
                              openModal("confirm", {
                                title: "¿Eliminar registro?",
                                message: "Esta acción quitará el evento del historial.",
                                onConfirm: () => removePlantLog(plant.id, log.id),
                              });
                            }}
                          >
                            <Image src="/icons/common/trash.svg" alt="Eliminar" width={14} height={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-[var(--text-brown)] text-[0.9rem]">{log.detail}</p>
                  </>
                )}
              </div>
            );
          })}
      </div>
    </aside>
  );
}
