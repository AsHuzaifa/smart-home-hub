import { HelpButton } from '../components/HelpButton';
import { SecurityHelpContent } from '../components/SecurityHelpContent';
import { useSecurityStore } from '../state/securityStore';

export function SecurityLogPanel() {
  const log = useSecurityStore((s) => s.log);

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto p-4">
      <div className="flex items-center gap-1.5">
        <h2 className="text-xs uppercase tracking-wide text-ink-muted">Security Log</h2>
        <HelpButton title="Security">
          <SecurityHelpContent />
        </HelpButton>
      </div>
      {log.length === 0 && <p className="text-xs text-ink-muted">No events yet. Try the replay attack demo on a device.</p>}
      <ul className="flex flex-col gap-1">
        {log.map((event) => (
          <li
            key={event.id}
            className={`rounded-xl border bg-white/5 px-2.5 py-1.5 text-xs text-ink backdrop-blur-md ${
              event.verdict === 'accepted' ? 'border-accent/40' : 'border-accent-danger/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    event.verdict === 'accepted' ? 'bg-accent' : 'bg-accent-danger'
                  }`}
                />
                {event.deviceId}
              </span>
              <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="text-ink-muted">{event.reason}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
