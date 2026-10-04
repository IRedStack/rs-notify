# rs-notify

Porting HogwartsMP del sistema di notifiche legacy usato come riferimento da `module_notifications`.

La risorsa usa l'architettura MafiaHub/HogwartsMP, ma mantiene il modello funzionale originale:

- una notifica alla volta;
- la nuova notifica sostituisce quella precedente;
- titolo grande e testo centrato;
- `duration: 0` = notifica persistente;
- fade-in e fade-out;
- posizioni `*_large`, `*_left`, `*_right`, `*_center`;
- design `redm`, `redm_min`, `redm_3d`, `redm_kill`, `redm_prompt`;
- firma compatta `title, text, position, design, duration`.

## Build

```powershell
npm install
npm run build
```

`dist/` non viene pubblicata nella repository.

## Server API

```ts
const Notify = Imports.get("rs-notify");

Notify.notify(
  player,
  "Simple Notif",
  "Your message here",
  "bottom_large",
  "redm_min",
  9500
);
```

Oppure con oggetto:

```ts
Notify.notify(player, {
  title: "Simple Notif",
  text: "Your message here",
  position: "bottom_large",
  design: "redm_min",
  duration: 9500
});
```

## Notifica persistente

```ts
Notify.notify(player, {
  title: "Notification Fixed Point",
  text: "Premi E per interagire",
  position: "bottom_large",
  design: "redm_min",
  duration: 0
});

// Quando il giocatore esce dalla zona:
Notify.clear(player);
```

## Positions

```text
top_large
top_left
top_right
top_center
center_large
center_right
center_left
center_center
bottom_large
bottom_right
bottom_left
bottom_center
```

## Designs

```text
redm
redm_min
redm_3d
redm_kill
redm_prompt
```

## Test

```text
/testnotify
/testnotify redm
/testnotify redm_min
/testnotify redm_3d
/testnotify redm_kill
/testnotify redm_prompt
/testnotify all
```
