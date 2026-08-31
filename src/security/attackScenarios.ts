import { useDeviceStore } from '../state/deviceStore';
import { useSecurityStore } from '../state/securityStore';
import { checkFreshness, validatePatch } from './schemaValidate';
import type { SecurityEvent } from '../types/security';

export type ReplayAttackResult = Pick<SecurityEvent, 'verdict' | 'reason'>;

// Simulated replay attack: re-submits the last legitimate command captured for a
// device, but stamped with a stale timestamp - illustrates a naive freshness
// check, not real cryptographic replay protection (no signatures/nonces here).
// Returns the outcome so callers can surface it inline, in addition to it being
// recorded in the shared Security Log.
export function runReplayAttack(deviceId: string): ReplayAttackResult {
  const device = useDeviceStore.getState().devices[deviceId];
  const lastCommand = useSecurityStore.getState().lastCommands[deviceId];
  const pushEvent = useSecurityStore.getState().pushEvent;

  if (!device || !lastCommand) {
    const result: ReplayAttackResult = { verdict: 'rejected', reason: 'No prior command exists to replay' };
    pushEvent({ deviceId, timestamp: Date.now(), ...result });
    return result;
  }

  const staleTimestamp = Date.now() - 60_000;

  const schemaResult = validatePatch(device.type, lastCommand.patch);
  const freshnessResult = checkFreshness(staleTimestamp);

  if (!schemaResult.valid) {
    const result: ReplayAttackResult = { verdict: 'rejected', reason: schemaResult.reason };
    pushEvent({ deviceId, timestamp: Date.now(), ...result });
    return result;
  }

  if (!freshnessResult.valid) {
    const result: ReplayAttackResult = { verdict: 'rejected', reason: `Replay detected: ${freshnessResult.reason}` };
    pushEvent({ deviceId, timestamp: Date.now(), ...result });
    return result;
  }

  const result: ReplayAttackResult = { verdict: 'accepted', reason: 'Command accepted' };
  pushEvent({ deviceId, timestamp: Date.now(), ...result });
  return result;
}
