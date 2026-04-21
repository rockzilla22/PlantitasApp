import { atom } from "nanostores";

// Estado para el resizer del panel de detalles
export const $resizerWidth = atom<number>(0); // Se sincroniza desde el contenedor en desktop
export const $isResizing = atom<boolean>(false);

// Estado para la búsqueda global
export const $searchQuery = atom<string>("");

// Estado para la pestaña activa (refleja la URL pero es útil para componentes cliente)
export const $activeTab = atom<string>("plants");

// Estado para el flash del botón de exportar
export const $shouldFlashExport = atom<boolean>(false);

export const triggerExportFlash = () => {
  $shouldFlashExport.set(true);
  setTimeout(() => $shouldFlashExport.set(false), 5000);
};

// Cambios sin exportar
export const $isDirty = atom<boolean>(false);
export const setDirty = (v: boolean) => $isDirty.set(v);
