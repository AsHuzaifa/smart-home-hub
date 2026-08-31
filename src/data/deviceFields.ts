import type { DeviceType } from '../types/device';

export interface FieldDef {
  key: string;
  type: 'boolean' | 'number';
}

export const FIELDS_BY_TYPE: Record<DeviceType, FieldDef[]> = {
  light: [{ key: 'on', type: 'boolean' }, { key: 'brightness', type: 'number' }],
  fan: [{ key: 'on', type: 'boolean' }, { key: 'speed', type: 'number' }],
  door: [{ key: 'locked', type: 'boolean' }, { key: 'open', type: 'boolean' }],
  thermostat: [{ key: 'targetTemp', type: 'number' }, { key: 'currentTemp', type: 'number' }],
  motionSensor: [{ key: 'motion', type: 'boolean' }, { key: 'lastTriggeredAt', type: 'number' }],
  tempSensor: [{ key: 'temp', type: 'number' }],
  ac: [{ key: 'on', type: 'boolean' }],
};
