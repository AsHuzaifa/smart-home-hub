export type Room = 'living-room' | 'bedroom' | 'kitchen' | 'hallway';

export type DeviceType =
  | 'light'
  | 'fan'
  | 'door'
  | 'thermostat'
  | 'motionSensor'
  | 'tempSensor';

export type DeviceState =
  | { type: 'light'; on: boolean; brightness: number }
  | { type: 'fan'; on: boolean; speed: number }
  | { type: 'door'; locked: boolean; open: boolean }
  | { type: 'thermostat'; targetTemp: number; currentTemp: number }
  | { type: 'motionSensor'; motion: boolean; lastTriggeredAt: number | null }
  | { type: 'tempSensor'; temp: number };

export interface Device {
  id: string;
  type: DeviceType;
  room: Room;
  label: string;
  position: [number, number, number];
  state: DeviceState;
}

export interface RoomDef {
  id: Room;
  label: string;
  bounds: { x: number; z: number; width: number; depth: number };
}
