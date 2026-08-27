# Smart Home Hub

A client-side simulation of a smart home automation system: a drag-and-drop
rules engine (à la Node-RED) wired to a live 3D floorplan where simulated
devices — lights, fans, doors, a thermostat, motion sensors — visibly react
in real time as rules fire.

**[Live demo](#)** _(add the deployed URL here once live)_

## What it does

- **3D floorplan** — a handful of rooms rendered with Three.js / React Three
  Fiber. Devices are simple animated meshes: lights glow, fan blades spin,
  doors swing open, a thermostat panel shows live temperature.
- **Rule builder** — a React Flow canvas for wiring up automations visually:
  drag Trigger / Condition / Action nodes onto the canvas and connect them,
  e.g. "if living room temp > 25° AND motion detected → turn on fan."
  Multiple conditions feeding one action node are combined with AND.
- **Manual device panel** — sliders and toggles to simulate sensor readings
  (raise the temperature, trigger motion, lock/unlock a door) since there's
  no real hardware behind this.
- **Security demo layer** — click any device in the 3D scene to open a panel
  explaining, in plain terms, the simulated security model behind it (a
  fake per-device token, schema-validated commands), plus a one-click
  simulated **replay attack** demo that gets rejected by a simplified
  timestamp-freshness check. Everything here is explicitly labeled as
  **simulation** — there is no real cryptography or authentication involved.

## Stack

React + TypeScript + Vite, [React Flow](https://reactflow.dev/) for the rule
graph, [React Three Fiber](https://r3f.docs.pmnd.rs/) for the 3D scene,
[Zustand](https://zustand-demo.pmnd.rs/) for state, Tailwind CSS for styling.
Fully client-side — no backend, no real MQTT/WebSocket broker. Rule graphs
persist to `localStorage`.

## Running locally

```bash
npm install
npm run dev
```

## What's intentionally out of scope

This is a portfolio piece demonstrating a rules-engine + 3D-simulation
architecture, not a production IoT platform: no real backend, no real
hardware/MQTT integration, no real authentication, no real cryptography.
The security layer teaches concepts through an honest simulation rather
than claiming to be a real secure system.

## Possible future work

- OR logic / nested condition groups in the rule builder
- A second attack scenario (e.g. malformed command / schema fuzzing)
- Mobile-friendly layout for the combined 3D + node-editor view
