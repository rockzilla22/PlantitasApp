"use client";

import { useStore } from "@nanostores/react";
import { $activeModal, closeModal, openModal } from "@/store/modalStore";
import { useEffect, useRef, useState } from "react";
import { addPlant, $store, addPropagation, addWish, addNote, updateInventoryItem, addSeasonTask, updatePlant, updatePropagation, updateWish, updateSeasonTask, updateNote, mergeData, setStoreData } from "@/store/plantStore";
import { InventoryCategory } from "@/core/inventory/domain/InventoryItem";
import { PotLabel } from "@/components/ui/PotLabel";
import configProject from "@/data/configProject";
import {
  DORMANCIES,
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
  LIGHT_LEVELS,
  PLANT_LOCATIONS,
  PLANT_TYPES,
  POT_TYPES,
  PROP_METHODS,
  SEASON_TASK_TYPES,
  WISH_PRIORITIES,
  type Option,
} from "@/data/catalog";

const renderOptions = (options: Option[]) =>
  options.map((option) => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ));

function AdminPremiumModal({ props, handleClose }: { props: any; handleClose: () => void }) {
  const [activePlanTab, setActivePlanTab] = useState<"FREE" | "PRO" | "PREMIUM">("PREMIUM");
  const p = configProject.plans;

  return (
    <div className="admin-manage-modal">
      <h3 className="text-xl font-black text-[var(--primary)] mb-2">Gestionar Usuario</h3>
      <p className="mb-6 text-xs font-bold text-[var(--text-gray)] opacity-60 uppercase tracking-widest border-b border-[var(--border-light)] pb-4">
        Operador: <span className="text-[var(--text)]">{props?.userName}</span>
      </p>

      {/* TABS DE PLAN */}
      <div className="flex bg-[var(--bg-faint)] p-1.5 rounded-2xl gap-1.5 mb-8 shadow-inner">
        {(["FREE", "PRO", "PREMIUM"] as const).map((planKey) => (
          <button
            key={planKey}
            type="button"
            className={`flex-1 py-3 text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all ${
              activePlanTab === planKey
                ? "bg-[var(--white)] text-[var(--primary)] shadow-md"
                : "text-[var(--text-gray)] opacity-40 hover:opacity-100"
            }`}
            onClick={() => setActivePlanTab(planKey)}
          >
            {p[planKey].icon} {p[planKey].label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activePlanTab === "PREMIUM" && (
          <form className="space-y-6 animate-in fade-in duration-300" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            props?.onConfirm({ 
              action: "add", 
              hasPremium: true, 
              amount: fd.get("amount"), 
              unit: fd.get("unit") 
            });
            handleClose();
          }}>
             <div className="bg-[var(--info-bg)]/30 p-6 rounded-3xl border border-[var(--info)]/10">
                <p className="m-0 text-xs font-bold text-[var(--info-dark)] mb-4">🎁 REGALAR MEMBRESÍA PREMIUM</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group mb-0">
                    <label className="text-[0.6rem] uppercase opacity-60 font-black mb-2 block">Cantidad</label>
                    <input type="number" name="amount" defaultValue="1" min="1" required className="bg-[var(--white)] border-[var(--border)] p-3 rounded-xl font-black text-sm" />
                  </div>
                  <div className="form-group mb-0">
                    <label className="text-[0.6rem] uppercase opacity-60 font-black mb-2 block">Unidad</label>
                    <select name="unit" defaultValue="months" className="bg-[var(--white)] border-[var(--border)] p-3 rounded-xl font-black text-xs">
                      <option value="months">Meses</option>
                      <option value="days">Días</option>
                    </select>
                  </div>
                </div>
             </div>
             <button type="submit" className="btn-primary w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em]">Aplicar Tiempo Premium</button>
          </form>
        )}

        {activePlanTab === "PRO" && (
          <form className="space-y-6 animate-in fade-in duration-300" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            props?.onConfirm({ 
              action: "set_pro", 
              slotsToGift: parseInt(fd.get("slots") as string || "0")
            });
            handleClose();
          }}>
             <div className="bg-[var(--success-bg)]/50 p-6 rounded-3xl border border-[var(--primary)]/10">
                <p className="m-0 text-xs font-bold text-[var(--primary)] mb-4">💎 ASCENDER A PRO + REGALAR SLOTS</p>
                <div className="form-group mb-0">
                  <label className="text-[0.6rem] uppercase opacity-60 font-black mb-2 block">Slots de Expansión</label>
                  <input type="number" name="slots" defaultValue="0" min="0" className="bg-[var(--white)] border-[var(--border)] p-3 rounded-xl font-black text-sm" />
                  <span className="text-[0.55rem] opacity-40 mt-2 block italic">Los slots se suman a su límite actual de Pro ({p.PRO.maxSlots}).</span>
                </div>
             </div>
             <button type="submit" className="btn-primary w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-[var(--secondary)]">Activar Nivel Pro</button>
          </form>
        )}

        {activePlanTab === "FREE" && (
          <form className="space-y-6 animate-in fade-in duration-300" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const slots = parseInt(fd.get("slots") as string || "0");
            if (slots > 0) {
              props?.onConfirm({ action: "set_free", slotsToGift: slots });
            } else {
              props?.onConfirm({ action: "set_free" });
            }
            handleClose();
          }}>
             <div className="bg-[var(--warning-bg)]/50 p-6 rounded-3xl border border-[var(--secondary)]/10">
                <p className="m-0 text-xs font-bold text-[var(--warning-dark)] mb-4">🌱 NIVEL USUARIO (BASE)</p>
                <div className="form-group mb-0">
                  <label className="text-[0.6rem] uppercase opacity-60 font-black mb-2 block">Regalar Slots Extras</label>
                  <input type="number" name="slots" defaultValue="0" min="0" className="bg-[var(--white)] border-[var(--border)] p-3 rounded-xl font-black text-sm" />
                  <span className="text-[0.55rem] opacity-40 mt-2 block italic">Esto aumentará sus slots permanentes más allá de los {p.FREE.maxSlots} base.</span>
                </div>
             </div>
             <button type="submit" className="btn-primary w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-[var(--text-gray)]">Resetear a Nivel Usuario</button>
          </form>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <button type="button" className="btn-text text-[0.6rem] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all" onClick={handleClose}>Cancelar Operación</button>
      </div>
    </div>
  );
}

export function Modals() {
  const { type, props } = useStore($activeModal);
  const { plants } = useStore($store);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [plantType, setPlantType] = useState("🌿|Planta");
  const [plantLocation, setPlantLocation] = useState("Sala");

  useEffect(() => {
    if (type && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (dialogRef.current) {
      dialogRef.current.close();
    }
  }, [type]);

  useEffect(() => {
    if (type !== "add-plant" && type !== "edit-plant") {
      return;
    }

    const currentLocation = props?.location || "Sala";
    const hasCatalogLocation = PLANT_LOCATIONS.some((option) => option.value === currentLocation);

    setPlantLocation(hasCatalogLocation ? currentLocation : "Otros");
  }, [props?.location, type]);

  const handleClose = () => {
    closeModal();
  };

  // --- Handlers ---
  const handlePlantSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    let icon = "🌿", typeLabel = "Planta";
    const typeSelect = fd.get("p-type") as string;
    if (typeSelect === "CUSTOM") {
      const custom = (fd.get("p-custom-type") as string) || "🌿|Planta";
      const parts = custom.includes("|") ? custom.split("|") : ["🌿", custom];
      icon = parts[0]; typeLabel = parts[1];
    } else {
      const parts = typeSelect.split("|");
      icon = parts[0]; typeLabel = parts[1];
    }

    const selectedLocation = fd.get("p-location") as string;
    const customLocation = (fd.get("p-custom-location") as string | null)?.trim();
    const location = selectedLocation === "Otros"
      ? customLocation || "Otros"
      : selectedLocation || "No especificada";

    const data = {
      name: fd.get("p-name") as string,
      icon,
      type: typeLabel,
      location,
      light: fd.get("p-light") as any,
      potType: fd.get("p-pot") as any,
      dormancy: fd.get("p-dormancy") as any,
    };

    if (type === "edit-plant") {
      updatePlant(props.id, data);
    } else {
      addPlant(data);
    }
    handleClose();
  };

  const handlePropSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("prop-name") as string,
      method: fd.get("prop-method") as any,
      startDate: fd.get("prop-start") as string,
      parentId: fd.get("prop-parent") ? parseInt(fd.get("prop-parent") as string) : null,
      notes: fd.get("prop-notes") as string
    };
    if (type === "edit-prop") {
      updatePropagation(props.id, data);
    } else {
      addPropagation(data);
    }
    handleClose();
  };

  const handleWishSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("w-name") as string,
      priority: fd.get("w-priority") as any,
      notes: fd.get("w-notes") as string
    };
    if (type === "edit-wish") {
      updateWish(props.id, data);
    } else {
      addWish(data.name, data.priority, data.notes);
    }
    handleClose();
  };

  const handleSeasonTaskSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const data = {
      type: fd.get("st-type") as any,
      desc: fd.get("st-desc") as string
    };
    if (type === "edit-season-task") {
      updateSeasonTask(props.season, props.index, data);
    } else {
      addSeasonTask(props?.season || "Primavera", data.type, data.desc);
    }
    handleClose();
  };

  const handleNoteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const content = fd.get("n-content") as string;
    if (type === "edit-note") {
      updateNote(props.id, content);
    } else {
      addNote(content);
    }
    handleClose();
  };

  const handleItemSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const data = {
      category: fd.get("i-type") as InventoryCategory,
      name: fd.get("i-name") as string,
      qty: parseFloat(fd.get("i-qty") as string),
      unit: fd.get("i-unit") as string
    };
    updateInventoryItem(data.category, data.name, data.qty, data.unit);
    handleClose();
  };

  const handleCalendarSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get("cal-title") as string;
    const desc = fd.get("cal-desc") as string;
    const date = (fd.get("cal-date") as string).replace(/-/g, '');
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(desc)}&dates=${date}/${date}`;
    window.open(url, '_blank');
    handleClose();
  };

  return (
    <>
      <dialog ref={dialogRef} onCancel={handleClose} id={`modal-${type}`}>
        {(type === "add-plant" || type === "edit-plant") && (
          <form method="dialog" onSubmit={handlePlantSubmit}>
            <h3>{type === "edit-plant" ? "✏️ Editar Perfil Botánico" : "🌿 Nueva Planta"}</h3>
            <div className="form-group">
              <label>Nombre (obligatorio)</label>
              <input type="text" name="p-name" required placeholder="Ej: Monstera Albo" defaultValue={props?.name || props?.initialName || ""} />
            </div>
            <div className="form-group">
              <label>Tipo de Planta</label>
              <select name="p-type" defaultValue={props ? `${props.icon}|${props.type}` : "🌿|Planta"} onChange={(e) => setPlantType(e.target.value)}>
                {renderOptions(PLANT_TYPES)}
              </select>
              {plantType === "CUSTOM" && (
                <input
                  type="text"
                  name="p-custom-type"
                  placeholder="emoji|NombreTipo  ej: 🌺|Orquídea"
                  style={{ marginTop: '0.4rem' }}
                />
              )}
            </div>
            <div className="form-grid grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="form-group mb-0">
                <label>📍 Ubicación</label>
                <select
                  name="p-location"
                  className="p-2 text-sm sm:text-base"
                  value={plantLocation}
                  onChange={(event) => setPlantLocation(event.target.value)}
                >
                  {renderOptions(PLANT_LOCATIONS)}
                </select>
                {plantLocation === "Otros" && (
                  <input
                    type="text"
                    name="p-custom-location"
                    className="mt-2 p-2 text-sm sm:text-base"
                    placeholder="Ej: Lavadero, Ventana norte, Terraza"
                    defaultValue={props?.location && !PLANT_LOCATIONS.some((option) => option.value === props.location) ? props.location : ""}
                    required
                  />
                )}
              </div>
              <div className="form-group mb-0">
                <label>☀️ Luz</label>
                <select name="p-light" className="p-2 text-sm sm:text-base" defaultValue={props?.light || "Media"}>
                  {renderOptions(LIGHT_LEVELS)}
                </select>
              </div>
            </div>
            <div className="form-grid grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
              <div className="form-group mb-0">
                <PotLabel />
                <select name="p-pot" className="p-2 text-sm sm:text-base" defaultValue={props?.potType || "Plástico"}>
                  {renderOptions(POT_TYPES)}
                </select>
              </div>
              <div className="form-group mb-0">
                <label>💤 Dormancia</label>
                <select name="p-dormancy" className="p-2 text-sm sm:text-base" defaultValue={props?.dormancy || "Ninguna"}>
                  {renderOptions(DORMANCIES)}
                </select>
              </div>
            </div>
            <div className="modal-actions flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 mt-6">
              <button type="button" className="btn-text w-full sm:w-auto py-2" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="btn-primary w-full sm:w-auto py-2">{type === "edit-plant" ? "Actualizar" : "Guardar Planta"}</button>
            </div>
          </form>
        )}

        {(type === "add-prop" || type === "edit-prop") && (
          <form method="dialog" onSubmit={handlePropSubmit}>
            <h3>{type === "edit-prop" ? "✏️ Editar Propagación" : "🧪 Nueva Propagación"}</h3>
            <div className="form-group">
              <label>Planta Madre (Opcional)</label>
              <select name="prop-parent" defaultValue={props?.parentId || ""}>
                <option value="">-- Sin madre (Independiente) --</option>
                {plants.sort((a,b) => a.name.localeCompare(b.name)).map(p => (
                  <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Nombre Identificador (obligatorio)</label>
              <input type="text" name="prop-name" placeholder="Ej: Esqueje de Pothos" required defaultValue={props?.name || ""} />
            </div>
            <div className="form-grid grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="form-group mb-0">
                <label>Método</label>
                <select name="prop-method" className="p-2 text-sm sm:text-base" defaultValue={props?.method || "Agua"}>
                  {renderOptions(PROP_METHODS)}
                </select>
              </div>
              <div className="form-group mb-0">
                <label>📅 Fecha Inicio (obligatorio)</label>
                <input type="date" name="prop-start" className="p-2 text-sm sm:text-base" required defaultValue={props?.startDate || new Date().toISOString().split('T')[0]} />
              </div>
            </div>
            <div className="form-group mt-3 sm:mt-4"><label>📝 Notas</label><textarea name="prop-notes" className="p-2 text-sm sm:text-base" placeholder="Condiciones, hormonas, etc." defaultValue={props?.notes || ""}></textarea></div>
            <div className="modal-actions flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 mt-6">
              <button type="button" className="btn-text w-full sm:w-auto py-2" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="btn-primary w-full sm:w-auto py-2">{type === "edit-prop" ? "Actualizar" : "Iniciar"}</button>
            </div>
          </form>
        )}

        {(type === "add-wish" || type === "edit-wish") && (
          <form method="dialog" onSubmit={handleWishSubmit}>
            <h3>{type === "edit-wish" ? "✏️ Editar Deseo" : "✨ Nuevo Deseo"}</h3>
            <div className="form-group">
              <label>¿Qué deseamos? (obligatorio)</label>
              <input type="text" name="w-name" required placeholder="Ej: Tijeras, Fertilizante, Monstera..." className="p-2 text-sm sm:text-base" defaultValue={props?.name || ""} />
            </div>
            <div className="form-group">
              <label>Prioridad</label>
              <select name="w-priority" className="p-2 text-sm sm:text-base" defaultValue={props?.priority || "Media"}>
                {renderOptions(WISH_PRIORITIES)}
              </select>
            </div>
            <div className="form-group"><label>📝 Notas</label><textarea name="w-notes" className="p-2 text-sm sm:text-base" placeholder="Link, precio, lugar..." defaultValue={props?.notes || ""}></textarea></div>
            <div className="modal-actions flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 mt-6">
              <button type="button" className="btn-text w-full sm:w-auto py-2" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="btn-primary w-full sm:w-auto py-2">{type === "edit-wish" ? "Actualizar" : "Añadir"}</button>
            </div>
          </form>
        )}

        {(type === "add-season-task" || type === "edit-season-task") && (
          <form method="dialog" onSubmit={handleSeasonTaskSubmit}>
            <h3>{type === "edit-season-task" ? "✏️ Editar Plan de Temporada" : "📅 Planear Acción"}</h3>
            <div className="form-group">
              <label>Tipo de Tarea</label>
              <select name="st-type" className="p-2 text-sm sm:text-base" defaultValue={props?.type || "Otro"}>
                {renderOptions(SEASON_TASK_TYPES)}
              </select>
            </div>
            <div className="form-group">
              <label>Descripción del Plan (obligatorio)</label>
              <textarea name="st-desc" required className="p-2 text-sm sm:text-base" placeholder="Ej: Podar los geranios..." defaultValue={props?.desc || ""}></textarea>
            </div>
            <div className="modal-actions flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 mt-6">
              <button type="button" className="btn-text w-full sm:w-auto py-2" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="btn-primary w-full sm:w-auto py-2">{type === "edit-season-task" ? "Actualizar Plan" : "Guardar Plan"}</button>
            </div>
          </form>
        )}

        {(type === "add-note" || type === "edit-note") && (
          <form method="dialog" onSubmit={handleNoteSubmit}>
            <h3>{type === "edit-note" ? "✏️ Editar Nota Global" : "📝 Nueva Nota Global"}</h3>
            <div className="form-group">
              <label>Contenido de la nota (obligatorio)</label>
              <textarea name="n-content" rows={4} required className="p-2 text-sm sm:text-base" placeholder="Ej: Comprar fertilizante orgánico..." defaultValue={props?.content || ""}></textarea>
            </div>
            <div className="modal-actions flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 mt-6">
              <button type="button" className="btn-text w-full sm:w-auto py-2" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="btn-primary w-full sm:w-auto py-2">{type === "edit-note" ? "Actualizar" : "Guardar"}</button>
            </div>
          </form>
        )}

        {(type === "add-item" || type === "edit-item") && (
          <form method="dialog" onSubmit={handleItemSubmit}>
            <h3>{type === "edit-item" ? "✏️ Editar Insumo" : "📦 Nuevo Insumo"}</h3>
            <div className="form-group">
              <label>Categoría</label>
              <select name="i-type" className="p-2 text-sm sm:text-base" defaultValue={props?.cat || "substrates"}>
                {renderOptions(INVENTORY_CATEGORIES)}
              </select>
            </div>
            <div className="form-group">
              <label>Nombre del insumo (obligatorio)</label>
              <input type="text" name="i-name" required className="p-2 text-sm sm:text-base" placeholder="Ej: Humus de lombriz" defaultValue={props?.name || ""} />
            </div>
            <div className="form-grid grid grid-cols-2 gap-3 sm:gap-4">
              <div className="form-group mb-0">
                <label>Cantidad</label>
                <input type="number" name="i-qty" step="0.1" required className="p-2 text-sm sm:text-base" defaultValue={props?.qty || "1"} />
              </div>
              <div className="form-group mb-0">
                <label>Unidad</label>
                <select name="i-unit" className="p-2 text-sm sm:text-base" defaultValue={props?.unit || "L"}>
                  {renderOptions(INVENTORY_UNITS)}
                </select>
              </div>
            </div>
            <div className="modal-actions flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 mt-6">
              <button type="button" className="btn-text w-full sm:w-auto py-2" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="btn-primary w-full sm:w-auto py-2">{type === "edit-item" ? "Actualizar" : "Añadir"}</button>
            </div>
          </form>
        )}

        {type === "confirm" && (
          <div style={{ textAlign: "center" }}>
            <h3>{props?.title || "¿Estás seguro?"}</h3>
            <p style={{ margin: "1rem 0", color: "var(--text-gray)" }}>{props?.message}</p>
            <div className="modal-actions" style={{ justifyContent: "center" }}>
              <button type="button" className="btn-text" onClick={handleClose}>Cancelar</button>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ background: props?.confirmClass === 'secondary' ? 'var(--secondary)' : 'var(--danger)' }}
                onClick={() => { props?.onConfirm(); handleClose(); }}
              >
                {props?.confirmText || "Confirmar"}
              </button>
            </div>
          </div>
        )}

        {type === "import-choice" && (
          <div style={{ textAlign: "center" }}>
            <h3>⚠️ Resolución de Conflicto</h3>
            <p style={{ margin: "1rem 0", color: "var(--text-gray)", textAlign: "left", fontSize: "0.9rem", lineHeight: "1.4" }}>
              {props?.message}
            </p>
            <div className="modal-actions" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button
                type="button"
                className="btn-primary"
                style={{ background: "var(--secondary)", width: "100%" }}
                onClick={() => { mergeData(props.data); handleClose(); }}
              >
                🤝 Unificar Datos (Mezclar ambos)
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ background: "var(--danger)", width: "100%" }}
                onClick={() => {
                  setStoreData(props.data);
                  handleClose();
                }}
              >
                🔄 Sobreescribir (Usar solo archivo)
              </button>
              <button type="button" className="btn-text" onClick={handleClose} style={{ width: "100%" }}>Cancelar</button>
            </div>
          </div>
        )}

        {type === "info" && (
          <div style={{ textAlign: "center" }}>
            <h3>{props?.title || "¡Logrado!"}</h3>
            <p style={{ margin: "1rem 0", color: "var(--text-gray)" }}>{props?.message}</p>
            <div className="modal-actions" style={{ justifyContent: "center" }}>
              <button type="button" className="btn-primary" onClick={handleClose}>Entendido</button>
            </div>
          </div>
        )}

        {type === "admin-premium" && (
          <AdminPremiumModal props={props} handleClose={handleClose} />
        )}

        {type === "admin-master" && (
          <div style={{ textAlign: "center" }}>
            <h3>Gestionar Rango Master</h3>
            <p className="my-4 text-sm text-[var(--text-gray)]">
              Usuario: <strong>{props?.userName}</strong>
            </p>
            <div className="flex flex-col gap-3">
              {props?.currentRole === 'master_admin' ? (
                <button 
                  className="btn-primary bg-[var(--danger)] w-full py-3"
                  onClick={() => { props?.onConfirm({ role: 'user' }); handleClose(); }}
                >
                  Quitar Rango Master
                </button>
              ) : (
                <button 
                  className="btn-primary bg-[var(--secondary)] w-full py-3"
                  onClick={() => { props?.onConfirm({ role: 'master_admin' }); handleClose(); }}
                >
                  Subir a Master
                </button>
              )}
              <button className="btn-text w-full" onClick={handleClose}>Cancelar</button>
            </div>
          </div>
        )}

        {type === "calendar" && (
          <form method="dialog" onSubmit={handleCalendarSubmit}>
            <h3>📅 Recordatorio Google</h3>
            <div className="form-group">
              <label>Título (obligatorio)</label>
              <input type="text" name="cal-title" required defaultValue={props?.title || ""} />
            </div>
            <div className="form-group"><label>Descripción</label><textarea name="cal-desc" defaultValue={props?.desc || ""}></textarea></div>
            <div className="form-group">
              <label>Fecha (obligatorio)</label>
              <input type="date" name="cal-date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-text" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="btn-primary">Añadir</button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
