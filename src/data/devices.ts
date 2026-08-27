import type { Device, RoomDef } from '../types/device';

export const ROOMS: RoomDef[] = [
  { id: 'living-room', label: 'Living Room', bounds: { x: -4, z: -4, width: 8, depth: 8 } },
  { id: 'kitchen', label: 'Kitchen', bounds: { x: 6, z: -4, width: 6, depth: 8 } },
  { id: 'bedroom', label: 'Bedroom', bounds: { x: -4, z: 6, width: 8, depth: 6 } },
  { id: 'hallway', label: 'Hallway', bounds: { x: 6, z: 6, width: 6, depth: 6 } },
];

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'living-room-light',
    type: 'light',
    room: 'living-room',
    label: 'Living Room Light',
    position: [0, 1.6, 0],
    state: { type: 'light', on: false, brightness: 0.8 },
  },
  {
    id: 'living-room-fan',
    type: 'fan',
    room: 'living-room',
    label: 'Living Room Fan',
    position: [2, 2, -2],
    state: { type: 'fan', on: false, speed: 0.6 },
  },
  {
    id: 'living-room-motion',
    type: 'motionSensor',
    room: 'living-room',
    label: 'Living Room Motion Sensor',
    position: [-3, 1, -3],
    state: { type: 'motionSensor', motion: false, lastTriggeredAt: null },
  },
  {
    id: 'living-room-temp',
    type: 'tempSensor',
    room: 'living-room',
    label: 'Living Room Temp Sensor',
    position: [-3, 0.5, 3],
    state: { type: 'tempSensor', temp: 22 },
  },
  {
    id: 'kitchen-light',
    type: 'light',
    room: 'kitchen',
    label: 'Kitchen Light',
    position: [0, 1.6, 0],
    state: { type: 'light', on: false, brightness: 0.9 },
  },
  {
    id: 'bedroom-light',
    type: 'light',
    room: 'bedroom',
    label: 'Bedroom Light',
    position: [0, 1.6, 0],
    state: { type: 'light', on: false, brightness: 0.5 },
  },
  {
    id: 'bedroom-thermostat',
    type: 'thermostat',
    room: 'bedroom',
    label: 'Bedroom Thermostat',
    position: [2, 1, 2],
    state: { type: 'thermostat', targetTemp: 21, currentTemp: 23 },
  },
  {
    id: 'hallway-door',
    type: 'door',
    room: 'hallway',
    label: 'Front Door',
    position: [0, 1, -2],
    state: { type: 'door', locked: true, open: false },
  },
  {
    id: 'hallway-motion',
    type: 'motionSensor',
    room: 'hallway',
    label: 'Hallway Motion Sensor',
    position: [-2, 1, 2],
    state: { type: 'motionSensor', motion: false, lastTriggeredAt: null },
  },
];
