import { supabaseBrowser } from "./db";
import type { AppData } from "@/store/plantStore";
import type { User } from "@supabase/supabase-js";
import configProject from "@/data/configProject";
import { PlantSchema } from "@/core/plant/domain/Plant";
import { PropagationSchema } from "@/core/nursery/domain/Propagation";
import { GlobalNoteSchema } from "@/core/notes/domain/GlobalNote";
import { WishlistItemSchema } from "@/core/wishlist/domain/WishlistItem";

function parseValid<T>(schema: { safeParse: (v: unknown) => { success: boolean; data?: T } }, items: unknown[]): T[] {
  return items.reduce<T[]>((acc, item) => {
    const result = schema.safeParse(item);
    if (result.success && result.data) acc.push(result.data);
    return acc;
  }, []);
}

export type PlanLevel = string;

export function getPlanLevel(user: User | null): PlanLevel {
  if (!user) return configProject.plans.NONE.id;
  const role = String(user.app_metadata?.role || "").toLowerCase();
  
  const masterId = configProject.plans.MASTER.id.toLowerCase();
  const premiumId = configProject.plans.PREMIUM.id.toLowerCase();
  const proId = configProject.plans.PRO.id.toLowerCase();

  if (role === masterId) return configProject.plans.MASTER.id;
  if (role === premiumId) {
    const exp = user.app_metadata?.premium_expires_at;
    if (exp && new Date() > new Date(exp)) return configProject.plans.FREE.id;
    return configProject.plans.PREMIUM.id;
  }
  if (role === proId) return configProject.plans.PRO.id;
  return configProject.plans.FREE.id;
}

export function hasPremium(user: User | null): boolean {
  const level = getPlanLevel(user);
  return level === configProject.plans.PREMIUM.id || level === configProject.plans.MASTER.id;
}

export function getEffectiveMaxSlots(user: User | null): number {
  const level = getPlanLevel(user);
  const basePlan = Object.values(configProject.plans).find(p => p.id === level) ?? configProject.plans.FREE;
  const giftSlots: number = user?.app_metadata?.gift_slots || 0;
  const extraSlots: number = user?.app_metadata?.extra_slots || 0;
  return basePlan.maxSlots + giftSlots + extraSlots;
}

export async function syncToSupabase(data: AppData, userId: string): Promise<void> {
  const sb = supabaseBrowser();

  const validPlants = parseValid(PlantSchema, data.plants);
  const validProps = parseValid(PropagationSchema, data.propagations);
  const validNotes = parseValid(GlobalNoteSchema, data.globalNotes);
  const validWishlist = parseValid(WishlistItemSchema, data.wishlist);

  // Plants — upsert + delete orphans
  const plantRows = validPlants.map((p) => ({
    id: p.id,
    user_id: userId,
    type: p.type,
    subtype: p.subtype || null,
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
  const plantIds = validPlants.map((p) => p.id);
  if (plantIds.length > 0) {
    await sb.from("plants").update({ deleted_at: new Date().toISOString() }).eq("user_id", userId).not("id", "in", `(${plantIds.join(",")})`).is("deleted_at", null);
  } else {
    await sb.from("plants").update({ deleted_at: new Date().toISOString() }).eq("user_id", userId).is("deleted_at", null);
  }

  // Plant logs — upsert + delete orphans
  const logRows = validPlants.flatMap((p) =>
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
  const propRows = validProps.map((p) => ({
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
  const propIds = validProps.map((p) => p.id);
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
  const noteRows = validNotes.map((n) => ({
    id: n.id,
    user_id: userId,
    content: n.content,
  }));
  if (noteRows.length > 0) {
    await sb.from("global_notes").upsert(noteRows, { onConflict: "id" });
  }
  const noteIds = validNotes.map((n) => n.id);
  if (noteIds.length > 0) {
    await sb.from("global_notes").update({ deleted_at: new Date().toISOString() }).eq("user_id", userId).not("id", "in", `(${noteIds.join(",")})`).is("deleted_at", null);
  } else {
    await sb.from("global_notes").update({ deleted_at: new Date().toISOString() }).eq("user_id", userId).is("deleted_at", null);
  }

  // wishlist — upsert + delete orphans
  const wishRows = validWishlist.map((w) => ({
    id: w.id,
    user_id: userId,
    name: w.name,
    priority: w.priority,
    notes: w.notes,
  }));
  if (wishRows.length > 0) {
    await sb.from("wishlist").upsert(wishRows, { onConflict: "id" });
  }
  const wishIds = validWishlist.map((w) => w.id);
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
  days_left: number;
}

export async function loadTrashFromSupabase(userId: string, retentionDays: number): Promise<TrashItem[]> {
  const sb = supabaseBrowser();
  const [
    { data: plants },
    { data: propagations },
    { data: notes },
    { data: wishlist },
  ] = await Promise.all([
    sb.from("plants").select("id,name,type,deleted_at").eq("user_id", userId).not("deleted_at", "is", null),
    sb.from("propagations").select("id,name,method,deleted_at").eq("user_id", userId).not("deleted_at", "is", null),
    sb.from("global_notes").select("id,content,deleted_at").eq("user_id", userId).not("deleted_at", "is", null),
    sb.from("wishlist").select("id,name,priority,deleted_at").eq("user_id", userId).not("deleted_at", "is", null),
  ]);

  const items: TrashItem[] = [];
  const now = new Date();

  const mapItem = (row: any, table: TrashItem["table"], label: string, meta: string): TrashItem => {
    const deletedAt = new Date(row.deleted_at);
    const diffTime = now.getTime() - deletedAt.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return {
      id: row.id,
      table,
      label,
      meta,
      deleted_at: row.deleted_at,
      days_left: Math.max(0, retentionDays - diffDays),
    };
  };

  (plants || []).forEach((p: any) => items.push(mapItem(p, "plants", p.name, p.type)));
  (propagations || []).forEach((p: any) => items.push(mapItem(p, "propagations", p.name, p.method)));
  (notes || []).forEach((n: any) => items.push(mapItem(n, "global_notes", n.content.slice(0, 60) + (n.content.length > 60 ? "…" : ""), "")));
  (wishlist || []).forEach((w: any) => items.push(mapItem(w, "wishlist", w.name, w.priority)));

  return items.sort((a, b) => b.deleted_at.localeCompare(a.date));
}

export async function emptyTrashPermanently(userId: string): Promise<void> {
  const sb = supabaseBrowser();
  // Borramos todo lo que tenga deleted_at no nulo para este usuario
  await Promise.all([
    sb.from("plants").delete().eq("user_id", userId).not("deleted_at", "is", null),
    sb.from("propagations").delete().eq("user_id", userId).not("deleted_at", "is", null),
    sb.from("global_notes").delete().eq("user_id", userId).not("deleted_at", "is", null),
    sb.from("wishlist").delete().eq("user_id", userId).not("deleted_at", "is", null),
    // Los logs se borran solos si están vinculados o los borramos por las dudas:
    sb.from("plant_logs").delete().eq("user_id", userId).not("deleted_at", "is", null),
  ]);
}

export async function restoreTrashItem(table: TrashItem["table"], id: number, userId: string): Promise<void> {
  const sb = supabaseBrowser();
  await sb.from(table).update({ deleted_at: null }).eq("id", id).eq("user_id", userId);
  if (table === "plants") {
    await sb.from("plant_logs").update({ deleted_at: null }).eq("plant_id", id).eq("user_id", userId);
  }
}

export async function deleteTrashItemPermanently(table: TrashItem["table"], id: number, userId: string): Promise<void> {
  const sb = supabaseBrowser();
  await sb.from(table).delete().eq("id", id).eq("user_id", userId);
  // Los logs y otros se borran por cascade en BD o manualmente si no hay FK
  if (table === "plants") {
    await sb.from("plant_logs").delete().eq("plant_id", id).eq("user_id", userId);
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
    type: p.type,
    subtype: p.subtype ?? "",
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
