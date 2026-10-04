export type NotifyType = "info" | "success" | "warning" | "error" | "neutral";

export type NotifyPosition =
  | "top_left"
  | "top_center"
  | "top_right"
  | "center_left"
  | "center_center"
  | "center_right"
  | "bottom_left"
  | "bottom_center"
  | "bottom_right";

export interface NotifyOptions {
  id?: string;
  title?: string;
  message: string;
  type?: NotifyType;
  position?: NotifyPosition;
  duration?: number;
  icon?: string;
  progress?: boolean;
  dedupeKey?: string;
}

export interface NotifyPayload {
  id: string;
  title: string;
  message: string;
  type: NotifyType;
  position: NotifyPosition;
  duration: number;
  icon?: string;
  progress: boolean;
  dedupeKey?: string;
}

export interface ClearPayload {
  id?: string;
}
