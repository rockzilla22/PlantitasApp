import { atom } from "nanostores";

export type Theme = "light" | "dark" | "system";
export const $theme = atom<Theme>((typeof localStorage !== "undefined" && (localStorage.getItem("theme") as Theme)) || "system");
