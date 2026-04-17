"use client";

import { useStore } from "@nanostores/react";
import { $activeModal, closeModal } from "@/store/modalStore";
import { useEffect, useRef, useState } from "react";
import { addPlant, $store, addPropagation, addWish, addNote, updateInventoryItem, addSeasonTask, updatePlant, updatePropagation, updateWish, updateSeasonTask, updateNote, mergeData, setStoreData } from "@/store/plantStore";
import { InventoryCategory } from "@/core/inventory/domain/InventoryItem";
import { PotLabel } from "@/components/ui/PotLabel";
import {
  DORMANCIES,
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
  LIGHT_LEVELS,
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

export function Modals() {
  const { type, props } = useStore($activeModal);
  const { plants } = useStore($store);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (type && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (dialogRef.current) {
      dialogRef.current.close();
    }
  }, [type]);

  const handleClose = () => {
    closeModal();
  };

  const [plantType, setPlantType] = useState("🌿|Planta");

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

    const data = {
      name: fd.get("p-name") as string,
      icon,
      type: typeLabel,
      location: (fd.get("p-location") as string) || "No especificada",
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
    updateInventoryItem(
      fd.get("i-type") as InventoryCategory,
      fd.get("i-name") as string,
      parseFloat(fd.get("i-qty") as string),
      fd.get("i-unit") as string
    );
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
            </div>
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <div className="form-group"><label>📍 Ubicación</label><input type="text" name="p-location" defaultValue={props?.location || ""} /></div>
              <div className="form-group">
                <label>☀️ Luz</label>
                <select name="p-light" defaultValue={props?.light || "Media"}>
                  {renderOptions(LIGHT_LEVELS)}
                </select>
              </div>
            </div>
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <div className="form-group">
                <PotLabel />
                <select name="p-pot" defaultValue={props?.potType || "Plástico"}>
                  {renderOptions(POT_TYPES)}
                </select>
              </div>
              <div className="form-group">
                <label>💤 Dormancia</label>
                <select name="p-dormancy" defaultValue={props?.dormancy || "Ninguna"}>
                  {renderOptions(DORMANCIES)}
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-text" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="btn-primary">{type === "edit-plant" ? "Actualizar" : "Guardar Planta"}</button>
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
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <div className="form-group">
                <label>Método</label>
                <select name="prop-method" defaultValue={props?.method || "Agua"}>
                  {renderOptions(PROP_METHODS)}
                </select>
              </div>
              <div className="form-group">
                <label>📅 Fecha Inicio (obligatorio)</label>
                <input type="date" name="prop-start" required defaultValue={props?.startDate || new Date().toISOString().split('T')[0]} />
              </div>
            </div>
            <div className="form-group"><label>📝 Notas</label><textarea name="prop-notes" placeholder="Condiciones, hormonas, etc." defaultValue={props?.notes || ""}></textarea></div>
            <div className="modal-actions">
              <button type="button" className="btn-text" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="btn-primary">{type === "edit-prop" ? "Actualizar" : "Iniciar"}</button>
            </div>
          </form>
        )}

        {(type === "add-wish" || type === "edit-wish") && (
          <form method="dialog" onSubmit={handleWishSubmit}>
            <h3>{type === "edit-wish" ? "✏️ Editar Deseo" : "✨ Nuevo Deseo"}</h3>
            <div className="form-group">
              <label>¿Qué deseamos? (obligatorio)</label>
              <input type="text" name="w-name" required placeholder="Ej: Tijeras, Fertilizante, Monstera..." defaultValue={props?.name || ""} />
            </div>
            <div className="form-group">
              <label>Prioridad</label>
              <select name="w-priority" defaultValue={props?.priority || "Media"}>
                {renderOptions(WISH_PRIORITIES)}
              </select>
            </div>
            <div className="form-group"><label>📝 Notas</label><textarea name="w-notes" placeholder="Link, precio, lugar..." defaultValue={props?.notes || ""}></textarea></div>
            <div className="modal-actions">
              <button type="button" className="btn-text" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="btn-primary">{type === "edit-wish" ? "Actualizar" : "Añadir"}</button>
            </div>
          </form>
        )}

        {(type === "add-season-task" || type === "edit-season-task") && (
          <form method="dialog" onSubmit={handleSeasonTaskSubmit}>
            <h3>{type === "edit-season-task" ? "✏️ Editar Plan de Temporada" : "📅 Planear Acción"}</h3>
            <div className="form-group">
              <label>Tipo de Tarea</label>
              <select name="st-type" defaultValue={props?.type || "Otro"}>
                {renderOptions(SEASON_TASK_TYPES)}
              </select>
            </div>
            <div className="form-group">
              <label>Descripción del Plan (obligatorio)</label>
              <textarea name="st-desc" required placeholder="Ej: Podar los geranios..." defaultValue={props?.desc || ""}></textarea>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-text" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="btn-primary">{type === "edit-season-task" ? "Actualizar Plan" : "Guardar Plan"}</button>
            </div>
          </form>
        )}

        {(type === "add-note" || type === "edit-note") && (
          <form method="dialog" onSubmit={handleNoteSubmit}>
            <h3>{type === "edit-note" ? "✏️ Editar Nota Global" : "📝 Nueva Nota Global"}</h3>
            <div className="form-group">
              <label>Contenido de la nota (obligatorio)</label>
              <textarea name="n-content" rows={4} required placeholder="Ej: Comprar fertilizante orgánico..." defaultValue={props?.content || ""}></textarea>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-text" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="btn-primary">{type === "edit-note" ? "Actualizar" : "Guardar"}</button>
            </div>
          </form>
        )}

        {(type === "add-item" || type === "edit-item") && (
          <form method="dialog" onSubmit={handleItemSubmit}>
            <h3>{type === "edit-item" ? "✏️ Editar Insumo" : "📦 Nuevo Insumo"}</h3>
            <div className="form-group">
              <label>Categoría</label>
              <select name="i-type" defaultValue={props?.cat || "substrates"}>
                {renderOptions(INVENTORY_CATEGORIES)}
              </select>
            </div>
            <div className="form-group">
              <label>Nombre del insumo (obligatorio)</label>
              <input type="text" name="i-name" required placeholder="Ej: Humus de lombriz" defaultValue={props?.name || ""} />
            </div>
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <div className="form-group">
                <label>Cantidad (obligatorio)</label>
                <input type="number" name="i-qty" step="0.1" required defaultValue={props?.qty || "1"} />
              </div>
              <div className="form-group">
                <label>Unidad</label>
                <select name="i-unit" defaultValue={props?.unit || "L"}>
                  {renderOptions(INVENTORY_UNITS)}
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-text" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="btn-primary">{type === "edit-item" ? "Actualizar" : "Añadir"}</button>
            </div>
          </form>
        )}

        {type === "import-choice" && (
          <div style={{ textAlign: "center" }}>
            <h3>⚠️ Resolución de Conflicto</h3>
            <p style={{ margin: "1rem 0", color: "var(--text-light)", textAlign: "left", fontSize: "0.9rem", lineHeight: "1.4" }}>
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
                onClick={() => { setStoreData(props.data); handleClose(); }}
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
            <p style={{ margin: "1rem 0", color: "var(--text-light)" }}>{props?.message}</p>
            <div className="modal-actions" style={{ justifyContent: "center" }}>
              <button type="button" className="btn-primary" onClick={handleClose}>Entendido</button>
            </div>
          </div>
        )}

        {type === "confirm" && (
          <div style={{ textAlign: "center" }}>
            <h3>{props?.title || "¿Estás seguro?"}</h3>
            <p style={{ margin: "1rem 0", color: "var(--text-light)" }}>{props?.message}</p>
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
