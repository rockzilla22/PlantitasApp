"use client";

import { useState, useEffect } from "react";
import { $resizerWidth } from "@/store/uiStore";
import { $store, $selectedPlantId, addPlantLog, removePlantLog, removePlant, updatePlantLog } from "@/store/plantStore";
import { useStore } from "@nanostores/react";
import { openModal } from "@/store/modalStore";
import Image from "next/image";
import { CustomSelect } from "@/components/ui/CustomSelect";
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
    const registros = category ? inventory[category] : [];

    if (category && registros.length === 0) {
      openModal("confirm", {
        title: `¡Inventario de ${logAction} vacío!`,
        message: `No tienes ${logAction.toLowerCase()} cargados en el inventario. ¿Querés ir a añadir uno ahora?`,
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
      <div className="flex flex-col gap-6 p-6">
        {/* --- Name and Buttons --- */}
        <div className="text-[var(--primary)] text-xl font-bold flex registros-center justify-between">
          <div className="flex registros-center gap-2">
            <Image src={plantImg} alt={plant.type} width={24} height={24} className="object-contain shrink-0" />
            <h3 className="m-0 text-[var(--text-brown)] text-lg font-bold"> {plant.name}</h3>
          </div>

          {/* --- Actions --- */}
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
        <div className="flex flex-wrap gap-4">
          <span className="microclima-tag">
            <Image src="/icons/common/map.svg" alt="map" width={14} height={14} className="inline mr-1" />
            {plant.location}
          </span>
          <span className="microclima-tag">
            <Image src="/icons/environment/sun.svg" alt="sun" width={14} height={14} className="inline mr-1" />
            {plant.light}
          </span>
          <span className="microclima-tag">
            <Image src="/icons/environment/pots/plant_pot.svg" alt="pot" width={14} height={14} className="inline mr-1" />
            {plant.potType}
          </span>
          <span className="microclima-tag">
            <Image src="/icons/common/sleep.svg" alt="sleep" width={14} height={14} className="inline mr-1" />
            {plant.dormancy}
          </span>
          <span className="microclima-tag">
            <Image src={plantImg} alt={plant.type} width={14} height={14} className="inline mr-1" />
            {plant.type}
          </span>
          <span className="microclima-tag">{plant.subtype ? `Variedad: ${plant.subtype}` : "Sin variedad"}</span>
        </div>

        {/* --- Registro --- */}
        <div className="p-4" style={{ background: "var(--bg-faint)", borderRadius: "var(--radius)" }}>
          <div className="flex registros-center gap-2 mb-4">
            <Image src="/icons/common/notes2.svg" width={24} height={24} alt="" className="object-contain shrink-0" />
            <h3 className="text-[var(--text-brown)] text-lg font-bold m-0">Nuevo Registro</h3>
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="form-group mb-0">
                <CustomSelect
                  name="log-action"
                  options={LOG_ACTIONS}
                  defaultValue={logAction}
                  onChange={(val) => {
                    setLogAction(val);
                    setInventoryItem("");
                  }}
                />
              </div>
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="h-[52px] px-4 rounded-2xl border border-[var(--border-light)] bg-[var(--input-bg)] outline-none focus:border-[var(--primary)] transition-all"
              />
            </div>

            {inventoryCategory && inventory[inventoryCategory].length > 0 && (
              <CustomSelect
                name="inventory-item"
                options={inventory[inventoryCategory].map((item) => ({
                  value: item.name,
                  label: `${item.name} (${item.qty} ${item.unit})`,
                  img: LOG_ACTIONS.find((a) => a.value === logAction)?.img,
                }))}
                defaultValue={inventoryItem}
                onChange={(val) => setInventoryItem(val)}
                className="w-full"
              />
            )}

            <input
              type="text"
              placeholder="Detalle adicional..."
              value={logDetail}
              onChange={(e) => setLogDetail(e.target.value)}
              className="h-[52px] px-4 rounded-2xl border border-[var(--border-light)] bg-[var(--input-bg)] outline-none focus:border-[var(--primary)] transition-all"
            />
            <button
              className="btn-primary mx-auto flex w-full max-w-[10rem] registros-center justify-center py-4 text-center font-bold rounded-2xl"
              onClick={handleAddLog}
            >
              Guardar Acción
            </button>
          </div>
        </div>

        {/* --- Historial de Logs --- */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div className="flex registros-center gap-2">
              <Image src="/icons/common/notes2.svg" width={24} height={24} alt="" className="object-contain shrink-0" />
              <h3 className="m-0 text-[var(--text-brown)] text-lg font-bold">Historial</h3>
            </div>
            <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
              <small style={{ fontSize: "0.7rem", color: "var(--text-gray)", marginRight: "0.25rem" }}>Ordenar por fecha:</small>
              <button
                className="btn-text"
                style={{ padding: "4px", borderRadius: "6px", background: logSortOrder === "desc" ? "var(--border)" : "transparent" }}
                onClick={() => setLogSortOrder("desc")}
                title="Más reciente primero"
              >
                <Image src="/icons/common/sort-down.svg" alt="Reciente" width={30} height={30} />
              </button>
              <button
                className="btn-text"
                style={{ padding: "4px", borderRadius: "6px", background: logSortOrder === "asc" ? "var(--border)" : "transparent" }}
                onClick={() => setLogSortOrder("asc")}
                title="Más antiguo primero"
              >
                <Image src="/icons/common/sort-up.svg" alt="Antiguo" width={30} height={30} />
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            {["Todos", "Registro Nuevo", "Riego", "Fertilizante", "Sustrato", "Trasplante", "Plaga/Enfermedad", "Nota"].map((f) => (
              <button
                key={f}
                className="btn-backup"
                style={{
                  padding: "4px 10px",
                  fontSize: "0.75rem",
                  borderRadius: "10px",
                  ...(logFilter === f ? { background: "var(--primary)", color: "var(--text-white)" } : {}),
                }}
                onClick={() => setLogFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {[...plant.logs]
              .filter((log) => logFilter === "Todos" || log.actionType === logFilter)
              .sort((a, b) => {
                const dateCompare = logSortOrder === "desc" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
                if (dateCompare !== 0) return dateCompare;
                return logSortOrder === "desc" ? b.id - a.id : a.id - b.id;
              })
              .map((log) => {
                const actionCfg = LOG_ACTIONS.find((a) => a.value === log.actionType);
                const actionImg: string = actionCfg?.img || LOG_ACTION_ICON_BY_VALUE[log.actionType] || "/icons/common/notes.svg";
                const isEditing = editingLogId === log.id;

                return (
                  <div key={log.id} className="log-item" style={{ margin: 0 }}>
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        {/* ... editing form ... */}
                        <div className="flex gap-2">
                          <select
                            value={editLogAction}
                            onChange={(e) => setEditLogAction(e.target.value)}
                            className="flex-1 text-sm py-1 px-2 rounded border border-[var(--border)]"
                          >
                            {LOG_ACTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
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
                          <button
                            className="btn-text text-xs uppercase font-bold text-[var(--text-gray)]"
                            onClick={() => setEditingLogId(null)}
                          >
                            Cancelar
                          </button>
                          <button className="btn-primary text-xs py-1 px-3" onClick={handleSaveEdit}>
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div className="flex registros-center gap-2">
                            <div className="w-5 h-5 flex registros-center justify-center shrink-0">
                              <Image src={actionImg} alt={log.actionType} width={18} height={18} className="object-contain" />
                            </div>
                            <strong className="text-[var(--primary)]">{log.actionType}</strong>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <small>
                              <Image src="/icons/common/calendar.svg" alt="" width={12} height={12} className="inline mr-1" />
                              {formatDate(log.date)}
                            </small>
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
                        <p className="text-[var(--text-brown)] text-[0.9rem] m-0 mt-1">{log.detail}</p>
                      </>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </aside>
  );
}
