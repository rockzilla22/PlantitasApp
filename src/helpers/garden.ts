import { Plant } from "@/core/plant/domain/Plant";

export const LOCATION_TO_ROOM_KEY: Record<string, string> = {
  "Balcón": "balcony",
  "Baño": "bathroom",
  "Cocina": "kitchen",
  "Comedor": "dining",
  "Entrada": "entrance",
  "Estudio": "study",
  "Jardín": "garden",
  "Lavanderia": "laundry",
  "Oficina": "office",
  "Patio": "patio",
  "Recámara": "bedroom",
  "Sala": "living",
  "Techo": "roof",
  "Otros": "storage",
};

const PLANT_TYPE_TO_SVG: Record<string, string> = {
  "Planta": "plant",
  "Alocasia": "alocasia",
  "Arbusto": "shrub",
  "Aromática": "aromatic",
  "Cactus": "cactus",
  "Carnívora": "carnivorous",
  "Flor": "flower",
  "Frutal": "fruit",
  "Hierba": "herb",
  "Monstera": "monstera",
  "Philodendron": "philodendron",
  "Syngonium": "syngonium",
  "Trébol": "clover",
  "CUSTOM": "custom",
};

export function getPlantGardenIcon(type: string, tier = "standard"): string {
  const filename = PLANT_TYPE_TO_SVG[type] ?? "generic";
  return `/virtualGarden/${tier}/plants/${filename}.svg`;
}

export function getRoomSvg(roomKey: string, skinId = "standard"): string {
  // "standard" skin uses standard/ folder; premium skins use their own subfolder
  const folder = skinId === "standard" ? "standard" : `premium/${skinId}`;
  return `/virtualGarden/${folder}/rooms/${roomKey}.svg`;
}

export function getDaysSinceWatered(lastWateredDate?: string | null): number | null {
  if (!lastWateredDate) return null;
  const last = new Date(lastWateredDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - last.getTime()) / 86_400_000);
}

export function getPlantsByRoom(plants: Plant[]): Record<string, Plant[]> {
  return plants.reduce((acc, plant) => {
    if (plant.deleted_at) return acc;
    const roomKey = LOCATION_TO_ROOM_KEY[plant.location] ?? "storage";
    (acc[roomKey] ??= []).push(plant);
    return acc;
  }, {} as Record<string, Plant[]>);
}
