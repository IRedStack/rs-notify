import type { NotifyDesign, NotifyOptions, NotifyPayload, NotifyPosition } from "./types";

const DESIGNS = new Set<NotifyDesign>([
  "rs",
  "rs_min",
  "rs_3d",
  "rs_kill",
  "rs_prompt",
]);

const POSITIONS = new Set<NotifyPosition>([
  "top_large",
  "top_left",
  "top_right",
  "top_center",
  "center_large",
  "center_right",
  "center_left",
  "center_center",
  "bottom_large",
  "bottom_right",
  "bottom_left",
  "bottom_center",
]);

let sequence = 0;

function nextId(): string {
  sequence = (sequence + 1) % 1_000_000;
  return `rsn-${Date.now().toString(36)}-${sequence.toString(36)}`;
}

function clean(value: unknown, max = 1600): string {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, max);
}

export function parseInput(raw: unknown): NotifyOptions | null {
  let value = raw;

  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }

  if (!value || typeof value !== "object") return null;

  const input = value as Partial<NotifyOptions>;
  const text = clean(input.text ?? input.message);

  if (!text && !clean(input.title)) return null;

  return {
    id: clean(input.id) || undefined,
    title: clean(input.title, 300) || undefined,
    text,
    position: input.position,
    design: input.design,
    duration: Number(input.duration),
    richText: input.richText === true,
  };
}

export function normalizeNotify(input: NotifyOptions): NotifyPayload {
  const position = POSITIONS.has(input.position as NotifyPosition)
    ? (input.position as NotifyPosition)
    : "bottom_large";

  const design = DESIGNS.has(input.design as NotifyDesign)
    ? (input.design as NotifyDesign)
    : "rs_min";

  const rawDuration = Number(input.duration);
  const duration = Number.isFinite(rawDuration)
    ? Math.max(0, Math.min(120_000, Math.trunc(rawDuration)))
    : 2500;

  return {
    id: clean(input.id) || nextId(),
    title: clean(input.title, 300),
    text: clean(input.text ?? input.message),
    position,
    design,
    duration,
    richText: input.richText === true,
  };
}
