import { useDeviceStore } from '../state/deviceStore';
import { useSecurityStore } from '../state/securityStore';
import { checkFreshness, validatePatch } from './schemaValidate';

// Simulated replay attack: re-submits the last legitimate command captured for a
// device, but stamped with a stale timestamp — illustrates a naive freshness
// check, not real cryptographic replay protection (no signatures/nonces here).
export function runReplayAttack(deviceId: string) {
  const device = useDeviceStore.getState().devices[deviceId];
  const lastCommand = useSecurityStore.getState().lastCommands[deviceId];
  const pushEvent = useSecurityStore.getState().pushEvent;

  if (!device || !lastCommand) {
    pushEvent({
      deviceId,
      timestamp: Date.now(),
      verdict: 'rejected',
      reason: 'No prior command exists to replay',
    });
    return;
  }

  const staleTimestamp = Date.now() - 60_000;

  const schemaResult = validatePatch(device.type, lastCommand.patch);
  const freshnessResult = checkFreshness(staleTimestamp);

  if (!schemaResult.valid) {
    pushEvent({ deviceId, timestamp: Date.now(), verdict: 'rejected', reason: schemaResult.reason });
    return;
  }

  if (!freshnessResult.valid) {
    pushEvent({ deviceId, timestamp: Date.now(), verdict: 'rejected', reason: `Replay detected: ${freshnessResult.reason}` });
    return;
  }

  pushEvent({ deviceId, timestamp: Date.now(), verdict: 'accepted', reason: 'Command accepted' });
}
