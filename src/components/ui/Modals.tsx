"use client";

import { useStore } from "@nanostores/react";
import { $activeModal, closeModal, openModal } from "@/store/modalStore";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  addPlant,
  $store,
  addPropagation,
  addWish,
  addNote,
  updateInventoryItem,
  addSeasonTask,
  updatePlant,
  updatePropagation,
  updatePropStatus,
  updateWish,
  updateSeasonTask,
  updateNote,
  mergeData,
  setStoreData,
} from "@/store/plantStore";
import { PotLabel } from "@/components/ui/PotLabel";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { InventoryCategory } from "@/core/inventory/domain/InventoryItem";
import configProject from "@/data/configProject";
import Image from "next/image";
import { ImportSelectionModal } from "./ImportSelectionModal";
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
} from "@/data/catalog";

function AdminPremiumModal({ props, handleClose }: { props: any; handleClose: () => void }) {
  const p = configProject.plans;
  const plansToShow = [p.PREMIUM, p.PRO, p.FREE];
  const [activePlanTab, setActivePlanTab] = useState(p.PREMIUM.id);

  const currentGiftSlots: number = props?.giftSlots || 0;
  const expiresAt: string | null = props?.premiumExpiresAt || null;
  const isExpired = expiresAt ? new Date() > new Date(expiresAt) : true;

  return (
    <div className="admin-manage-modal">
      <h3 className="mb-2 text-xl font-black text-[var(--primary)]">Gestionar Usuario</h3>
      <p className="mb-6 border-b border-[var(--border-light)] pb-4 text-xs font-bold uppercase tracking-widest text-[var(--text-gray)]">
        Operador: <span className="text-[var(--text)]">{props?.userName}</span>
      </p>

      {/* TABS DE PLAN */}
      <div className="flex bg-[var(--bg-faint)] p-1.5 rounded-2xl gap-1.5 mb-8 shadow-inner">
        {plansToShow.map((plan) => (
          <button
            key={plan.id}
            type="button"
            className={`flex-1 py-3 text-[0.9rem] font-black uppercase tracking-widest rounded-xl transition-all ${
              activePlanTab === plan.id
                ? "bg-[var(--white)] text-[var(--primary)] shadow-md ring-1 ring-[var(--border)]"
                : "text-[var(--text-gray)] opacity-80 hover:bg-[var(--white)]/70 hover:text-[var(--text)]"
            }`}
            onClick={() => setActivePlanTab(plan.id)}
          >
            {plan.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activePlanTab === p.PREMIUM.id && (
          <form
            className="space-y-6 animate-in fade-in duration-300"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const val = parseInt((fd.get("amount") as string) || "0");
              const unit = fd.get("unit") as string;
              const base = expiresAt && !isExpired ? new Date(expiresAt) : new Date();
              if (unit === "months") base.setMonth(base.getMonth() + val);
              else base.setDate(base.getDate() + val);

              props?.onConfirm({
                role: p.PREMIUM.id,
                gift_slots: props.giftSlots,
                extra_slots: props.extraSlots,
                premium_expires_at: base.toISOString()
              });
              handleClose();
            }}
          >
            <div className="rounded-3xl border border-[var(--info)]/25 bg-[var(--info-bg)]/60 p-6">
              <p className="m-0 text-xs font-bold text-[var(--info-dark)] mb-4">REGALAR MEMBRESÍA PREMIUM</p>
              {expiresAt && !isExpired && (
                <p className="mb-3 text-[0.6rem] text-[var(--info-dark)] opacity-90">
                  Premium activo hasta: {new Date(expiresAt).toLocaleDateString()} — el tiempo se acumula.
                </p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group mb-0">
                  <label className="mb-2 block text-[0.6rem] font-black uppercase text-[var(--text-gray)]">Cantidad</label>
                  <input
                    type="number"
                    name="amount"
                    defaultValue="1"
                    min="1"
                    required
                    className="rounded-xl border border-[var(--border)] bg-[var(--white)] p-3 text-sm font-black text-[var(--text)]"
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="mb-2 block text-[0.6rem] font-black uppercase text-[var(--text-gray)]">Unidad</label>
                  <select
                    name="unit"
                    defaultValue="months"
                    className="rounded-xl border border-[var(--border)] bg-[var(--white)] p-3 text-xs font-black text-[var(--text)]"
                  >
                    <option value="months">Meses</option>
                    <option value="days">Días</option>
                  </select>
                </div>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em]">
              Aplicar Tiempo Premium
            </button>
          </form>
        )}

        {activePlanTab === p.PRO.id && (
          <form
            className="space-y-6 animate-in fade-in duration-300"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              props?.onConfirm({
                role: p.PRO.id,
                gift_slots: props.giftSlots + parseInt((fd.get("slots") as string) || "0"),
                extra_slots: props.extraSlots,
                premium_expires_at: props.premiumExpiresAt
              });
              handleClose();
            }}
          >
            <div className="rounded-3xl border border-[var(--primary)]/20 bg-[var(--success-bg)]/70 p-6">
              <p className="m-0 text-xs font-bold text-[var(--primary)] mb-4">ASCENDER A PRO + REGALAR SLOTS</p>
              {currentGiftSlots > 0 && (
                <p className="mb-3 text-[0.6rem] text-[var(--primary)] opacity-90">
                  Gift slots actuales: {currentGiftSlots} — los nuevos se acumulan.
                </p>
              )}
              <div className="form-group mb-0">
                <label className="mb-2 block text-[0.6rem] font-black uppercase text-[var(--text-gray)]">Slots a Regalar</label>
                <input
                  type="number"
                  name="slots"
                  defaultValue="0"
                  min="0"
                  className="rounded-xl border border-[var(--border)] bg-[var(--white)] p-3 text-sm font-black text-[var(--text)]"
                />
              </div>
            </div>
            <button type="submit" className="btn-warning w-full rounded-2xl py-4 text-xs font-black uppercase tracking-[0.2em]">
              Activar Nivel Pro
            </button>
          </form>
        )}

        {activePlanTab === p.FREE.id && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="rounded-3xl border border-[var(--secondary)]/25 bg-[var(--warning-bg)]/75 p-6">
              <p className="m-0 text-xs font-bold text-[var(--warning-dark)] mb-3">RESETEAR A NIVEL USUARIO</p>
              <p className="text-[0.9rem] leading-relaxed text-[var(--text)]">
                Elimina Premium, Pro, y todos los gift slots. El usuario vuelve al límite base de {p.FREE.maxSlots} slots sin nube.
              </p>
            </div>
            <button
              type="button"
              className="w-full rounded-2xl border border-[var(--text)] bg-[var(--text)] py-4 text-xs font-black uppercase tracking-[0.2em] text-[var(--text-white)] transition-all hover:bg-[var(--brand-dark)]"
              onClick={() => {
                props?.onConfirm({ 
                  role: p.FREE.id,
                  gift_slots: 0,
                  extra_slots: 0,
                  premium_expires_at: null
                });
                handleClose();
              }}
            >
              Resetear a Nivel Usuario
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          className="btn-text text-[0.6rem] font-black uppercase tracking-widest opacity-80 transition-all hover:opacity-100"
          onClick={handleClose}
        >
          Cancelar Operación
        </button>
      </div>
    </div>
  );
}

export function Modals() {
  const { type, props } = useStore($activeModal);
  const { plants } = useStore($store);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [plantType, setPlantType] = useState("Planta");
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

    const currentType = props?.type || "Planta";
    const isCustom = !PLANT_TYPES.some((option) => option.value === currentType);
    setPlantType(isCustom ? "CUSTOM" : currentType);
  }, [props?.location, props?.type, type]);

  const handleClose = () => {
    closeModal();
  };

  // --- Handlers ---
  const handlePlantSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    let icon = "/icons/environment/plants/generic.svg",
      typeLabel = "Planta";
    const typeSelect = fd.get("p-type") as string;

    if (typeSelect === "CUSTOM") {
      const custom = (fd.get("p-custom-type") as string) || "Planta";
      typeLabel = custom;
    } else {
      const catalogType = PLANT_TYPES.find((t) => t.value === typeSelect);
      if (catalogType) {
        typeLabel = catalogType.value;
        icon = catalogType.img || "/icons/environment/plants/generic.svg";
      } else {
        typeLabel = typeSelect;
      }
    }

    const selectedLocation = fd.get("p-location") as string;
    const customLocation = (fd.get("p-custom-location") as string | null)?.trim();
    const location = selectedLocation === "Otros" ? customLocation || "Otros" : selectedLocation || "No especificada";

    const data = {
      name: fd.get("p-name") as string,
      icon,
      type: typeLabel,
      subtype: fd.get("p-subtype") as string,
      location,
      light: fd.get("p-light") as any,
      potType: fd.get("p-pot") as any,
      dormancy: fd.get("p-dormancy") as any,
    };

    if (type === "edit-plant") {
      updatePlant(props.id, data);
      handleClose();
    } else {
      if (addPlant(data)) {
        if (props?.propId) updatePropStatus(props.propId, "Trasplantada");
        handleClose();
      }
    }
  };

  const handlePropSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("prop-name") as string,
      method: fd.get("prop-method") as any,
      startDate: fd.get("prop-start") as string,
      parentId: fd.get("prop-parent") ? parseInt(fd.get("prop-parent") as string) : null,
      notes: fd.get("prop-notes") as string,
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
      notes: fd.get("w-notes") as string,
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
      desc: fd.get("st-desc") as string,
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

  const handleItemsubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const data = {
      category: fd.get("i-type") as InventoryCategory,
      name: fd.get("i-name") as string,
      qty: parseFloat(fd.get("i-qty") as string),
      unit: fd.get("i-unit") as string,
    };
    updateInventoryItem(data.category, data.name, data.qty, data.unit);
    handleClose();
  };

  const handleCalendarSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get("cal-title") as string;
    const desc = fd.get("cal-desc") as string;
    const date = (fd.get("cal-date") as string).replace(/-/g, "");
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(desc)}&dates=${date}/${date}`;
    window.open(url, "_blank");
    handleClose();
  };

  return (
    <>
      <dialog
        ref={dialogRef}
        onCancel={handleClose}
        id={`modal-${type}`}
        className={
          type === "add-plant" || type === "edit-plant"
            ? "plant-form-modal"
            : type === "add-season-task" || type === "edit-season-task"
              ? "season-task-modal"
              : undefined
        }
      >
        {/* --- MODAL DE AGREGAR/EDITAR PLANTA --- */}
        {(type === "add-plant" || type === "edit-plant") && (
          <form method="dialog" onSubmit={handlePlantSubmit}>
            <h3 className="flex items-center gap-2">
              {type === "edit-plant" ? (
                <>
                  <Image src="/icons/common/pencil.svg" alt="Modificar Planta" width={18} height={18} className="object-contain" />
                  <span>Modificar Planta</span>
                </>
              ) : (
                <>
                  <Image src="/icons/common/stars.svg" alt="Nueva Planta" width={18} height={18} className="object-contain" />
                  <span>Nueva Planta</span>
                </>
              )}
            </h3>
            {/* --- Nombre --- */}
            <div className="form-group">
              <label>Nombre*</label>
              <input
                type="text"
                name="p-name"
                required
                placeholder="Ej: Monstera Albo"
                defaultValue={props?.name || props?.initialName || ""}
              />
            </div>
            {/* --- Tipo y Subtipo --- */}
            <div className="form-grid grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* --- Tipo --- */}
              <div className="form-group">
                <label>Tipo de Planta*</label>
                <CustomSelect
                  name="p-type"
                  options={PLANT_TYPES}
                  defaultValue={plantType}
                  onChange={(val) => setPlantType(val)}
                />
                {plantType === "CUSTOM" && (
                  <input
                    type="text"
                    name="p-custom-type"
                    placeholder="Orquídea"
                    style={{ marginTop: "0.4rem" }}
                    defaultValue={!PLANT_TYPES.some((t) => t.value === props?.type) ? props?.type : ""}
                  />
                )}
              </div>
              {/* --- Subtipo --- */}
              <div className="form-group">
                <label>Subtipo</label>
                <input
                  type="text"
                  name="p-subtype"
                  placeholder="Ej: Epífita"
                  defaultValue={props?.subtype || props?.initialSubtype || ""}
                />
              </div>
            </div>
            {/* --- Ubicación y Luz --- */}
            <div className="form-grid grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* --- Ubicación --- */}
              <div className="form-group mb-0">
                <label>Ubicación</label>
                <CustomSelect
                  name="p-location"
                  options={PLANT_LOCATIONS}
                  defaultValue={
                    PLANT_LOCATIONS.some((option) => option.value === props?.location) ? props.location : props?.location ? "Otros" : "Sala"
                  }
                  onChange={(val) => setPlantLocation(val)}
                />
                {plantLocation === "Otros" && (
                  <input
                    type="text"
                    name="p-custom-location"
                    className="mt-2 p-2 text-sm sm:text-base"
                    placeholder="Ej: Lavadero, Ventana norte, Terraza"
                    defaultValue={
                      props?.location && !PLANT_LOCATIONS.some((option) => option.value === props.location) ? props.location : ""
                    }
                    required
                  />
                )}
              </div>
              {/* --- Luz --- */}
              <div className="form-group mb-0">
                <label>Luz</label>
                <CustomSelect name="p-light" options={LIGHT_LEVELS} defaultValue={props?.light || "Media"} />
              </div>
            </div>
            {/* --- Maceta y Dormancia --- */}
            <div className="form-grid grid grid-cols-1 sm:grid-cols-2 sm:gap-4 mt-3 sm:mt-4">
              {/* --- Maceta --- */}
              <div className="form-group mb-0">
                <PotLabel />
                <CustomSelect name="p-pot" options={POT_TYPES} defaultValue={props?.potType || "Plástico"} />
              </div>
              {/* --- Dormancia --- */}
              <div className="form-group mb-0">
                <label>
                  <img src="/icons/common/sleep.svg" width={14} height={14} alt="" className="object-contain inline mr-1" />
                  Dormancia
                </label>
                <CustomSelect name="p-dormancy" options={DORMANCIES} defaultValue={props?.dormancy || "Ninguna"} />
              </div>
            </div>
            {/* --- Guardar o Cancelar --- */}
            <div className="mt-8 space-y-3">
              <div className="modal-actions col-span-2 flex flex-col-reverse items-center justify-center sm:flex-row sm:gap-4">
                <button type="button" className="btn-text text-[var(--danger)] w-full max-w-[220px] sm:w-auto py-2" onClick={handleClose}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary bg-[var(--primary-light)]/15 w-full max-w-[220px] sm:w-auto py-2">
                  {type === "edit-plant" ? "Actualizar" : "Guardar Planta"}
                </button>
              </div>
              <p className="text-center text-sm text-[var(--text-gray)]">Todos los campos con * son obligatorios.</p>
            </div>
          </form>
        )}

        {/* --- MODAL DE AGREGAR/EDITAR PROPAGACIÓN --- */}
        {(type === "add-prop" || type === "edit-prop") && (
          <form method="dialog" onSubmit={handlePropSubmit}>
            <h3>{type === "edit-prop" ? "Editar Propagación" : "Nueva Propagación"}</h3>
            <div className="form-group">
              <label>Planta Madre (Opcional)</label>
              <CustomSelect
                name="prop-parent"
                searchable={true}
                options={[
                  { value: "", label: "-- Sin madre (Independiente) --" },
                  ...plants
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((p) => {
                      const typeInfo = PLANT_TYPES.find((t) => t.value === p.type);
                      return {
                        value: String(p.id),
                        label: p.name,
                        img: typeInfo?.img,
                      };
                    }),
                ]}
                defaultValue={props?.parentId ? String(props.parentId) : ""}
              />
            </div>
            <div className="form-group">
              <label>Nombre Identificador*</label>
              <input type="text" name="prop-name" placeholder="Ej: Esqueje de Pothos" required defaultValue={props?.name || ""} />
            </div>
            <div className="form-grid grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="form-group mb-0">
                <label>Método</label>
                <CustomSelect name="prop-method" options={PROP_METHODS} defaultValue={props?.method || "Agua"} />
              </div>
              <div className="form-group mb-0">
                <label>
                  <img src="/icons/common/calendar.svg" width={14} height={14} alt="" className="object-contain inline mr-1" />
                  Fecha Inicio*
                </label>
                <input
                  type="date"
                  name="prop-start"
                  className="p-2 text-sm sm:text-base"
                  required
                  defaultValue={props?.startDate || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <div className="form-group mt-3 sm:mt-4">
              <label>
                <img src="/icons/common/notes.svg" width={14} height={14} alt="" className="object-contain inline mr-1" />
                Notas
              </label>
              <textarea
                name="prop-notes"
                className="p-2 text-sm sm:text-base"
                placeholder="Condiciones, hormonas, etc."
                defaultValue={props?.notes || ""}
              ></textarea>
            </div>
            <div className="modal-actions flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 mt-6">
              <button type="button" className="btn-text text-[var(--danger)] w-full sm:w-auto py-2" onClick={handleClose}>
                Cancelar
              </button>
              <span className="items-center justify-center text-center text-sm">Todos los campos con * son Obligatorios.</span>
              <button type="submit" className="btn-primary bg-[var(--primary-light)]/15 w-full sm:w-auto py-2">
                {type === "edit-prop" ? "Actualizar" : "Iniciar"}
              </button>
            </div>
          </form>
        )}

        {/* --- MODAL DE AGREGAR/EDITAR DESEO --- */}
        {(type === "add-wish" || type === "edit-wish") && (
          <form method="dialog" onSubmit={handleWishSubmit}>
            <h3>{type === "edit-wish" ? "Editar Deseo" : "Nuevo Deseo"}</h3>
            <div className="form-group">
              <label>¿Qué deseamos?*</label>
              <input
                type="text"
                name="w-name"
                required
                placeholder="Ej: Tijeras, Fertilizante, Monstera..."
                className="p-2 text-sm sm:text-base"
                defaultValue={props?.name || ""}
              />
            </div>
            <div className="form-group">
              <label>Prioridad</label>
              <CustomSelect name="w-priority" options={WISH_PRIORITIES} defaultValue={props?.priority || "Media"} />
            </div>
            <div className="form-group">
              <label>Notas</label>
              <textarea
                name="w-notes"
                className="p-2 text-sm sm:text-base"
                placeholder="Link, precio, lugar..."
                defaultValue={props?.notes || ""}
              ></textarea>
            </div>
            <div className="modal-actions flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 mt-6">
              <button type="button" className="btn-text w-full sm:w-auto py-2" onClick={handleClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary w-full sm:w-auto py-2">
                {type === "edit-wish" ? "Actualizar" : "Añadir"}
              </button>
            </div>
          </form>
        )}

        {/* --- MODAL DE AGREGAR/EDITAR PLAN DE TEMPORADA --- */}
        {(type === "add-season-task" || type === "edit-season-task") && (
          <form method="dialog" onSubmit={handleSeasonTaskSubmit}>
            <h3>{type === "edit-season-task" ? "Editar Plan de Temporada" : "Planear Acción"}</h3>
            <div className="form-group">
              <label>Tipo de Tarea</label>
              <CustomSelect name="st-type" options={SEASON_TASK_TYPES} defaultValue={props?.type || "Otro"} />
            </div>
            <div className="form-group">
              <label>Descripción del Plan*</label>
              <textarea
                name="st-desc"
                required
                className="p-2 text-sm sm:text-base"
                placeholder="Ej: Podar los geranios..."
                defaultValue={props?.desc || ""}
              ></textarea>
            </div>
            <div className="modal-actions flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 mt-6">
              <button type="button" className="btn-text w-full sm:w-auto py-2" onClick={handleClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary w-full sm:w-auto py-2">
                {type === "edit-season-task" ? "Actualizar Plan" : "Guardar Plan"}
              </button>
            </div>
          </form>
        )}

        {/* --- MODAL DE AGREGAR/EDITAR NOTA GLOBAL --- */}
        {(type === "add-note" || type === "edit-note") && (
          <form method="dialog" onSubmit={handleNoteSubmit}>
            <h3>{type === "edit-note" ? "Editar Nota Global" : "Nueva Nota Global"}</h3>
            <div className="form-group">
              <label>Contenido de la nota*</label>
              <textarea
                name="n-content"
                rows={4}
                required
                className="p-2 text-sm sm:text-base"
                placeholder="Ej: Comprar fertilizante orgánico..."
                defaultValue={props?.content || ""}
              ></textarea>
            </div>
            <div className="modal-actions flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 mt-6">
              <button type="button" className="btn-text w-full sm:w-auto py-2" onClick={handleClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary w-full sm:w-auto py-2">
                {type === "edit-note" ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        )}

        {/* --- MODAL DE AGREGAR/EDITAR INSUMO --- */}
        {(type === "add-item" || type === "edit-item") && (
          <form method="dialog" onSubmit={handleItemsubmit}>
            <h3>{type === "edit-item" ? "Editar Insumo" : "Nuevo Insumo"}</h3>
            <div className="form-group">
              <label>Categoría</label>
              <CustomSelect name="i-type" options={INVENTORY_CATEGORIES} defaultValue={props?.cat || "substrates"} />
            </div>
            <div className="form-group">
              <label>Nombre del insumo*</label>
              <input
                type="text"
                name="i-name"
                required
                className="p-2 text-sm sm:text-base"
                placeholder="Ej: Humus de lombriz"
                defaultValue={props?.name || ""}
              />
            </div>
            <div className="form-grid grid grid-cols-2 gap-3 sm:gap-4">
              <div className="form-group mb-0">
                <label>Cantidad</label>
                <input
                  type="number"
                  name="i-qty"
                  step="0.1"
                  required
                  className="p-2 text-sm sm:text-base"
                  defaultValue={props?.qty || "1"}
                />
              </div>
              <div className="form-group mb-0">
                <label>Unidad</label>
                <CustomSelect name="i-unit" options={INVENTORY_UNITS} defaultValue={props?.unit || "L"} />
              </div>
            </div>
            <div className="modal-actions flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 mt-6">
              <button type="button" className="btn-text w-full sm:w-auto py-2" onClick={handleClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary w-full sm:w-auto py-2">
                {type === "edit-item" ? "Actualizar" : "Añadir"}
              </button>
            </div>
          </form>
        )}

        {/* --- MODAL DE CONFIRMACIÓN --- */}
        {type === "confirm" && (
          <div style={{ textAlign: "center" }}>
            <h3 className="text-2xl font-bold text-[var(--text)]">{props?.title || "¿Estás seguro?"}</h3>
            <p className="my-4 text-base font-medium leading-relaxed text-[var(--text)]">{props?.message}</p>
            <div className="modal-actions" style={{ justifyContent: "center" }}>
              <button type="button" className="btn-secondary" onClick={handleClose}>
                Cancelar
              </button>
              <button
                type="button"
                className={props?.confirmClass === "secondary" ? "btn-warning" : "btn-danger"}
                onClick={() => {
                  props?.onConfirm();
                  handleClose();
                }}
              >
                {props?.confirmText || "Confirmar"}
              </button>
            </div>
          </div>
        )}

        {type === "import-choice" && (
          <div style={{ textAlign: "center" }}>
            <h3>
              <img src="/icons/common/warning.svg" width={18} height={18} alt="" className="object-contain inline mr-2" />
              Resolución de Conflicto
            </h3>
            <p style={{ margin: "1rem 0", color: "var(--text-gray)", textAlign: "left", fontSize: "0.9rem", lineHeight: "1.4" }}>
              {props?.message}
            </p>
            <div className="modal-actions" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button
                type="button"
                className="btn-primary"
                style={{ background: "var(--secondary)", width: "100%" }}
                onClick={() => {
                  mergeData(props.data);
                  handleClose();
                }}
              >
                Unificar Datos (Mezclar ambos)
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
                Sobreescribir (Usar solo archivo)
              </button>
              <button type="button" className="btn-text" onClick={handleClose} style={{ width: "100%" }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* --- MODAL DE INFO --- */}
        {type === "info" && (
          <div style={{ textAlign: "center" }}>
            <h3>{props?.title || "¡Logrado!"}</h3>
            <p style={{ margin: "1rem 0", color: "var(--text-gray)" }}>{props?.message}</p>
            <div className="modal-actions" style={{ justifyContent: "center" }}>
              <button type="button" className="btn-primary" onClick={handleClose}>
                Entendido
              </button>
            </div>
          </div>
        )}

        {type === "admin-premium" && <AdminPremiumModal props={props} handleClose={handleClose} />}

        {type === "admin-master" && (
          <div style={{ textAlign: "center" }}>
            <h3>Gestionar Rango {configProject.plans.MASTER.label}</h3>
            <p className="my-4 text-sm text-[var(--text-gray)]">
              Usuario: <strong>{props?.userName}</strong>
            </p>
            <div className="flex flex-col gap-3">
              {props?.currentRole === configProject.plans.MASTER.id ? (
                <button
                  className="btn-primary bg-[var(--danger)] w-full py-3"
                  onClick={() => {
                    props?.onConfirm({ role: "user" });
                    handleClose();
                  }}
                >
                  Quitar Rango {configProject.plans.MASTER.label}
                </button>
              ) : (
                <button
                  className="btn-primary bg-[var(--secondary)] w-full py-3"
                  onClick={() => {
                    props?.onConfirm({ role: configProject.plans.MASTER.id });
                    handleClose();
                  }}
                >
                  Subir a {configProject.plans.MASTER.label}
                </button>
              )}
              <button className="btn-text w-full" onClick={handleClose}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {type === "import-select" && (
          <ImportSelectionModal incomingData={props.data} mode={props.mode} />
        )}

        {type === "calendar" && (
          <form method="dialog" onSubmit={handleCalendarSubmit}>
            <h3>
              <img src="/icons/common/calendar.svg" width={18} height={18} alt="" className="object-contain inline mr-2" />
              Recordatorio Google
            </h3>
            <div className="form-group">
              <label>Título*</label>
              <input type="text" name="cal-title" required defaultValue={props?.title || ""} />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea name="cal-desc" defaultValue={props?.desc || ""}></textarea>
            </div>
            <div className="form-group">
              <label>Fecha*</label>
              <input type="date" name="cal-date" required defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-text" onClick={handleClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                Añadir
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
