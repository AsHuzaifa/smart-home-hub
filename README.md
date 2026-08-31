# Smart Home Hub

A client-side simulation of a smart home automation system: a drag-and-drop
rules engine wired to a live 3D floorplan where simulated
devices - lights, fans, an AC unit, doors, a thermostat, temperature and
motion sensors - visibly react in real time as rules fire. It also models two
things a plain home-automation demo usually skips: device connectivity
(signal, battery, disconnects) and a simulated command-security layer, both
wired into the real rules engine rather than just decorative.

Live site:- smarthome-delta-ten.vercel.app

## What it does

The app is split into four tabs, each with its own "?" help button explaining
what it does in more detail (there's also an "About" button next to the title
with a project-wide overview):

- **Devices** - a room-grouped control panel: toggle lights/fans/AC, lock or
  open doors, adjust thermostats and temperature sensors, trigger motion. A
  device that's currently offline can't be commanded here until it reconnects.
- **Rules** - a React Flow canvas for wiring up automations visually: drag
  Trigger / Condition / Action nodes onto the canvas and connect them, e.g.
  "if living room temp > 25 AND motion detected -> turn on fan." Multiple
  condition nodes feeding one action node are combined with AND. Nodes can be
  deleted with the small close button in their header. A validation banner
  flags unconnected nodes, missing device/field selections, or a rule with no
  action.
- **Network** - a simulated connectivity layer: every device has a signal
  strength, and battery-powered devices (doors, sensors) drain over time and
  can lose connection; devices also drift and disconnect on their own
  periodically to mimic real-world flakiness. This is wired into the rules
  engine for real - a rule can't fire off a stale reading from a device that's
  currently unreachable, and it can't be manually commanded either. Devices
  can be reconnected manually from this tab.
- **Security** - click any device in the 3D scene to open a panel explaining,
  in plain terms, the simulated security model behind it (a fake per-device
  token, schema-validated commands), plus a one-click simulated **replay
  attack** demo. Running it shows the outcome inline (blocked or accepted,
  and why) instead of leaving you to guess, and every simulated check is also
  recorded in the Security Log. Everything here is explicitly labeled as
  **simulation** - there is no real cryptography or authentication involved.

## Stack

React + TypeScript + Vite, [React Flow](https://reactflow.dev/) for the rule
graph, [React Three Fiber](https://r3f.docs.pmnd.rs/) for the 3D scene,
[Zustand](https://zustand-demo.pmnd.rs/) for state, Tailwind CSS for styling.
Fully client-side - no backend, no real MQTT/WebSocket broker. Only the rule
graph persists, to `localStorage`; devices, telemetry, and the security log
reset on every page load.

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
- Exposing connectivity fields (battery, signal) as selectable condition
  fields in the rule editor
- Mobile-friendly layout for the combined 3D + node-editor view
