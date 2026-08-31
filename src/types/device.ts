export type Room = 'living-room' | 'kitchen' | 'bedroom-1' | 'bedroom-2' | 'bathroom';

export type DeviceType =
  | 'light'
  | 'fan'
  | 'door'
  | 'thermostat'
  | 'motionSensor'
  | 'tempSensor'
  | 'ac';

export type DeviceState =
  | { type: 'light'; on: boolean; brightness: number }
  | { type: 'fan'; on: boolean; speed: number }
  | { type: 'door'; locked: boolean; open: boolean }
  | { type: 'thermostat'; targetTemp: number; currentTemp: number }
  | { type: 'motionSensor'; motion: boolean; lastTriggeredAt: number | null }
  | { type: 'tempSensor'; temp: number }
  | { type: 'ac'; on: boolean };

// Orthogonal to DeviceState - every device has connectivity regardless of type,
// and it's never something a rule action should be able to set (a rule can't
// reach out and change a device's own battery), so it's kept out of the
// DeviceState union and out of the rule editor's action field list entirely.
export interface Connectivity {
  online: boolean;
  signalStrength: number; // 0-100
  batteryLevel: number | null; // 0-100, null for mains-powered devices
}

export interface Device {
  id: string;
  type: DeviceType;
  room: Room;
  label: string;
  position: [number, number, number];
  state: DeviceState;
  connectivity: Connectivity;
  /** Rendering style for 'door' devices - swing (hinged) or slide (glass slider, e.g. a balcony). */
  variant?: 'swing' | 'slide';
  /** Y-axis rotation so a 'door' device sits flush in whichever wall it's set into. */
  rotationY?: number;
}

export interface RoomDef {
  id: Room;
  label: string;
  bounds: { x: number; z: number; width: number; depth: number };
}
