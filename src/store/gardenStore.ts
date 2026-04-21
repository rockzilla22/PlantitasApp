import { map } from "nanostores";

export type SkinId = "standard" | "modern";

export interface SkinOption {
  id: SkinId;
  label: string;
  price: 0;
}

export const SKIN_OPTIONS: SkinOption[] = [
  { id: "standard", label: "Estándar", price: 0 },
  { id: "modern", label: "Moderno", price: 0 },
];

export const $roomSkins = map<Record<string, SkinId>>({});

export function setRoomSkin(roomKey: string, skinId: SkinId) {
  $roomSkins.setKey(roomKey, skinId);
}

export function getRoomSkin(roomKey: string): SkinId {
  return $roomSkins.get()[roomKey] ?? "standard";
}
