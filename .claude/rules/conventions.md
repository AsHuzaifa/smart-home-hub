# conventions.md — Smart Home Hub Session Log
Last updated: 2026-08-29

Read this before doing anything. It restores full session context.

---

## What this project is

A portfolio piece: a mini Node-RED-style drag-and-drop automation rule builder tied to a
live 3D floorplan where simulated smart-home devices (lights, fans, doors, AC, sensors)
visibly react to fired rules. Includes a security-concepts demo layer (simulated tokens,
schema validation, replay-attack detection) and, most recently, a telemetry +
connectivity simulation layer to make the project actually read as IoT engineering
rather than a generic home-automation UI. Fully client-side, no backend. Standalone repo,
separate from the `ashuzaifa` portfolio at `d:\portfolio`. User pushes to GitHub
themselves — Claude never commits/pushes unless explicitly asked.

**Explicit workflow rule (still in force):** all work happens on localhost first. Deploy
to Vercel/Netlify only once the user says the project is 100% complete — not yet reached.

---

## Build Status

| Area | Status |
|---|---|
| Device model + Zustand store | Complete — `deviceStore.setDeviceState` is the single choke point all mutations go through |
| Rule builder (React Flow) | Complete — Trigger/Condition/Action nodes, drag-from-palette, graph→rules compile, debounce, max chain depth 5 |
| 3D floorplan | Complete — one connected house, 5 rooms, real exterior/interior walls with doorway gaps |
| Security demo layer | Complete — simulated per-device token, schema validation, replay-attack demo, live log |
| **Telemetry + connectivity** | Complete (this session) — see dedicated section below |
| Liquid Glass UI theme | Complete — see Design Decisions |
| Full-wall wallpaper (5 original patterns) | Complete |
| Deployment | **Not started** — localhost only per explicit user instruction |

---

## Architecture

```
src/
├── types/device.ts         ← Device, DeviceState (union by type), DeviceType, Room,
│                              Connectivity (online/signalStrength/batteryLevel — orthogonal
│                              to DeviceState, never rule-action-settable), RoomDef
├── data/
│   ├── devices.ts           ← ROOMS, DEVICE_DEFS (raw), INITIAL_DEVICES (DEVICE_DEFS +
│   │                           seeded connectivity via defaultConnectivity())
│   ├── deviceFields.ts      ← FIELDS_BY_TYPE — per-type field lists for rule editor
│   │                           dropdowns. Does NOT include connectivity fields (see
│   │                           Non-goals below).
│   └── nodeCatalog.ts       ← palette templates for the rule editor
├── state/
│   ├── deviceStore.ts       ← devices record, setDeviceState (choke point: applies patch,
│   │                           door lock/open interlock, records security command,
│   │                           records telemetry, calls engine), setConnectivity
│   │                           (separate action — connectivity writes never go through
│   │                           setDeviceState), resetDevices
│   ├── ruleStore.ts         ← React Flow nodes/edges, addNode/updateNodeData/onConnect
│   ├── securityStore.ts     ← tokens, lastCommands, log (capped 50, newest-first via unshift+slice)
│   ├── telemetryStore.ts    ← history: Record<deviceId, TelemetryPoint[]> (capped 40,
│   │                           newest-last), recordReading — same pattern as securityStore's log
│   └── persist.ts           ← localStorage persistence for the RULE GRAPH ONLY
│                                (hydrateRules/persistRulesOnChange). Devices, security log,
│                                and telemetry are NOT persisted — fresh every page load.
├── rules-engine/
│   ├── engine.ts            ← onDeviceChanged(id) reads LIVE device state from the store
│   │                           (not a cached snapshot), evaluates affected rules, fires
│   │                           actions via setDeviceState (recursive, capped depth 5)
│   ├── evaluateCondition.ts ← dynamic field lookup on device.state[field] — this is why
│   │                           adding a new DeviceState field needs zero engine changes.
│   │                           Has an OFFLINE GUARD (added this session): if
│   │                           !device.connectivity.online, condition fails closed —
│   │                           a rule can't fire off stale data from an unreachable device.
│   └── graphToRules.ts      ← pure React Flow graph walk → CompiledRule[]
├── hooks/
│   └── useSimulationHeartbeat.ts  ← mounted once in App.tsx. Every ~3.5s: drifts
│                                     tempSensor/thermostat readings (via setDeviceState,
│                                     so it flows through telemetry + the real rules
│                                     engine for free), drifts signalStrength/batteryLevel,
│                                     rare random disconnect/recovery, battery-hits-0
│                                     forces offline.
├── security/                ← tokenSim.ts, schemaValidate.ts, attackScenarios.ts
├── scene/
│   ├── FloorplanScene.tsx   ← Canvas root, lighting rig, camera/OrbitControls, the
│   │                           device-type → 3D-component switch, SCONCE_LAYOUT map
│   ├── HouseShell.tsx       ← exterior perimeter + interior partition walls (WallSegments,
│   │                           with baseboard trim + crown-molding cap on every wall),
│   │                           Window, Wallpaper + RoomWallpapers (see Wallpaper section),
│   │                           BalconyDeck
│   ├── Room.tsx             ← floor + RoomFurniture per room
│   ├── Furniture.tsx        ← per-room furniture, all wood surfaces use
│   │                           getFurnitureWoodTexture() (not the floor's texture —
│   │                           separate cached singleton so repeat settings don't collide)
│   ├── textures.ts          ← all procedural CanvasTexture generators (floors, walls,
│   │                           wallpaper patterns, rugs, furniture wood)
│   ├── useDeviceAnimation.ts← shared hook: live device state + damped numeric values
│   └── devices/             ← Door, SlidingDoor, Fan, LightFixture, WallSconce,
│                               MotionSensor, Thermostat, AC — one component per device type
├── editor/
│   ├── RuleEditor.tsx, NodePalette.tsx, RuleValidationBanner.tsx
│   └── nodes/{Trigger,Condition,Action}Node.tsx — each shows a live connectivity dot
│         next to the header (teal = online, red = offline) reflecting the selected
│         source device's REAL online status via useDeviceStore, added this session
├── panels/
│   ├── DeviceControlPanel.tsx  ← room-grouped (RoomSection pattern), every device row
│   │                              now shows a compact ConnectivityBadge next to its label
│   ├── NetworkPanel.tsx        ← NEW this session. Room-grouped like DeviceControlPanel;
│   │                              per device: ConnectivityBadge (signal bars + battery %),
│   │                              manual Disconnect/Reconnect button, and for
│   │                              tempSensor/thermostat a Sparkline + current value
│   └── SecurityInfoPanel.tsx, SecurityLogPanel.tsx, AttackDemoPanel.tsx
├── components/
│   ├── Toggle.tsx              ← glass pill switch (flex-based, p-0.5 + translate-x-5)
│   ├── ConnectivityBadge.tsx   ← NEW — 4-bar signal glyph + battery %, `compact` prop
│   │                              drops the battery text (used inline in DeviceControlPanel)
│   └── Sparkline.tsx           ← NEW — minimal inline SVG polyline, no charting library
└── App.tsx                  ← Tab = 'rules'|'devices'|'network'|'security'; useSimulationHeartbeat()
                                 mounted at top of App(); aside panel-style for
                                 devices/network/security, full-screen overlay for rules
```

---

## Telemetry + Connectivity (added this session — the "IoT-centric" pass)

**Why:** the project demonstrated automation logic and a security layer but nothing
IoT-specific — it'd look the same wired to a plain REST API. User (IoT engineering
student) wanted it to signal real IoT literacy: device telemetry over time, and network
reality (signal, battery, disconnects), wired into the *existing* rules engine so it's
not just decorative.

- **`Connectivity`** (`types/device.ts`) is deliberately NOT part of the `DeviceState`
  union — it's orthogonal, and a rule action should never be able to set a device's own
  battery. Every device gets one via `defaultConnectivity(type)` in `data/devices.ts`:
  mains-powered types (`light`, `fan`, `ac`, `thermostat`) get `batteryLevel: null`;
  battery-typical types (`door`, `motionSensor`, `tempSensor`) get a number.
- **The offline guard in `evaluateCondition.ts`** is the actual payoff: existing rules
  keep working exactly as before, but now correctly refuse to fire on stale data from a
  disconnected device. Verify by: build a rule (e.g. temp sensor > 20° → light on),
  disconnect that sensor in the Network tab, confirm it doesn't fire even as the value
  crosses the threshold (heartbeat keeps nudging it), reconnect, confirm it does.
- **Non-goal (explicit, may revisit):** `online`/`signalStrength`/`batteryLevel` are NOT
  exposed as selectable condition/action fields in the rule editor's `FIELDS_BY_TYPE`
  dropdowns. Doing that cleanly needs splitting that map into trigger/condition-fields
  vs action-fields (actions patch `DeviceState`, connectivity intentionally isn't part of
  it). The offline-guard behavior delivers the "rules respect connectivity" story
  without that split.
- **Non-goal:** no persistence for telemetry/connectivity, matching how `deviceStore`
  and `securityStore` already work (in-memory only; only the rule graph persists).

---

## Design Decisions (with reasoning)

### Liquid Glass UI theme
Dark neutral backdrop (`--color-bg: #16171b`) with soft colored radial-gradient blobs
behind everything (`body::before`, fixed, teal/orange/olive/red at low opacity) — this is
what the `backdrop-filter: blur()` on `.glass-panel` actually picks up. `.glass-panel`
= translucent white fill (`--color-panel: rgba(255,255,255,0.07)`) + blur(24px)
saturate(160%) + soft top-sheen gradient overlay + inset highlight border. `.glass-frame`
= same border/shadow, no blur — used for the 3D viewport container specifically, since
blurring the live Three.js canvas behind a translucent panel produced a distracting
blurred-house-blob artifact (bug hit and fixed this session — the Rule Builder's
full-screen overlay now uses `bg-bg/92 backdrop-blur-2xl` instead of `.glass-panel` for
the same reason).

Color history (context for why tokens look the way they do): Olive Depth/Soft Sand →
`#fdf6f6` primary → `#3b3c36`/`#d99058` → current dark Liquid Glass palette. Text tokens
are unified (`--color-ink` === `--color-text`) since glass panels no longer have a
"light panel on dark bg" context like the old solid-terracotta theme did.

Custom range slider (`.glass-slider` in `index.css`): shapes the thumb + track height
only; per-instance `background` (gradient) is set via inline `style`, e.g. the
temperature slider's blue→green→red zone gradient in `DeviceControlPanel.tsx`.

### Room-grouped control panel
`DeviceControlPanel.tsx`'s `RoomSection` wraps each room's devices in one glass card
with a header (status dot + room name + device count) instead of one flat list —
requested explicitly ("more of a control panel look"). `NetworkPanel.tsx` reuses the
exact same `RoomSection` visual pattern for consistency.

### Temperature slider zones
`TemperatureSlider` in `DeviceControlPanel.tsx`: static 3-color background gradient
(blue 10-18°, green 18-26°, red 26-35°) using the theme's accent-info/accent/
accent-danger tokens, independent of current value — the thumb's position shows where
in the zones the reading falls. Current value label floats inside the track's empty
side (flips left/right based on thumb position) rather than as separate text.

### Wall-mounted sconces, not hanging pendants
`SCONCE_LAYOUT` in `FloorplanScene.tsx` renders light devices as a pair of wall sconces
on opposite walls instead of one ceiling pendant, for living room/kitchen/both bedrooms
(bathroom keeps the original `LightFixture` pendant). Positions are room-local offsets;
double-check against `HouseShell.tsx`'s window/door world positions when moving one — a
sconce was once positioned directly over the living room's west window and had to be
relocated (see Bugs Hit and Resolved).

### AC devices
`ac` device type (`on: boolean` only) — living room + bedroom 1 only. 3D component
(`scene/devices/AC.tsx`) is a wall-mounted unit with a status LED (red off / green on).
Positions were chosen to sit clear of existing windows/doors/sconces on the same wall
(required a repositioning pass — see Bugs Hit and Resolved).

### Door lock/open interlock
`deviceStore.setDeviceState`: if a patch would leave a door both `locked: true` and
`open: true`, the `open` change is refused (locking always wins). Applied at the single
choke point so it holds for manual clicks AND anything the rules engine tries to fire.
UI: the "Open" button is `disabled` + dimmed while locked (`DeviceControlPanel.tsx`).

### Full-wall wallpaper (5 original patterns, not murals)
Per explicit user request: "spread throughout ALL walls, no blank plain walls." Each
room has its own **tileable** pattern (not a one-off mural) applied to *every* wall run
bordering that room via `ROOM_WALLPAPER_RUNS` (`HouseShell.tsx`) — a hand-derived table
of every wall segment per room (4 sides, split around door/passthrough gaps), rendered
by `RoomWallpapers`. This is 1:1 with the actual wall geometry (same fixed/ranges data
the walls themselves are built from), so it can't drift out of sync if the floor plan
changes. Patterns (all self-designed, no reference imagery, generated in `textures.ts`):
living room = art-deco scalloped arches, bedroom 1 = scattered dots, bedroom 2 =
scallop-wave stripes, kitchen = diamond lattice, bathroom = ripple lines. First attempt
used reference-image-inspired murals (marble wave / branch silhouette / cherry blossom)
on a single accent wall per room — replaced entirely per user request ("get rid of the
wallpapers ... replace with wallpapers of your own").

### Crown molding + baseboard on every wall
`WallSegments` in `HouseShell.tsx` renders a dark cap trim at the top and a white
baseboard trim at the bottom of every wall run — originally the cap only existed on
exterior perimeter walls; extended to interior partitions too per explicit request
("add it to the top of every wall").

### Wood furniture texture
All furniture wood surfaces (`Furniture.tsx`) use `getFurnitureWoodTexture()` — a
dedicated grain texture, deliberately separate from the floor's `getWoodFloorTexture()`
even though both are wood, because both are cached singletons and would otherwise fight
over one shared `texture.repeat` setting.

### 3D assets: procedural only
Explicit user decision when asked: keep all 3D assets built from Three.js
primitives/materials/canvas textures (no GLTF imports, no external asset licensing to
track). Applies to any future "level up the visuals" work too unless the user changes
their mind.

---

## Bugs Hit and Resolved (this session)

**Fan blades all bunched to one side instead of forming a symmetric "+"**
Cause: each blade mesh had both `position` and `rotation` set directly — in Three.js,
translation always applies in the *parent's* (unrotated) coordinate space, so all 4
blades translated to the same spot and just spun in place there.
Fix: nest each blade in its own `<group rotation={...}>` and put the position offset on
a child `<mesh>` inside that group, so the offset is correctly carried along the
group's rotated axis.

**Living room wall sconce mounted directly over the west window**
Cause: `SCONCE_LAYOUT`'s west-wall z-offset for `living-room-light` landed inside the
window's world-z span. Fix: moved to a z clear of both the window and the front door.

**Toggle switch thumb/track misalignment**
Fixed by switching to the standard Tailwind-UI-style flex pattern (`p-0.5` + `items-center`
track, `translate-x-0`/`translate-x-5` thumb) instead of absolute positioning.

**Sidebar wouldn't scroll — bottom room cards unreachable**
Two separate causes, both flexbox defaults: (1) `main`/`aside` in `App.tsx` had no
`min-h-0`, so they grew to fit content instead of respecting the available height
(default `min-height: auto` on flex items); (2) the scroll container itself is
`flex flex-col`, and without `shrink-0` on its children (room cards, panel title) they
were being flex-*compressed* to fit rather than allowed to overflow, so `scrollHeight`
kept reporting equal to `clientHeight` even after fix (1). Fixed both.

**Rule Builder overlay blurred the live 3D scene into a distracting blob**
Cause: the full-screen overlay used `.glass-panel` (light 7%-opacity fill +
`backdrop-filter: blur`), which picked up and blurred the still-mounted `FloorplanScene`
canvas rendering behind it. Fixed by giving that one overlay a near-opaque
`bg-bg/92 backdrop-blur-2xl` instead.

**AC units placed on top of/too close to existing wall fixtures**
First placement attempt for `living-room-ac` landed at the same wall-z as the relocated
sconce. Repositioned to a clear stretch (south of the window, north of nothing else on
that wall).

---

## Node / Environment

- Node: at `D:\Node.js`; PowerShell primary, but **git commits must use the Bash tool**
  (PowerShell 5.1 doesn't support heredocs).
- **This repo is outside the sandbox's default working directory** (`d:\portfolio`) —
  `cd`/`Set-Location` into `D:\smart-home-hub` gets silently reset. Always run
  commands via `--prefix`, e.g.:
  ```
  npx --prefix "D:/smart-home-hub" tsc --noEmit -p "D:/smart-home-hub/tsconfig.app.json"
  npm --prefix "D:/smart-home-hub" run build
  npm --prefix "D:/smart-home-hub" run dev -- --port 5183
  ```
- Dev server convention this session: port `5183`.
- GitHub remote: `https://github.com/AsHuzaifa/smart-home-hub.git`, branch `main`. User
  pushes themselves — don't commit/push unless explicitly asked.
- Playwright (headless Chromium, SwiftShader software rendering) used for visual
  verification throughout — screenshots + console/pageerror capture, run from the
  session scratchpad directory (path changes per session; check the current
  `<system-reminder>` for the active one). Dragging/wiring React Flow nodes
  programmatically is fragile (handle bounding boxes, node-drag vs edge-drag
  ambiguity) — prefer verifying new rule-engine logic via type-safety + targeted
  screenshots of individual nodes over full automated drag-and-drop graph construction.

## Package Versions

```
react / react-dom:      ^19.2.8
vite:                   ^8.2.2
typescript:             ~6.0.2
tailwindcss:            ^4.3.3  (via @tailwindcss/vite)
reactflow:               ^11.11.4
zustand:                ^5.0.15
three:                  ^0.185.1
@react-three/fiber:     ^9.7.0
@react-three/drei:      ^10.7.8
nanoid:                 ^6.0.1
```
No charting library, no GSAP/framer-motion, no react-router — all explicitly skipped by
earlier decision; keep it that way unless the user asks otherwise.

---

## What's Next / Open Items

- Deployment (Vercel/Netlify) — explicitly on hold until the user says the project is
  100% complete.
- Bundle size warning on build (~1.4MB main chunk) — not yet addressed; would need
  dynamic `import()` code-splitting (e.g. lazy-load the RuleEditor/React Flow bundle
  behind the Rules tab). Not urgent for a portfolio piece on localhost.
- Possible follow-up on the telemetry/connectivity pass: exposing connectivity fields
  in the rule editor's condition/action dropdowns (needs splitting `FIELDS_BY_TYPE`
  into trigger/condition vs action variants — see Non-goals above).
- No ESLint/Prettier config yet (uses `oxlint`, not otherwise configured further).
