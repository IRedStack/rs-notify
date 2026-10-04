# rs-notify

Standalone notification resource for HogwartsMP / MafiaHub.

## Features

- No RedM/FiveM dependencies.
- Native HogwartsMP WebView bridge.
- Nine screen positions.
- `info`, `success`, `warning`, `error`, `neutral` variants.
- Stacked notifications instead of replacing the previous one.
- `duration: 0` for persistent notifications.
- Optional `id` for explicit removal.
- Optional `dedupeKey` to replace repeated notifications cleanly.
- Safe text rendering (`textContent`, no arbitrary HTML injection).
- Server exports and client/server events under the `rs-notify` namespace.

## Build

```powershell
npm install
npm run build
```

Start the resulting `rs-notify` resource normally with HogwartsMP.

## Server API

```ts
const notify = Imports.get("rs-notify");

notify.notify(player, {
  title: "Inventario",
  message: "Oggetto aggiunto all'inventario",
  type: "success",
  position: "top_right",
  duration: 4500,
});
```

The server export also supports a compact positional migration form:

```ts
notify.notify(player, "Inventario", "Oggetto aggiunto", "top_right", "success", 4500);
```

### Persistent notification

```ts
const id = notify.notify(player, {
  title: "Interazione",
  message: "Premi E per interagire",
  type: "info",
  position: "bottom_center",
  duration: 0,
});

notify.clear(player, id);
```

### Clear everything for one player

```ts
notify.clearAll(player);
```

## Client event

```ts
Events.emit("rs-notify:notify", JSON.stringify({
  title: "Magia",
  message: "Revelio appreso",
  type: "success",
  duration: 4500
}));
```

## Server -> client event

```ts
player.emit("rs-notify:notify", JSON.stringify({
  title: "Missione",
  message: "Obiettivo aggiornato",
  type: "info",
  position: "top_right",
  duration: 4500
}));
```

## Types

`info | success | warning | error | neutral`

## Positions

`top_left`, `top_center`, `top_right`, `center_left`, `center_center`, `center_right`, `bottom_left`, `bottom_center`, `bottom_right`

## Namespace

The old `module_notifications` namespace is intentionally not included. This resource is a clean architectural replacement and uses only `rs-notify`.

## Test in-game

Dopo aver eseguito `npm run build` e avviato la risorsa, usa:

```text
/testnotify success
/testnotify error
/testnotify warning
/testnotify info
/testnotify neutral
/testnotify all
```

`/testnotify all` mostra tutti i tipi in sequenza e consente di verificare anche lo stacking.
