export type ToastKind = "error" | "info" | "success" | "warning";

export type ToastMessage = {
  id: string;
  kind: ToastKind;
  message: string;
  title: string;
};
