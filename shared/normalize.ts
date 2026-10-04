import type { NotifyOptions, NotifyPayload, NotifyPosition, NotifyType } from "./types";

const TYPES = new Set<NotifyType>(["info", "success", "warning", "error", "neutral"]);
const POSITIONS = new Set<NotifyPosition>([
  "top_left", "top_center", "top_right",
  "center_left", "center_center", "center_right",
  "bottom_left", "bottom_center", "bottom_right",
]);

let sequence = 0;

function nextId(): string {
  sequence = (sequence + 1) % 1_000_000;
  return `rsn-${Date.now().toString(36)}-${sequence.toString(36)}`;
}

function cleanText(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  return String(value).trim().slice(0, 600);
}

export function parseInput(raw: unknown): NotifyOptions | null {
  let value = raw;
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { return null; }
  }

  if (!value || typeof value !== "object") return null;
  const input = value as Partial<NotifyOptions>;
  const message = cleanText(input.message);
  if (!message) return null;

  return {
    id: cleanText(input.id) || undefined,
    title: cleanText(input.title) || undefined,
    message,
    type: input.type,
    position: input.position,
    duration: Number(input.duration),
    icon: cleanText(input.icon) || undefined,
    progress: input.progress,
    dedupeKey: cleanText(input.dedupeKey) || undefined,
  };
}

export function normalizeNotify(input: NotifyOptions): NotifyPayload {
  const type = TYPES.has(input.type as NotifyType) ? (input.type as NotifyType) : "info";
  const position = POSITIONS.has(input.position as NotifyPosition)
    ? (input.position as NotifyPosition)
    : "top_right";

  const rawDuration = Number(input.duration);
  const duration = Number.isFinite(rawDuration)
    ? Math.max(0, Math.min(120_000, Math.trunc(rawDuration)))
    : 4500;

  return {
    id: cleanText(input.id) || nextId(),
    title: cleanText(input.title),
    message: cleanText(input.message),
    type,
    position,
    duration,
    icon: cleanText(input.icon) || undefined,
    progress: input.progress !== false,
    dedupeKey: cleanText(input.dedupeKey) || undefined,
  };
}
