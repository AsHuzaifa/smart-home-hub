import { HelpButton } from '../components/HelpButton';
import { SecurityHelpContent } from '../components/SecurityHelpContent';
import { useDeviceStore } from '../state/deviceStore';
import { useSecurityStore } from '../state/securityStore';
import { validatePatch } from '../security/schemaValidate';
import { AttackDemoPanel } from './AttackDemoPanel';
import type { DeviceType } from '../types/device';

const EXPLAINERS: Record<DeviceType, string> = {
  light: 'Commands to this device are checked against an expected schema before being applied - only "on" and "brightness" fields are accepted.',
  fan: 'Fan speed and on/off state are validated against expected types before being applied to the device.',
  door: 'Lock/unlock and open/close commands are the most sensitive in this simulation - they are schema-checked and are the target of the replay-attack demo below.',
  thermostat: 'Target and current temperature updates are checked to be numeric before being applied.',
  motionSensor: 'Motion events carry a timestamp used both by the rules engine and by this security layer\'s freshness check.',
  tempSensor: 'Temperature readings are validated as numeric before the rules engine evaluates any conditions against them.',
  ac: 'Commands to this device are checked against an expected schema before being applied - only the "on" field is accepted.',
};

export function SecurityInfoPanel({ deviceId, onClose }: { deviceId: string; onClose: () => void }) {
  const device = useDeviceStore((s) => s.devices[deviceId]);
  const token = useSecurityStore((s) => s.tokens[deviceId]);
  const lastCommand = useSecurityStore((s) => s.lastCommands[deviceId]);

  if (!device) return null;

  const validation = lastCommand ? validatePatch(device.type, lastCommand.patch) : null;

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <h2 className="text-sm font-medium">{device.label}</h2>
          <HelpButton title="Security">
            <SecurityHelpContent />
          </HelpButton>
        </span>
        <button onClick={onClose} className="rounded-full px-2 py-1 text-xs text-ink-muted transition-colors hover:bg-white/5 hover:text-ink">
          Close ✕
        </button>
      </div>

      <p className="rounded-xl border border-accent-info/30 bg-accent-info/10 p-2.5 text-xs text-accent-info backdrop-blur-md">
        This panel simulates security concepts for teaching purposes - it is not real
        cryptography or a real authentication system.
      </p>

      <div className="text-xs text-ink-muted">
        Simulated device token
        <div className="mt-1 rounded-lg bg-bg-deep px-2.5 py-1.5 font-mono text-paper backdrop-blur-md">{token}</div>
      </div>

      <p className="text-xs text-ink-muted">{EXPLAINERS[device.type]}</p>

      {validation && (
        <div className="flex items-center gap-1.5 text-xs">
          Last command validation:
          <span className={`h-2 w-2 shrink-0 rounded-full ${validation.valid ? 'bg-accent' : 'bg-accent-danger'}`} />
          <span className="font-medium">
            {validation.valid ? 'Passed' : 'Failed'} - {validation.reason}
          </span>
        </div>
      )}

      <AttackDemoPanel deviceId={deviceId} />
    </div>
  );
}
