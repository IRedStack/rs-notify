import { normalizeNotify, parseInput } from "../shared/normalize";
import type { NotifyOptions } from "../shared/types";

const RESOURCE = "rs-notify";

interface PlayerLike {
  id?: number | string;
  emit(event: string, payload?: unknown): void;
}

function isPlayer(value: unknown): value is PlayerLike {
  return !!value && typeof value === "object" && typeof (value as PlayerLike).emit === "function";
}

function send(player: PlayerLike, input: NotifyOptions): string | null {
  if (!isPlayer(player) || !input.message?.trim()) return null;
  const payload = normalizeNotify(input);
  player.emit("rs-notify:notify", JSON.stringify(payload));
  return payload.id;
}

function notify(
  player: PlayerLike,
  input: NotifyOptions | string,
  message?: string,
  position?: NotifyOptions["position"],
  type?: NotifyOptions["type"],
  duration?: number,
): string | null {
  if (typeof input === "string") {
    return send(player, {
      title: input,
      message: String(message ?? ""),
      position,
      type,
      duration,
    });
  }

  return send(player, input);
}

function broadcast(players: Iterable<PlayerLike> | PlayerLike[], input: NotifyOptions): number {
  let sent = 0;

  for (const player of players) {
    if (send(player, input)) sent++;
  }

  return sent;
}

function clear(player: PlayerLike, id: string): boolean {
  if (!isPlayer(player) || !id) return false;
  player.emit("rs-notify:clear", JSON.stringify({ id }));
  return true;
}

function clearAll(player: PlayerLike): boolean {
  if (!isPlayer(player)) return false;
  player.emit("rs-notify:clearAll", "{}");
  return true;
}

const TEST_TYPES = ["success", "error", "warning", "info", "neutral"] as const;

function runTestNotification(player: PlayerLike, rawArgs: unknown): void {
  const args = Array.isArray(rawArgs)
    ? rawArgs.map((value) => String(value).toLowerCase())
    : [];

  const mode = args[0] ?? "success";

  if (mode === "all") {
    TEST_TYPES.forEach((type, index) => {
      setTimeout(() => {
        send(player, {
          title: `RS Notify - ${type.toUpperCase()}`,
          message: `Notifica di test: ${type}`,
          type,
          position: "top_right",
          duration: 5000,
        });
      }, index * 150);
    });

    return;
  }

  if (!TEST_TYPES.includes(mode as (typeof TEST_TYPES)[number])) {
    send(player, {
      title: "RS Notify",
      message: "Uso: /testnotify <success|error|warning|info|neutral|all>",
      type: "warning",
      position: "top_right",
      duration: 6000,
    });

    return;
  }

  send(player, {
    title: `RS Notify - ${mode.toUpperCase()}`,
    message: `Notifica di test: ${mode}`,
    type: mode as NotifyOptions["type"],
    position: "top_right",
    duration: 5000,
  });
}

Exports.register("notify", notify);
Exports.register("broadcast", broadcast);
Exports.register("clear", clear);
Exports.register("clearAll", clearAll);

Events.onClient("rs-notify:request", (player: PlayerLike, raw: unknown) => {
  const parsed = parseInput(raw);
  if (!parsed) return;

  send(player, parsed);
});

Events.on("chatCommand", (
  player: PlayerLike,
  _message: unknown,
  rawCommand: unknown,
  rawArgs: unknown,
) => {
  const command = String(rawCommand ?? "").toLowerCase();

  if (command !== "testnotify") return;
  runTestNotification(player, rawArgs);
});

Events.on("resourceStart", (name?: string) => {
  if (name && name !== RESOURCE) return;

  console.info(`[${RESOURCE}] Notification service started.`);
});
