import { runReplayAttack } from '../security/attackScenarios';
import { useSecurityStore } from '../state/securityStore';

export function AttackDemoPanel({ deviceId }: { deviceId: string }) {
  const hasLastCommand = useSecurityStore((s) => Boolean(s.lastCommands[deviceId]));

  return (
    <div className="mt-2 rounded border border-border p-2">
      <h3 className="text-xs font-medium">Simulated replay attack</h3>
      <p className="mt-1 text-xs text-muted">
        Re-sends this device's last command with a stale timestamp. A simplified
        freshness check should reject it as a replay — real systems use
        cryptographic signatures and nonce tracking, not shown here.
      </p>
      <button
        disabled={!hasLastCommand}
        onClick={() => runReplayAttack(deviceId)}
        className="mt-2 rounded border border-accent-danger/40 px-2 py-1 text-xs text-accent-danger hover:bg-accent-danger/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Run replay attack
      </button>
      {!hasLastCommand && (
        <p className="mt-1 text-[10px] text-muted">Issue a command to this device first (toggle it) to have something to replay.</p>
      )}
    </div>
  );
}
