import { atom } from "nanostores";

export type ModalType = 
  | "add-plant" | "edit-plant"
  | "add-prop" | "edit-prop"
  | "add-wish" | "edit-wish"
  | "add-season-task" | "edit-season-task"
  | "add-note" | "edit-note"
  | "add-item" | "edit-item"
  | "calendar" | "info" | "confirm" | "import-choice"
  | null;

export interface ModalContext {
  type: ModalType;
  props?: any;
}

export const $activeModal = atom<ModalContext>({ type: null });

export const openModal = (type: ModalType, props?: any) => {
  $activeModal.set({ type, props });
};

export const closeModal = () => {
  $activeModal.set({ type: null });
};
