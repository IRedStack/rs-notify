export type NotifyDesign =
  | "rs"
  | "rs_min"
  | "rs_3d"
  | "rs_kill"
  | "rs_prompt";

export type NotifyPosition =
  | "top_large"
  | "top_left"
  | "top_right"
  | "top_center"
  | "center_large"
  | "center_right"
  | "center_left"
  | "center_center"
  | "bottom_large"
  | "bottom_right"
  | "bottom_left"
  | "bottom_center";

export interface NotifyOptions {
  id?: string;
  title?: string;
  text?: string;
  message?: string;
  position?: NotifyPosition;
  design?: NotifyDesign;
  duration?: number;
  richText?: boolean;
  titleColor?: string;
  textColor?: string;
}

export interface NotifyPayload {
  id: string;
  title: string;
  text: string;
  position: NotifyPosition;
  design: NotifyDesign;
  duration: number;
  richText: boolean;
  titleColor?: string;
  textColor?: string;
}
