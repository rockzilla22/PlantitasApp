import { atom, map } from "nanostores";
import { Plant, PlantLog } from "@/core/plant/domain/Plant";
import { Propagation } from "@/core/nursery/domain/Propagation";
import { InventoryItem, InventoryCategory } from "@/core/inventory/domain/InventoryItem";
import { SeasonTask, Season } from "@/core/season/domain/SeasonTask";
import { WishlistItem } from "@/core/wishlist/domain/WishlistItem";
import { GlobalNote } from "@/core/notes/domain/GlobalNote";
import { triggerExportFlash, setDirty } from "./uiStore";
import { $user, $syncStatus } from "./authStore";
import { hasPremium, syncToSupabase, loadFromSupabase } from "@/libs/syncService";

export interface AppData {
  plants: Plant[];
  propagations: Propagation[];
  inventory: Record<InventoryCategory, InventoryItem[]>;
  seasonalTasks: Record<Season, SeasonTask[]>;
  wishlist: WishlistItem[];
  globalNotes: GlobalNote[];
}

const initialData: AppData = {
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
            substrates: dedupeByName(inv.substrates),
            fertilizers: dedupeByName(inv.fertilizers),
            powders: dedupeByName(inv.powders),
            liquids: dedupeByName(inv.liquids),
            meds: dedupeByName(inv.meds),
            others: dedupeByName(inv.others),
        },
        plants: (d.plants || []).map((p: any) => ({
            ...p,
            icon: p.icon || '🌿',
            type: p.type || 'Planta',
            location: p.location || 'No especificada',
            light: p.light || 'Media',
            potType: p.potType || 'Plástico',
            dormancy: p.dormancy || 'Ninguna',
            logs: (p.logs || []).map((l: any) => ({
                ...l,
                actionType: l.actionType === 'Initial' ? 'Registro Nuevo' : l.actionType
            }))
        })),
        globalNotes: d.globalNotes || [],
        propagations: (d.propagations || []).map((pr: any) => ({
            ...pr,
            status: pr.status || 'Activo',
            notes: pr.notes || ''
        })),
        wishlist: (d.wishlist || []).map((w: any) => ({
            id: w.id,
            name: w.name || "Sin nombre",
            priority: w.priority || "Media",
            notes: w.notes || ""
        })),
        seasonalTasks: {
            Primavera: dedupeSeasonTasks(rawSeasonal.Primavera),
            Verano:    dedupeSeasonTasks(rawSeasonal.Verano),
            Otoño:     dedupeSeasonTasks(rawSeasonal.Otoño),
            Invierno:  dedupeSeasonTasks(rawSeasonal.Invierno),
        },
    };
};

export const $store = map<AppData>(initialData);
export const $selectedPlantId = atom<number | null>(null);

// Flag que evita que $store.listen → saveData → syncToSupabase
// se dispare durante una carga (loop infinito)
let _isLoading = false;
let _syncTimeout: NodeJS.Timeout | null = null;

export const loadData = async () => {
  if (typeof window === "undefined") return;

  _isLoading = true;

  // Carga local primero (respuesta instantánea)
  const saved = localStorage.getItem("plantitas_db");
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
        .then(() => $syncStatus.set("synced"))
        .catch(() => $syncStatus.set("error"))
        .finally(() => { _syncTimeout = null; });
    }, 2000); 
  }
};

$store.listen((value) => {
  saveData(value);
});

export const addPlant = (plant: Omit<Plant, "id" | "logs">) => {
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
    catItems.push({ name, qty, unit } as any);
  }
  
  $store.setKey("inventory", { ...data.inventory, [category]: catItems });
  setDirty(true);
};

export const updateItemQty = (category: InventoryCategory, index: number, delta: number) => {
  const data = $store.get();
  const catItems = [...data.inventory[category]];
  if (catItems[index]) {
    catItems[index] = { ...catItems[index], qty: Math.max(0, catItems[index].qty + delta) };
    $store.setKey("inventory", { ...data.inventory, [category]: catItems });
    setDirty(true);
  }
};

export const removeInventoryItem = (category: InventoryCategory, index: number) => {
  const data = $store.get();
  const catItems = data.inventory[category].filter((_, i) => i !== index);
  $store.setKey("inventory", { ...data.inventory, [category]: catItems });
  setDirty(true);
};

export const addNote = (content: string) => {
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

export const mergeData = (incomingData: any) => {
  const incoming = normalizeData(incomingData);
  const data = $store.get();
  
  const mergeById = (local: any[], imported: any[]) => {
    const map = new Map();
    local.forEach(item => map.set(item.id, item));
    imported.forEach(item => map.set(item.id, item));
    return Array.from(map.values());
  };

  const mergeInventory = (local: any, imported: any) => {
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
