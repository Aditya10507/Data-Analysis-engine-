import { create } from "zustand";
import type { ToastKind, ToastMessage } from "../types/toast";

const TOAST_AUTO_DISMISS_MS = 4000;

type ToastInput = {
  kind: ToastKind;
  message: string;
  title: string;
};

type ToastState = {
  addToast: (toast: ToastInput) => void;
  removeToast: (toastId: string) => void;
  toasts: ToastMessage[];
};

/** Build and return a browser-safe toast id. */
function buildToastId(): string {
  return crypto.randomUUID();
}

export const useToastStore = create<ToastState>((set) => ({
  addToast: (toast) => {
    const toastId = buildToastId();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id: toastId }] }));
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((item) => item.id !== toastId) }));
    }, TOAST_AUTO_DISMISS_MS);
  },
  removeToast: (toastId) => {
    set((state) => ({ toasts: state.toasts.filter((item) => item.id !== toastId) }));
  },
  toasts: [],
}));
