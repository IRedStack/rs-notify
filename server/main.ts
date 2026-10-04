import { normalizeNotify, parseInput } from "../shared/normalize";
import type { NotifyDesign, NotifyOptions, NotifyPosition } from "../shared/types";

const RESOURCE = "rs-notify";

interface PlayerLike {
  id?: number | string;
  emit(event: string, payload?: unknown): void;
}

function isPlayer(value: unknown): value is PlayerLike {
  return !!value && typeof value === "object" && typeof (value as PlayerLike).emit === "function";
}

function send(player: PlayerLike, input: NotifyOptions): string | null {
  if (!isPlayer(player)) return null;

  const payload = normalizeNotify(input);
  if (!payload.title && !payload.text) return null;

  player.emit("rs-notify:notify", JSON.stringify(payload));
  return payload.id;
}

function notify(
  player: PlayerLike,
  input: NotifyOptions | string,
  text?: string,
  position?: NotifyPosition,
  design?: NotifyDesign,
  duration?: number,
  titleColor?: string,
  textColor?: string,
): string | null {
  if (typeof input === "string") {
    return send(player, {
      title: input,
      text: String(text ?? ""),
      position,
      design,
      duration,
      richText: true,
      titleColor,
      textColor,
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

function clear(player: PlayerLike): boolean {
  if (!isPlayer(player)) return false;
  player.emit("rs-notify:clearAll", "{}");
  return true;
}

function clearAll(player: PlayerLike): boolean {
  return clear(player);
}

const TEST_DESIGNS: NotifyDesign[] = [
  "rs",
  "rs_min",
  "rs_3d",
  "rs_kill",
  "rs_prompt",
];

function demo(player: PlayerLike, design: NotifyDesign): void {
  const base: NotifyOptions = {
    title: design === "rs_kill" ? "" : "Simple Notif",
    text: "Your message here",
    position: "bottom_large",
    design,
    duration: 3500,
    richText: true,
  };

  if (design === "rs_min") {
    base.duration = 9500;
  }

  if (design === "rs_kill") {
    base.position = "center_right";
    base.text = "Notification <b>kill</b> example with animations";
    base.duration = 4000;
  }

  if (design === "rs_prompt") {
    base.title = "Tutorial";
    base.position = "top_center";
    base.text = "Open the menu with <b>SPACEBAR</b> key";
    base.duration = 9000;
  }

  send(player, base);
}

function runTestNotification(player: PlayerLike, rawArgs: unknown): void {
  const args = Array.isArray(rawArgs)
    ? rawArgs.map((value) => String(value).toLowerCase())
    : [];

  const mode = args[0] ?? "rs_min";

  if (mode === "all") {
    TEST_DESIGNS.forEach((design, index) => {
      setTimeout(() => demo(player, design), index * 3200);
    });
    return;
  }

  if (!TEST_DESIGNS.includes(mode as NotifyDesign)) {
    send(player, {
      title: "RS Notify",
      text: "Uso: /testnotify <rs|rs_min|rs_3d|rs_kill|rs_prompt|all>",
      position: "bottom_large",
      design: "rs_min",
      duration: 6000,
    });
    return;
  }

  demo(player, mode as NotifyDesign);
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
