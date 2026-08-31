import type { Device } from '../types/device';
import type { ConditionNodeData } from '../types/rule';

export function evaluateCondition(condition: ConditionNodeData, devices: Record<string, Device>): boolean {
  const device = devices[condition.sourceDeviceId];
  if (!device) return false;

  // A rule can't trust a reading from a device it can't currently reach - an
  // offline device's last-known state is stale, so any condition depending on
  // it fails closed rather than silently firing on old data.
  if (!device.connectivity.online) return false;

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
