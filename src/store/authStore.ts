import { atom } from "nanostores";
import type { User } from "@supabase/supabase-js";

export const $user = atom<User | null>(null);
export const $authLoading = atom<boolean>(true);
export type SyncStatus = "idle" | "syncing" | "error" | "synced";
export const $syncStatus = atom<SyncStatus>("idle");
export const $lastSyncTime = atom<string | null>(null);
