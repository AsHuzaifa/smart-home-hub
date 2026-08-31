import { FIELDS_BY_TYPE } from '../data/deviceFields';
import type { DeviceType } from '../types/device';

const ALLOWED_FIELDS: Record<DeviceType, Record<string, 'boolean' | 'number'>> = Object.fromEntries(
  Object.entries(FIELDS_BY_TYPE).map(([type, fields]) => [
    type,
    Object.fromEntries(fields.map((f) => [f.key, f.type])),
  ]),
) as Record<DeviceType, Record<string, 'boolean' | 'number'>>;

export interface ValidationResult {
  valid: boolean;
  reason: string;
}

// Structural check only - confirms patch keys/types match the device's expected
// shape. Not a substitute for real input validation against an external API.
export function validatePatch(
  deviceType: DeviceType,
  patch: Record<string, unknown>,
): ValidationResult {
  const allowed = ALLOWED_FIELDS[deviceType];

  for (const [key, value] of Object.entries(patch)) {
    if (!(key in allowed)) {
      return { valid: false, reason: `Unexpected field "${key}" for device type "${deviceType}"` };
    }
    const expectedType = allowed[key];
    if (value !== null && typeof value !== expectedType) {
      return { valid: false, reason: `Field "${key}" expected ${expectedType}, got ${typeof value}` };
    }
  }

  return { valid: true, reason: 'Schema OK' };
}

export const MAX_COMMAND_AGE_MS = 10_000;

export function checkFreshness(timestamp: number): ValidationResult {
  const age = Date.now() - timestamp;
  if (age > MAX_COMMAND_AGE_MS) {
    return { valid: false, reason: `Command is ${Math.round(age / 1000)}s old - exceeds freshness window` };
  }
  return { valid: true, reason: 'Fresh' };
}
