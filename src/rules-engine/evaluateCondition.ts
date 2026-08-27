import type { Device } from '../types/device';
import type { ConditionNodeData } from '../types/rule';

export function evaluateCondition(condition: ConditionNodeData, devices: Record<string, Device>): boolean {
  const device = devices[condition.sourceDeviceId];
  if (!device) return false;

  const actual = (device.state as Record<string, unknown>)[condition.field];
  if (actual === undefined) return false;

  switch (condition.operator) {
    case '>':
      return (actual as number) > (condition.value as number);
    case '<':
      return (actual as number) < (condition.value as number);
    case '>=':
      return (actual as number) >= (condition.value as number);
    case '<=':
      return (actual as number) <= (condition.value as number);
    case '==':
      return actual === condition.value;
    default:
      return false;
  }
}
