import { useState } from 'react';
import { runReplayAttack } from '../security/attackScenarios';
import { useSecurityStore } from '../state/securityStore';
import type { ReplayAttackResult } from '../security/attackScenarios';

export function AttackDemoPanel({ deviceId }: { deviceId: string }) {
  const hasLastCommand = useSecurityStore((s) => Boolean(s.lastCommands[deviceId]));
  const [result, setResult] = useState<ReplayAttackResult | null>(null);

  return (
    <div className="mt-2 rounded-2xl border border-border bg-white/5 p-3 backdrop-blur-md">
      <h3 className="text-xs font-medium">Simulated replay attack</h3>
      <p className="mt-1 text-xs text-ink-muted">
        This captures this device's most recent command, then re-sends it as if it had been
        intercepted and replayed 60 seconds later. It's a scripted attack: nothing is actually
        recorded off the wire, and the device's real state does not change - this only tests
        whether the simulated freshness check (reject anything older than 10s) would catch a
        stale, replayed command before it reaches the device. The outcome appears below and is
        also added to the Security Log.
      </p>
      <button
        disabled={!hasLastCommand}
        onClick={() => setResult(runReplayAttack(deviceId))}
        className="mt-2 rounded-full border border-accent-danger/40 px-3 py-1.5 text-xs text-accent-danger transition-colors hover:bg-accent-danger/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Run replay attack
      </button>
      {!hasLastCommand && (
        <p className="mt-1 text-[10px] text-ink-muted">Issue a command to this device first (toggle it) to have something to replay.</p>
      )}
      {result && (
        <div
          className={`mt-2 rounded-xl border px-2.5 py-1.5 text-xs backdrop-blur-md ${
            result.verdict === 'accepted' ? 'border-accent/40 text-accent' : 'border-accent-danger/40 text-accent-danger'
          }`}
        >
          <div className="flex items-center gap-1.5 font-medium">
            <span className={`h-2 w-2 shrink-0 rounded-full ${result.verdict === 'accepted' ? 'bg-accent' : 'bg-accent-danger'}`} />
            {result.verdict === 'accepted' ? 'Replay accepted' : 'Replay blocked'}
          </div>
          <p className="mt-0.5 text-ink-muted">
            {result.reason}
            {result.verdict === 'accepted'
              ? ' - the freshness check failed to catch this replay; a real attacker\'s re-sent command would have gone through.'
              : ' - the freshness check caught the stale timestamp and the device was never actually commanded.'}
          </p>
        </div>
      )}
    </div>
  );
}
