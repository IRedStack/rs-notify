# rs-notify

A standalone notification resource for **HogwartsMP / MafiaHub**, designed to provide a reusable notification API for server and client resources.

`rs-notify` renders cinematic, screen-positioned notifications through a dedicated WebView and exposes a small server API that can be consumed by any other resource.

The repository contains **source code only**. Build output is intentionally excluded from version control.

## Features

- Standalone HogwartsMP / MafiaHub resource
- Server exports for cross-resource usage
- Client event API
- Server-to-client event support
- Five built-in notification designs
- Twelve screen positions
- Timed and persistent notifications
- Optional limited rich-text formatting
- Automatic replacement of the currently displayed notification
- Dedicated WebView with transparent background
- No external browser libraries or CDN dependencies
- Source-only repository with local build workflow

## Notification Behavior

`rs-notify` displays **one active notification at a time**.

When a new notification is shown, the currently displayed notification is removed and replaced by the new one.

A notification with:

```ts
duration: 0
```

remains visible until explicitly cleared or replaced by another notification.

The default values are:

| Option | Default |
| --- | --- |
| `position` | `bottom_large` |
| `design` | `rs_min` |
| `duration` | `2500` ms |
| `richText` | `false` |

## Installation

Clone or place the resource inside your server resources directory.

Install dependencies:

```powershell
npm install
```

Build the resource:

```powershell
npm run build
```

The build generates:

```text
dist/server.js
dist/client.js
dist/index.html
```

The `dist/` directory is intentionally ignored by Git and must be generated locally.

## Using rs-notify from Another Resource

When another MafiaHub resource imports `rs-notify`, declare it as a dependency in that resource's `package.json`.

Example:

```json
{
  "mafiahub": {
    "resourceDependencies": [
      "rs-notify"
    ]
  }
}
```

This ensures that `rs-notify` is available before the consuming resource attempts to import it.

---

# Server API

The recommended integration method for server resources is the MafiaHub export API.

Import the resource:

```ts
const Notify = Imports.get("rs-notify");
```

The following exports are available:

| Export | Description |
| --- | --- |
| `notify` | Show a notification to one player |
| `broadcast` | Send the same notification to an iterable collection of players |
| `clear` | Clear the active notification for one player |
| `clearAll` | Alias for clearing the active notification for one player |

## notify(player, options)

Shows a notification to a specific player.

```ts
Notify.notify(player, {
  title: "Inventory",
  text: "The item has been added to your inventory.",
  position: "bottom_large",
  design: "rs_min",
  duration: 4500,
  titleColor: "#D4AF37",
  textColor: "#FFFFFF"
});
```

The function returns the generated notification ID when the notification is accepted, otherwise `null`.

### NotifyOptions

```ts
interface NotifyOptions {
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
```

### Properties

| Property | Type | Description |
| --- | --- | --- |
| `id` | `string` | Optional custom notification identifier |
| `title` | `string` | Main notification title |
| `text` | `string` | Notification body |
| `message` | `string` | Compatibility alias for `text` |
| `position` | `NotifyPosition` | Screen position |
| `design` | `NotifyDesign` | Visual style |
| `duration` | `number` | Visible duration in milliseconds. Use `0` for persistent notifications |
| `richText` | `boolean` | Enables the supported limited HTML formatting in the notification body |
| `titleColor` | `string` | Optional CSS color applied to the notification title |
| `textColor` | `string` | Optional CSS color applied to the notification body |

## Compact notify() Syntax

A compact positional form is also available:

```ts
Notify.notify(
  player,
  "Inventory",
  "The item has been added to your inventory.",
  "bottom_large",
  "rs_min",
  4500,
  "#D4AF37",
  "#FFFFFF"
);
```

The arguments are:

```text
player
title
text
position
design
duration
titleColor
textColor
```

The compact API automatically enables supported rich-text formatting.

## Custom Colors

Each notification can override the title and body colors independently.

```ts
Notify.notify(player, {
  title: "Quest Updated",
  text: "Return to Hogwarts.",
  position: "top_center",
  design: "rs_min",
  duration: 5000,
  titleColor: "#D4AF37",
  textColor: "#F4F1E8"
});
```

Any CSS color value supported by the embedded browser can be used, including hexadecimal, RGB, HSL, and named colors. Invalid values are ignored and the default notification color is preserved.

Colors can also be supplied through the compact API as the final two optional arguments.

## Persistent Notifications

Use `duration: 0` when the notification should stay visible until manually cleared.

```ts
Notify.notify(player, {
  title: "Interaction",
  text: "Press <b>E</b> to interact.",
  position: "bottom_large",
  design: "rs_min",
  duration: 0,
  richText: true
});
```

Clear it when the interaction is no longer available:

```ts
Notify.clear(player);
```

## broadcast(players, options)

Sends the same notification to every player contained in the provided iterable.

```ts
Notify.broadcast(players, {
  title: "Server",
  text: "The event is starting.",
  position: "top_large",
  design: "rs",
  duration: 5000
});
```

`players` must be an iterable collection of player objects.

The function returns the number of players that received the notification.

## clear(player)

Clears the active notification for the specified player.

```ts
Notify.clear(player);
```

Returns `true` when the player object is valid.

## clearAll(player)

Alias of `clear(player)`.

```ts
Notify.clearAll(player);
```

---

# Client API

Client resources can display a notification locally through the `rs-notify:notify` event.

## Local Client Notification

```ts
Events.emit("rs-notify:notify", JSON.stringify({
  title: "Spell Learned",
  text: "You have learned Revelio.",
  position: "top_center",
  design: "rs_prompt",
  duration: 5000
}));
```

An object payload can also be handled by the resource where supported by the runtime.

## Request a Server-Side Notification

The resource also listens for:

```text
rs-notify:request
```

from the client.

Example:

```ts
Events.emitServer(
  "rs-notify:request",
  JSON.stringify({
    title: "Notification",
    text: "Server-routed notification.",
    position: "bottom_large",
    design: "rs_min",
    duration: 3500
  })
);
```

This request only sends the notification back to the requesting player.

For notifications generated by server gameplay logic, using the server export API is recommended.

---

# Direct Server-to-Client Event

A server resource may also emit the notification event directly to a player:

```ts
player.emit(
  "rs-notify:notify",
  JSON.stringify({
    title: "Quest Updated",
    text: "Return to Hogwarts.",
    position: "top_right",
    design: "rs_min",
    duration: 4000
  })
);
```

Using the exported `notify()` API is preferred because it normalizes the payload before sending it to the client.

---

# Designs

The following designs are currently available:

| Design | Intended Use |
| --- | --- |
| `rs` | Full notification presentation |
| `rs_min` | Minimal transparent presentation |
| `rs_3d` | Perspective-styled notification |
| `rs_kill` | Kill / combat-style notification |
| `rs_prompt` | Tutorial or interaction prompt |

Example:

```ts
Notify.notify(player, {
  title: "Tutorial",
  text: "Open the menu with <b>SPACEBAR</b>.",
  position: "top_center",
  design: "rs_prompt",
  duration: 9000,
  richText: true
});
```

---

# Positions

Available notification positions:

| Position | Description |
| --- | --- |
| `top_large` | Full-width top notification |
| `top_left` | Top-left |
| `top_right` | Top-right |
| `top_center` | Top-center |
| `center_large` | Full-width center notification |
| `center_left` | Center-left |
| `center_right` | Center-right |
| `center_center` | Screen center |
| `bottom_large` | Full-width bottom notification |
| `bottom_left` | Bottom-left |
| `bottom_right` | Bottom-right |
| `bottom_center` | Bottom-center |

---

# Rich Text

When `richText: true` is enabled, `rs-notify` accepts a restricted set of formatting tags in the notification body.

Supported tags:

```text
<b>
<strong>
<i>
<em>
<br>
```

Example:

```ts
Notify.notify(player, {
  title: "Warning",
  text: "Press <b>E</b> to continue.<br>Leaving the area will cancel the action.",
  position: "bottom_large",
  design: "rs_min",
  duration: 6000,
  richText: true
});
```

Other HTML tags are stripped by the WebView before rendering.

---

# Integration Examples

## Inventory Resource

```ts
const Notify = Imports.get("rs-notify");

function onItemAdded(player: Player, itemName: string): void {
  Notify.notify(player, {
    title: "Inventory",
    text: `${itemName} added to your inventory.`,
    position: "bottom_right",
    design: "rs_min",
    duration: 3500
  });
}
```

## Interaction Resource

```ts
const Notify = Imports.get("rs-notify");

function showInteraction(player: Player): void {
  Notify.notify(player, {
    title: "Interaction",
    text: "Press <b>E</b> to interact.",
    position: "bottom_large",
    design: "rs_prompt",
    duration: 0,
    richText: true
  });
}

function hideInteraction(player: Player): void {
  Notify.clear(player);
}
```

## Quest Resource

```ts
const Notify = Imports.get("rs-notify");

function questUpdated(player: Player, objective: string): void {
  Notify.notify(player, {
    title: "Quest Updated",
    text: objective,
    position: "top_center",
    design: "rs",
    duration: 5000
  });
}
```

---

# Test Commands

The resource includes development commands for testing each built-in design.

```text
/testnotify
/testnotify rs
/testnotify rs_min
/testnotify rs_3d
/testnotify rs_kill
/testnotify rs_prompt
/testnotify all
```

`/testnotify` defaults to `rs_min`.

`/testnotify all` displays each available design sequentially.

---

# Build Scripts

Type-check the project:

```powershell
npm run typecheck
```

Build the resource:

```powershell
npm run build
```

---

# Resource Structure

```text
rs-notify/
├── client/
│   ├── index.html
│   └── main.ts
├── server/
│   └── main.ts
├── shared/
│   ├── normalize.ts
│   └── types.ts
├── scripts/
│   └── copy-static.mjs
├── package.json
├── tsconfig.json
└── types.d.ts
```

---

# Namespace

All events and APIs exposed by this resource use the `rs-notify` namespace.

Primary events:

```text
rs-notify:notify
rs-notify:request
rs-notify:clear
rs-notify:clearAll
```

Primary server exports:

```text
notify
broadcast
clear
clearAll
```

---

# RedStack

`rs-notify` is part of the RedStack resource ecosystem for HogwartsMP / MafiaHub.
