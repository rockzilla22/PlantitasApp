import { atom, map } from "nanostores";
import { Plant, PlantLog } from "@/core/plant/domain/Plant";
import { Propagation } from "@/core/nursery/domain/Propagation";
import { InventoryItem, InventoryCategory } from "@/core/inventory/domain/InventoryItem";
import { SeasonTask, Season } from "@/core/season/domain/SeasonTask";
import { WishlistItem } from "@/core/wishlist/domain/WishlistItem";
import { GlobalNote } from "@/core/notes/domain/GlobalNote";
import { triggerExportFlash, setDirty } from "./uiStore";
import { $user, $syncStatus, $lastSyncTime } from "./authStore";
import { hasPremium, getEffectiveMaxSlots, syncToSupabase, loadFromSupabase } from "@/libs/syncService";
import { sanitizeString } from "@/libs/utils";

export interface AppData {
  plants: Plant[];
  propagations: Propagation[];
  inventory: Record<InventoryCategory, InventoryItem[]>;
  seasonalTasks: Record<Season, SeasonTask[]>;
  wishlist: WishlistItem[];
  globalNotes: GlobalNote[];
}

export const initialData: AppData = {
  plants: [],
  propagations: [],
  inventory: {
    substrates: [],
    fertilizers: [],
    powders: [],
    liquids: [],
    meds: [],
    others: [],
  },
  seasonalTasks: {
    Primavera: [],
    Verano: [],
    Otoño: [],
    Invierno: [],
  },
  wishlist: [],
  globalNotes: [],
};

const dedupeByName = (items: any[]): any[] => {
    const seen = new Map<string, any>();
    (items || []).forEach(item => {
        if (!seen.has(item.name)) {
            seen.set(item.name, { ...item });
        } else {
            seen.get(item.name)!.qty = Math.max(seen.get(item.name)!.qty, item.qty);
        }
    });
    return Array.from(seen.values());
};

const dedupeSeasonTasks = (tasks: any[]): any[] => {
    const seen = new Set<string>();
    return (tasks || []).filter(t => {
        const key = `${t.type}|${t.desc}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

export const normalizeData = (d: any): AppData => {
    const inv = d.inventory || {};
    const rawSeasonal = d.seasonalTasks || { Primavera: [], Verano: [], Otoño: [], Invierno: [] };
    return {
        inventory: {
            substrates: dedupeByName(inv.substrates).map(i => ({ ...i, name: sanitizeString(i.name) })),
            fertilizers: dedupeByName(inv.fertilizers).map(i => ({ ...i, name: sanitizeString(i.name) })),
            powders: dedupeByName(inv.powders).map(i => ({ ...i, name: sanitizeString(i.name) })),
            liquids: dedupeByName(inv.liquids).map(i => ({ ...i, name: sanitizeString(i.name) })),
            meds: dedupeByName(inv.meds).map(i => ({ ...i, name: sanitizeString(i.name) })),
            others: dedupeByName(inv.others).map(i => ({ ...i, name: sanitizeString(i.name) })),
        },
        plants: (d.plants || []).map((p: any) => ({
            ...p,
            name: sanitizeString(p.name || ""),
            subtype: sanitizeString(p.subtype || ""),
            icon: p.icon || '/icons/environment/plants/generic.svg',
            type: p.type || 'Planta',
            location: sanitizeString(p.location || 'No especificada'),
            light: p.light || 'Media',
            potType: p.potType || 'Plástico',
            dormancy: p.dormancy || 'Ninguna',
            logs: (p.logs || []).map((l: any) => ({
                ...l,
                detail: sanitizeString(l.detail || ""),
                actionType: l.actionType === 'Initial' ? 'Registro Nuevo' : l.actionType
            }))
        })),
        globalNotes: (d.globalNotes || []).map((n: any) => ({ ...n, content: sanitizeString(n.content || "") })),
        propagations: (d.propagations || []).map((pr: any) => ({
            ...pr,
            name: sanitizeString(pr.name || ""),
            status: pr.status || 'Activo',
            notes: sanitizeString(pr.notes || '')
        })),
        wishlist: (d.wishlist || []).map((w: any) => ({
            id: w.id,
            name: sanitizeString(w.name || "Sin nombre"),
            priority: w.priority || "Media",
            notes: sanitizeString(w.notes || "")
        })),
        seasonalTasks: {
            Primavera: dedupeSeasonTasks(rawSeasonal.Primavera).map(t => ({ ...t, desc: sanitizeString(t.desc || "") })),
            Verano:    dedupeSeasonTasks(rawSeasonal.Verano).map(t => ({ ...t, desc: sanitizeString(t.desc || "") })),
            Otoño:     dedupeSeasonTasks(rawSeasonal.Otoño).map(t => ({ ...t, desc: sanitizeString(t.desc || "") })),
            Invierno:  dedupeSeasonTasks(rawSeasonal.Invierno).map(t => ({ ...t, desc: sanitizeString(t.desc || "") })),
        },
    };
};

export const $store = map<AppData>(initialData);
export const $selectedPlantId = atom<number | null>(null);
export const $trashCount = atom<number>(0);

/**
 * EL MURO: Verifica si el usuario alcanzó el límite de su plan antes de añadir nuevos items.
 */
export const checkCapLimit = (): boolean => {
  const data = $store.get();
  const user = $user.get();

  const invCount = Object.values(data.inventory).reduce((sum: number, arr: any[]) => sum + arr.length, 0);
  const seasonCount = Object.values(data.seasonalTasks).reduce((sum: number, arr: any[]) => sum + arr.length, 0);
  const activeSlots = data.plants.length + data.propagations.length + data.wishlist.length + data.globalNotes.length + invCount + seasonCount;
  const usedSlots = activeSlots + $trashCount.get();

  const maxSlots = getEffectiveMaxSlots(user);
  
  if (usedSlots >= maxSlots) {
    openModal("confirm", {
      title: "Límite de Almacenamiento Alcanzado",
      message: `Has alcanzado el límite de ${maxSlots} elementos de tu plan actual. Para seguir añadiendo, borra elementos de la papelera o actualizá tu plan.`,
      confirmText: "Ver Planes",
      onConfirm: () => {
        window.open("/pricing", "_blank");
      }
    });
    return false;
  }
  return true;
};

// Flag que evita que $store.listen → saveData → syncToSupabase
// se dispare durante una carga (loop infinito)
let _isLoading = false;
let _syncTimeout: NodeJS.Timeout | null = null;

export const loadData = async () => {
  if (typeof window === "undefined") return;

  _isLoading = true;

  // Carga local primero (respuesta instantánea)
  const saved = localStorage.getItem("plantitas_db");
  const lastSync = localStorage.getItem("plantitas_last_sync");
  if (lastSync) $lastSyncTime.set(lastSync);

  if (saved) {
    try {
      $store.set(normalizeData(JSON.parse(saved)));
    } catch (e) {
      console.error("Error loading data:", e);
    }
  }

  // Si es premium, sobreescribe con datos de Supabase
  const user = $user.get();
  if (hasPremium(user) && user) {
    $syncStatus.set("syncing");
    try {
      const remoteData = await loadFromSupabase(user.id);
      if (remoteData) {
        // Marcamos como cargando para que el set no gatille un saveData -> sync
        _isLoading = true; 
        $store.set(remoteData);
        localStorage.setItem("plantitas_db", JSON.stringify(remoteData));
        const now = new Date().toISOString();
        $lastSyncTime.set(now);
        localStorage.setItem("plantitas_last_sync", now);
        $syncStatus.set("synced");
      } else {
        $syncStatus.set("idle");
      }
    } catch {
      $syncStatus.set("error");
    }
  }

  _isLoading = false;
  setDirty(false);
};

export const saveData = (data: AppData) => {
  if (typeof window === "undefined" || _isLoading) return;

  // Guardado local es inmediato
  localStorage.setItem("plantitas_db", JSON.stringify(data));

  // Sincronización remota con DEBOUNCE (esperamos 2 segundos de inactividad)
  const user = $user.get();
  if (hasPremium(user) && user) {
    if (_syncTimeout) clearTimeout(_syncTimeout);
    
    $syncStatus.set("syncing");
    
    _syncTimeout = setTimeout(() => {
      syncToSupabase(data, user.id)
        .then(() => {
          const now = new Date().toISOString();
          $lastSyncTime.set(now);
          localStorage.setItem("plantitas_last_sync", now);
          $syncStatus.set("synced");
        })
        .catch(() => $syncStatus.set("error"))
        .finally(() => { _syncTimeout = null; });
    }, 5000);
  }
};

export const forceSync = async () => {
  const user = $user.get();
  if (!user || !hasPremium(user)) return;

  if (_syncTimeout) clearTimeout(_syncTimeout);
  $syncStatus.set("syncing");

  try {
    await syncToSupabase($store.get(), user.id);
    const now = new Date().toISOString();
    $lastSyncTime.set(now);
    localStorage.setItem("plantitas_last_sync", now);
    $syncStatus.set("synced");
  } catch (err) {
    console.error("Force sync error:", err);
    $syncStatus.set("error");
  }
};

$store.listen((value) => {
  saveData(value);
});

export const addPlant = (plant: Omit<Plant, "id" | "logs">) => {
  if (!checkCapLimit()) return;
  const id = Date.now();
  const newPlant: Plant = {
    ...plant,
    id,
    logs: [{ id: Date.now(), date: new Date().toISOString().split("T")[0], actionType: "Registro Nuevo", detail: "Añadida" }],
  };
  $store.setKey("plants", [...$store.get().plants, newPlant]);
  $selectedPlantId.set(id);
  setDirty(true);
};

export const removePlant = (id: number) => {
  $store.setKey("plants", $store.get().plants.filter(p => p.id !== id));
  if ($selectedPlantId.get() === id) $selectedPlantId.set(null);
  setDirty(true);
};

export const updatePlant = (id: number, plant: Partial<Plant>) => {
  const plants = $store.get().plants.map(p => p.id === id ? { ...p, ...plant } : p);
  $store.setKey("plants", plants);
  setDirty(true);
};

export const addPlantLog = (plantId: number, log: Omit<PlantLog, "id">) => {
  const data = $store.get();
  const plants = data.plants.map(p => {
    if (p.id === plantId) {
      const newLog = { ...log, id: Date.now() };
      const updatedLogs = [...p.logs, newLog];
      let lastWateredDate = p.lastWateredDate;
      if (log.actionType === "Riego") lastWateredDate = log.date;
      return { ...p, logs: updatedLogs, lastWateredDate };
    }
    return p;
  });
  $store.setKey("plants", plants);
  setDirty(true);
};

export const updatePlantLog = (plantId: number, logId: number, log: Partial<PlantLog>) => {
  const data = $store.get();
  const plants = data.plants.map(p => {
    if (p.id === plantId) {
      const updatedLogs = p.logs.map(l => l.id === logId ? { ...l, ...log } : l);
      // Recalculamos el último riego por si cambió la fecha o el tipo del log editado
      const riegos = updatedLogs
        .filter(l => l.actionType === "Riego")
        .sort((a, b) => b.date.localeCompare(a.date));
      const lastWateredDate = riegos.length > 0 ? riegos[0].date : "";
      return { ...p, logs: updatedLogs, lastWateredDate };
    }
    return p;
  });
  $store.setKey("plants", plants);
  setDirty(true);
};

export const removePlantLog = (plantId: number, logId: number) => {
  const data = $store.get();
  const plants = data.plants.map(p => {
    if (p.id === plantId) {
      const updatedLogs = p.logs.filter(l => l.id !== logId);
      const riegos = updatedLogs.filter(l => l.actionType === "Riego").sort((a, b) => b.date.localeCompare(a.date));
      const lastWateredDate = riegos.length > 0 ? riegos[0].date : "";
      return { ...p, logs: updatedLogs, lastWateredDate };
    }
    return p;
  });
  $store.setKey("plants", plants);
  setDirty(true);
};

export const addPropagation = (prop: Omit<Propagation, "id" | "status">) => {
  if (!checkCapLimit()) return;
  const newProp: Propagation = { ...prop, id: Date.now(), status: "Activo" };
  $store.setKey("propagations", [...$store.get().propagations, newProp]);
  setDirty(true);
};

export const updatePropStatus = (id: number, status: Propagation["status"]) => {
  const props = $store.get().propagations.map(p => p.id === id ? { ...p, status } : p);
  $store.setKey("propagations", props);
  setDirty(true);
};

export const removeProp = (id: number) => {
  $store.setKey("propagations", $store.get().propagations.filter(p => p.id !== id));
  setDirty(true);
};

export const updatePropagation = (id: number, prop: Partial<Propagation>) => {
  const props = $store.get().propagations.map(p => p.id === id ? { ...p, ...prop } : p);
  $store.setKey("propagations", props);
  setDirty(true);
};

export const updateInventoryItem = (category: InventoryCategory, name: string, qty: number, unit: any) => {
  const data = $store.get();
  const catItems = [...data.inventory[category]];
  const index = catItems.findIndex(i => i.name === name);
  
  if (index >= 0) {
    catItems[index] = { ...catItems[index], qty, unit };
  } else {
    if (!checkCapLimit()) return;
    catItems.push({ name, qty, unit } as any);
  }
  
  $store.setKey("inventory", { ...data.inventory, [category]: catItems });
  setDirty(true);
};

export const updateItemQty = (category: InventoryCategory, name: string, delta: number) => {
  const data = $store.get();
  const catItems = [...data.inventory[category]];
  const index = catItems.findIndex(i => i.name === name);
  if (index >= 0) {
    catItems[index] = { ...catItems[index], qty: Math.max(0, catItems[index].qty + delta) };
    $store.setKey("inventory", { ...data.inventory, [category]: catItems });
    setDirty(true);
  }
};

export const removeInventoryItem = (category: InventoryCategory, name: string) => {
  const data = $store.get();
  const catItems = data.inventory[category].filter(i => i.name !== name);
  $store.setKey("inventory", { ...data.inventory, [category]: catItems });
  setDirty(true);
};

export const addNote = (content: string) => {
  if (!checkCapLimit()) return;
  const newNote: GlobalNote = { id: Date.now(), content };
  $store.setKey("globalNotes", [...$store.get().globalNotes, newNote]);
  setDirty(true);
};

export const removeNote = (id: number) => {
  $store.setKey("globalNotes", $store.get().globalNotes.filter(n => n.id !== id));
  setDirty(true);
};

export const updateNote = (id: number, content: string) => {
  const globalNotes = $store.get().globalNotes.map(n => n.id === id ? { ...n, content } : n);
  $store.setKey("globalNotes", globalNotes);
  setDirty(true);
};

export const addWish = (name: string, priority: WishlistItem["priority"], notes: string) => {
  if (!checkCapLimit()) return;
  const newWish: WishlistItem = { id: Date.now(), name, priority, notes };
  $store.setKey("wishlist", [...$store.get().wishlist, newWish]);
  setDirty(true);
};

export const removeWish = (id: number) => {
  $store.setKey("wishlist", $store.get().wishlist.filter(w => w.id !== id));
  setDirty(true);
};

export const updateWish = (id: number, wish: Partial<WishlistItem>) => {
  const wishlist = $store.get().wishlist.map(w => w.id === id ? { ...w, ...wish } : w);
  $store.setKey("wishlist", wishlist);
  setDirty(true);
};

export const addSeasonTask = (season: Season, type: SeasonTask["type"], desc: string) => {
  if (!checkCapLimit()) return;
  const data = $store.get();
  const tasks = [...(data.seasonalTasks[season] || [])];
  tasks.push({ type, desc } as any);
  $store.setKey("seasonalTasks", { ...data.seasonalTasks, [season]: tasks });
  setDirty(true);
};

export const removeSeasonTask = (season: Season, index: number) => {
  const data = $store.get();
  const tasks = data.seasonalTasks[season].filter((_, i) => i !== index);
  $store.setKey("seasonalTasks", { ...data.seasonalTasks, [season]: tasks });
  setDirty(true);
};

export const updateSeasonTask = (season: Season, index: number, task: Partial<SeasonTask>) => {
  const data = $store.get();
  const tasks = [...data.seasonalTasks[season]];
  tasks[index] = { ...tasks[index], ...task };
  $store.setKey("seasonalTasks", { ...data.seasonalTasks, [season]: tasks });
  setDirty(true);
};

export const setStoreData = (rawData: any) => {
  $store.set(normalizeData(rawData));
  setDirty(false);
};

const mergeById = (local: any[], imported: any[]) => {
  const map = new Map();
  local.forEach(item => map.set(item.id, item));
  imported.forEach(item => map.set(item.id, item));
  return Array.from(map.values());
};

export const mergeInventory = (local: any, imported: any) => {
  const result = JSON.parse(JSON.stringify(local));
  for (const cat in imported) {
    if (!result[cat]) result[cat] = [];
    imported[cat].forEach((impItem: any) => {
      const localItem = result[cat].find((l: any) => l.name === impItem.name);
      if (localItem) {
        localItem.qty = Math.max(localItem.qty, impItem.qty);
      } else {
        result[cat].push(impItem);
      }
    });
  }
  return result;
};

export interface ImportSelectItem {
  id: number;
  label: string;
  category: "Planta" | "Propagación" | "Nota" | "Wishlist";
}

export const mergeDataSelective = (incomingData: any, selectedIds: Set<number>) => {
  const incoming = normalizeData(incomingData);
  const data = $store.get();

  const mergeByIdFiltered = (local: any[], imported: any[]) => {
    const map = new Map();
    local.forEach(item => map.set(item.id, item));
    imported.filter(i => selectedIds.has(i.id)).forEach(item => map.set(item.id, item));
    return Array.from(map.values());
  };

  $store.set({
    plants: mergeByIdFiltered(data.plants, incoming.plants),
    propagations: mergeByIdFiltered(data.propagations, incoming.propagations),
    globalNotes: mergeByIdFiltered(data.globalNotes, incoming.globalNotes),
    wishlist: mergeByIdFiltered(data.wishlist, incoming.wishlist),
    inventory: mergeInventory(data.inventory, incoming.inventory),
    seasonalTasks: incoming.seasonalTasks,
  });
  setDirty(false);
};

export const mergeData = (incomingData: any) => {
  const incoming = normalizeData(incomingData);
  const data = $store.get();

  $store.set({
    plants: mergeById(data.plants, incoming.plants),
    propagations: mergeById(data.propagations, incoming.propagations),
    globalNotes: mergeById(data.globalNotes, incoming.globalNotes),
    wishlist: mergeById(data.wishlist, incoming.wishlist),
    inventory: mergeInventory(data.inventory, incoming.inventory),
    seasonalTasks: incoming.seasonalTasks,
  });
  setDirty(false);
};
