import type { Connectivity, Device, DeviceType, RoomDef } from '../types/device';

// Mains-powered device types report no battery; the rest are the kind of small
// wireless sensors/locks that realistically ship on battery.
const MAINS_POWERED: DeviceType[] = ['light', 'fan', 'ac', 'thermostat'];

function defaultConnectivity(type: DeviceType): Connectivity {
  return {
    online: true,
    signalStrength: 80 + Math.round(Math.random() * 15),
    batteryLevel: MAINS_POWERED.includes(type) ? null : 70 + Math.round(Math.random() * 20),
  };
}

// Rooms tile a single 16x14 footprint edge-to-edge (no gaps), plus a balcony
// deck extending south off the living room. See HouseShell.tsx for the real
// exterior perimeter + interior partition walls (with doorway gaps) built
// from these bounds.
export const ROOMS: RoomDef[] = [
  { id: 'living-room', label: 'Living Room', bounds: { x: 0, z: 0, width: 9, depth: 8 } },
  { id: 'kitchen', label: 'Kitchen', bounds: { x: 9, z: 0, width: 7, depth: 8 } },
  { id: 'bedroom-1', label: 'Bedroom 1', bounds: { x: 0, z: 8, width: 7, depth: 6 } },
  { id: 'bathroom', label: 'Bathroom', bounds: { x: 7, z: 8, width: 3, depth: 6 } },
  { id: 'bedroom-2', label: 'Bedroom 2', bounds: { x: 10, z: 8, width: 6, depth: 6 } },
];

const DEVICE_DEFS: Omit<Device, 'connectivity'>[] = [
  {
    id: 'living-room-light',
    type: 'light',
    room: 'living-room',
    label: 'Living Room Light',
    position: [1, 1.6, -1],
    state: { type: 'light', on: false, brightness: 0.8 },
  },
  {
    id: 'living-room-fan',
    type: 'fan',
    room: 'living-room',
    label: 'Living Room Fan',
    position: [-1.5, 2.3, 1.5],
    state: { type: 'fan', on: false, speed: 0.6 },
  },
  {
    id: 'living-room-motion',
    type: 'motionSensor',
    room: 'living-room',
    label: 'Living Room Motion Sensor',
    // South (min-z) exterior wall, clear of the balcony door opening.
    position: [-3.5, 1, -3.95],
    state: { type: 'motionSensor', motion: false, lastTriggeredAt: null },
  },
  {
    id: 'living-room-temp',
    type: 'tempSensor',
    room: 'living-room',
    label: 'Living Room Temp Sensor',
    position: [3, 0.5, 3],
    state: { type: 'tempSensor', temp: 22 },
  },
  {
    id: 'front-door',
    type: 'door',
    room: 'living-room',
    label: 'Front Door',
    // West exterior wall opening.
    position: [-4.5, 0, 1.6],
    variant: 'swing',
    rotationY: Math.PI / 2,
    state: { type: 'door', locked: true, open: false },
  },
  {
    id: 'living-room-ac',
    type: 'ac',
    room: 'living-room',
    label: 'Living Room AC',
    // West exterior wall, south of the window (clear of the window, the
    // relocated wall sconce, and the front door, which are all further north).
    position: [-4.4, 2.05, -3.3],
    rotationY: Math.PI / 2,
    state: { type: 'ac', on: false },
  },
  {
    id: 'balcony-door',
    type: 'door',
    room: 'living-room',
    label: 'Balcony Door',
    // South exterior wall opening, leads out to the balcony deck.
    position: [-0.5, 0, -4],
    variant: 'slide',
    state: { type: 'door', locked: true, open: false },
  },
  {
    id: 'kitchen-light',
    type: 'light',
    room: 'kitchen',
    label: 'Kitchen Light',
    position: [0, 1.6, 1],
    state: { type: 'light', on: false, brightness: 0.9 },
  },
  {
    id: 'bedroom-1-light',
    type: 'light',
    room: 'bedroom-1',
    label: 'Bedroom 1 Light',
    position: [0, 1.6, -1],
    state: { type: 'light', on: false, brightness: 0.5 },
  },
  {
    id: 'bedroom-1-thermostat',
    type: 'thermostat',
    room: 'bedroom-1',
    label: 'Bedroom 1 Thermostat',
    // Partition wall shared with the living room, clear of the doorway gap.
    position: [1.5, 1, -2.95],
    state: { type: 'thermostat', targetTemp: 21, currentTemp: 23 },
  },
  {
    id: 'bedroom-1-ac',
    type: 'ac',
    room: 'bedroom-1',
    label: 'Bedroom 1 AC',
    // East wall, shared with the bathroom - clear of the wall-mounted TV.
    position: [3.42, 2.05, 1.5],
    rotationY: -Math.PI / 2,
    state: { type: 'ac', on: false },
  },
  {
    id: 'bedroom-1-door',
    type: 'door',
    room: 'bedroom-1',
    label: 'Bedroom 1 Door',
    position: [-0.9, 0, -3],
    variant: 'swing',
    state: { type: 'door', locked: false, open: false },
  },
  {
    id: 'bathroom-light',
    type: 'light',
    room: 'bathroom',
    label: 'Bathroom Light',
    position: [0, 1.8, -1],
    state: { type: 'light', on: false, brightness: 0.7 },
  },
  {
    id: 'bathroom-door',
    type: 'door',
    room: 'bathroom',
    label: 'Bathroom Door',
    position: [-1.5, 0, 0],
    variant: 'swing',
    rotationY: Math.PI / 2,
    state: { type: 'door', locked: false, open: false },
  },
  {
    id: 'bedroom-2-light',
    type: 'light',
    room: 'bedroom-2',
    label: 'Bedroom 2 Light',
    position: [0, 1.6, -1],
    state: { type: 'light', on: false, brightness: 0.5 },
  },
  {
    id: 'bedroom-2-motion',
    type: 'motionSensor',
    room: 'bedroom-2',
    label: 'Bedroom 2 Motion Sensor',
    // Partition wall shared with the kitchen, clear of the doorway gap.
    position: [-2, 1, -2.95],
    state: { type: 'motionSensor', motion: false, lastTriggeredAt: null },
  },
  {
    id: 'bedroom-2-door',
    type: 'door',
    room: 'bedroom-2',
    label: 'Bedroom 2 Door',
    position: [0.6, 0, -3],
    variant: 'swing',
    state: { type: 'door', locked: false, open: false },
  },
];

export const INITIAL_DEVICES: Device[] = DEVICE_DEFS.map((d) => ({
  ...d,
  connectivity: defaultConnectivity(d.type),
}));
