import { normalizeNotify, parseInput } from "../shared/normalize";
import type { NotifyOptions } from "../shared/types";

const RESOURCE = "rs-notify";
const VIEW_URL = "fw://resources/rs-notify/dist/index.html";

let view = -1;
let ready = false;
const pending: Array<{ event: string; payload: unknown }> = [];

function ensureView(): number {
  if (view >= 0) return view;

  try {
    view = Web.createView(VIEW_URL, { visible: true, x: 0, y: 0 });
  } catch (error) {
    console.error(`[${RESOURCE}] Failed to create WebView: ${String(error)}`);
    view = -1;
  }

  if (view >= 0) {
    Web.on(view, "ready", () => {
      ready = true;
      console.info(`[${RESOURCE}] WebView ready.`);
      while (pending.length) {
        const next = pending.shift();
        if (next) Web.emit(view, next.event, next.payload);
      }
    });
  }

  return view;
}

function emitUi(event: string, payload: unknown): void {
  if (ensureView() < 0) return;
  if (!ready) {
    pending.push({ event, payload });
    return;
  }
  Web.emit(view, event, payload);

  if (event === "notify:show") {
    try {
      const value = payload as { id?: unknown; type?: unknown };
      console.info(`[${RESOURCE}] UI notify emitted id=${String(value?.id ?? "")} type=${String(value?.type ?? "")}`);
    } catch {}
  }
}

function show(input: NotifyOptions): string | null {
  if (!input.message?.trim()) return null;
  const payload = normalizeNotify(input);
  emitUi("notify:show", payload);
  return payload.id;
}

function receive(raw: unknown): void {
  const parsed = parseInput(raw);
  if (!parsed) {
    console.warn(`[${RESOURCE}] Ignored invalid notification payload.`);
    return;
  }
  show(parsed);
}

Events.on("rs-notify:notify", receive);

Events.on("rs-notify:clear", (raw: unknown) => {
  let id = "";
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as { id?: unknown };
      id = typeof parsed?.id === "string" ? parsed.id : raw;
    } catch {
      id = raw;
    }
  } else if (raw && typeof raw === "object") {
    id = String((raw as { id?: unknown }).id ?? "");
  }
  if (id) emitUi("notify:clear", { id });
});

Events.on("rs-notify:clearAll", () => emitUi("notify:clearAll", {}));

Events.on("resourceStop", (name?: string) => {
  if (name && name !== RESOURCE) return;
  pending.length = 0;
  ready = false;
  if (view >= 0) {
    try { Web.destroyView(view); } catch {}
    view = -1;
  }
});

ensureView();
