import { supabaseBrowser } from "./db";
import type { AppData } from "@/store/plantStore";
import type { User } from "@supabase/supabase-js";

export type PlanLevel = "Sin cuenta" | "Usuario" | "Premium" | "Master Admin";

export function hasPremium(user: User | null): boolean {
  if (!user) return false;
  return (
    user.app_metadata?.role === "master_admin" ||
    !!user.app_metadata?.has_access
  );
}

export function getPlanLevel(user: User | null): PlanLevel {
  if (!user) return "Sin cuenta";
  if (user.app_metadata?.role === "master_admin") return "Master Admin";
  if (user.app_metadata?.has_access) return "Premium";
  return "Usuario";
}

export async function syncToSupabase(data: AppData, userId: string): Promise<void> {
  const sb = supabaseBrowser();

  // Plants — upsert + delete orphans
  const plantRows = data.plants.map((p) => ({
    id: p.id,
    user_id: userId,
    icon: p.icon,
    type: p.type,
    name: p.name,
    last_watered_date: p.lastWateredDate || null,
    location: p.location,
    light: p.light,
    pot_type: p.potType,
    dormancy: p.dormancy,
  }));
  if (plantRows.length > 0) {
    await sb.from("plants").upsert(plantRows, { onConflict: "id" });
  }
  const plantIds = data.plants.map((p) => p.id);
  if (plantIds.length > 0) {
    await sb.from("plants").update({ deleted_at: new Date().toISOString() }).eq("user_id", userId).not("id", "in", `(${plantIds.join(",")})`).is("deleted_at", null);
  } else {
    await sb.from("plants").update({ deleted_at: new Date().toISOString() }).eq("user_id", userId).is("deleted_at", null);
  }

  // Plant logs — upsert + delete orphans
  const logRows = data.plants.flatMap((p) =>
    p.logs.map((l) => ({
      id: l.id,
      user_id: userId,
      plant_id: p.id,
      date: l.date,
      action_type: l.actionType,
      detail: l.detail,
    }))
  );
  if (logRows.length > 0) {
    await sb.from("plant_logs").upsert(logRows, { onConflict: "id" });
  }
  const logIds = logRows.map((l) => l.id);
  if (logIds.length > 0) {
    await sb.from("plant_logs").update({ deleted_at: new Date().toISOString() }).eq("user_id", userId).not("id", "in", `(${logIds.join(",")})`).is("deleted_at", null);
  } else {
    await sb.from("plant_logs").update({ deleted_at: new Date().toISOString() }).eq("user_id", userId).is("deleted_at", null);
  }

  // Propagations — upsert + delete orphans
  const propRows = data.propagations.map((p) => ({
    id: p.id,
    user_id: userId,
    parent_id: p.parentId ?? null,
    name: p.name,
    method: p.method,
    start_date: p.startDate,
    status: p.status,
    notes: p.notes,
  }));
  if (propRows.length > 0) {
    await sb.from("propagations").upsert(propRows, { onConflict: "id" });
  }
  const propIds = data.propagations.map((p) => p.id);
  if (propIds.length > 0) {
    await sb.from("propagations").update({ deleted_at: new Date().toISOString() }).eq("user_id", userId).not("id", "in", `(${propIds.join(",")})`).is("deleted_at", null);
  } else {
    await sb.from("propagations").update({ deleted_at: new Date().toISOString() }).eq("user_id", userId).is("deleted_at", null);
  }

  // Inventory — full replace (no client-side IDs)
  await sb.from("inventory_items").delete().eq("user_id", userId);
  const invRows = Object.entries(data.inventory).flatMap(([cat, items]) =>
    (items as any[]).map((item) => ({
      user_id: userId,
      category: cat,
      name: item.name,
      qty: item.qty,
      unit: item.unit,
    }))
  );
  if (invRows.length > 0) {
    await sb.from("inventory_items").insert(invRows);
  }

  // Global notes — upsert + delete orphans
  const noteRows = data.globalNotes.map((n) => ({
    id: n.id,
    user_id: userId,
    content: n.content,
  }));
  if (noteRows.length > 0) {
    await sb.from("global_notes").upsert(noteRows, { onConflict: "id" });
  }
  const noteIds = data.globalNotes.map((n) => n.id);
  if (noteIds.length > 0) {
    await sb.from("global_notes").update({ deleted_at: new Date().toISOString() }).eq("user_id", userId).not("id", "in", `(${noteIds.join(",")})`).is("deleted_at", null);
  } else {
    await sb.from("global_notes").update({ deleted_at: new Date().toISOString() }).eq("user_id", userId).is("deleted_at", null);
  }

  // Wishlist — upsert + delete orphans
  const wishRows = data.wishlist.map((w) => ({
    id: w.id,
    user_id: userId,
    name: w.name,
    priority: w.priority,
    notes: w.notes,
  }));
  if (wishRows.length > 0) {
    await sb.from("wishlist").upsert(wishRows, { onConflict: "id" });
  }
  const wishIds = data.wishlist.map((w) => w.id);
  if (wishIds.length > 0) {
    await sb.from("wishlist").update({ deleted_at: new Date().toISOString() }).eq("user_id", userId).not("id", "in", `(${wishIds.join(",")})`).is("deleted_at", null);
  } else {
    await sb.from("wishlist").update({ deleted_at: new Date().toISOString() }).eq("user_id", userId).is("deleted_at", null);
  }

  // Seasonal tasks — full replace (no client-side IDs)
  await sb.from("seasonal_tasks").delete().eq("user_id", userId);
  const seasonRows = Object.entries(data.seasonalTasks).flatMap(([season, tasks]) =>
    (tasks as any[]).map((t) => ({
      user_id: userId,
      season,
      type: t.type,
      description: t.desc,
    }))
  );
  if (seasonRows.length > 0) {
    await sb.from("seasonal_tasks").insert(seasonRows);
  }
}

export interface TrashItem {
  id: number;
  table: "plants" | "propagations" | "global_notes" | "wishlist";
  label: string;
  meta: string;
  deleted_at: string;
}

export async function loadTrashFromSupabase(userId: string): Promise<TrashItem[]> {
  const sb = supabaseBrowser();
  const [
    { data: plants },
    { data: propagations },
    { data: notes },
    { data: wishlist },
  ] = await Promise.all([
    sb.from("plants").select("id,name,icon,type,deleted_at").eq("user_id", userId).not("deleted_at", "is", null),
    sb.from("propagations").select("id,name,method,deleted_at").eq("user_id", userId).not("deleted_at", "is", null),
    sb.from("global_notes").select("id,content,deleted_at").eq("user_id", userId).not("deleted_at", "is", null),
    sb.from("wishlist").select("id,name,priority,deleted_at").eq("user_id", userId).not("deleted_at", "is", null),
  ]);

  const items: TrashItem[] = [];
  (plants || []).forEach((p: any) => items.push({ id: p.id, table: "plants", label: `${p.icon} ${p.name}`, meta: p.type, deleted_at: p.deleted_at }));
  (propagations || []).forEach((p: any) => items.push({ id: p.id, table: "propagations", label: p.name, meta: p.method, deleted_at: p.deleted_at }));
  (notes || []).forEach((n: any) => items.push({ id: n.id, table: "global_notes", label: n.content.slice(0, 60) + (n.content.length > 60 ? "…" : ""), meta: "", deleted_at: n.deleted_at }));
  (wishlist || []).forEach((w: any) => items.push({ id: w.id, table: "wishlist", label: w.name, meta: w.priority, deleted_at: w.deleted_at }));

  return items.sort((a, b) => b.deleted_at.localeCompare(a.deleted_at));
}

export async function restoreTrashItem(table: TrashItem["table"], id: number, userId: string): Promise<void> {
  const sb = supabaseBrowser();
  await sb.from(table).update({ deleted_at: null }).eq("id", id).eq("user_id", userId);
  if (table === "plants") {
    await sb.from("plant_logs").update({ deleted_at: null }).eq("plant_id", id).eq("user_id", userId);
  }
}

export async function loadFromSupabase(userId: string): Promise<AppData | null> {
  const sb = supabaseBrowser();

  const [
    { data: plants, error: plantsErr },
    { data: plant_logs },
    { data: propagations },
    { data: inventory },
    { data: global_notes },
    { data: wishlist },
    { data: seasonal_tasks },
  ] = await Promise.all([
    sb.from("plants").select("*").eq("user_id", userId).is("deleted_at", null),
    sb.from("plant_logs").select("*").eq("user_id", userId).is("deleted_at", null),
    sb.from("propagations").select("*").eq("user_id", userId).is("deleted_at", null),
    sb.from("inventory_items").select("*").eq("user_id", userId),
    sb.from("global_notes").select("*").eq("user_id", userId).is("deleted_at", null),
    sb.from("wishlist").select("*").eq("user_id", userId).is("deleted_at", null),
    sb.from("seasonal_tasks").select("*").eq("user_id", userId),
  ]);

  if (plantsErr) return null;

  const mappedPlants = (plants || []).map((p: any) => ({
    id: p.id,
    icon: p.icon,
    type: p.type,
    name: p.name,
    lastWateredDate: p.last_watered_date ?? "",
    location: p.location,
    light: p.light,
    potType: p.pot_type,
    dormancy: p.dormancy,
    logs: (plant_logs || [])
      .filter((l: any) => l.plant_id === p.id)
      .map((l: any) => ({
        id: l.id,
        date: l.date,
        actionType: l.action_type,
        detail: l.detail,
      })),
  }));

  const mappedProps = (propagations || []).map((p: any) => ({
    id: p.id,
    parentId: p.parent_id,
    name: p.name,
    method: p.method,
    startDate: p.start_date,
    status: p.status,
    notes: p.notes,
  }));

  const mappedInventory: AppData["inventory"] = {
    substrates: [], fertilizers: [], powders: [],
    liquids: [], meds: [], others: [],
  };
  (inventory || []).forEach((item: any) => {
    const cat = item.category as keyof AppData["inventory"];
    if (mappedInventory[cat]) {
      mappedInventory[cat].push({ name: item.name, qty: item.qty, unit: item.unit } as any);
    }
  });

  const mappedSeasonal: AppData["seasonalTasks"] = {
    Primavera: [], Verano: [], Otoño: [], Invierno: [],
  };
  (seasonal_tasks || []).forEach((t: any) => {
    const season = t.season as keyof AppData["seasonalTasks"];
    if (mappedSeasonal[season]) {
      mappedSeasonal[season].push({ type: t.type, desc: t.description } as any);
    }
  });

  return {
    plants: mappedPlants as any,
    propagations: mappedProps as any,
    inventory: mappedInventory,
    globalNotes: (global_notes || []).map((n: any) => ({ id: n.id, content: n.content })),
    wishlist: (wishlist || []).map((w: any) => ({ id: w.id, name: w.name, priority: w.priority, notes: w.notes })) as any,
    seasonalTasks: mappedSeasonal,
  };
}
