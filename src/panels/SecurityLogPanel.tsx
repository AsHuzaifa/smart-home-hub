import { useSecurityStore } from '../state/securityStore';

export function SecurityLogPanel() {
  const log = useSecurityStore((s) => s.log);

  return (
    <div className="flex flex-col gap-2 overflow-y-auto p-4">
      <h2 className="text-xs uppercase tracking-wide text-muted">Security Log</h2>
      {log.length === 0 && <p className="text-xs text-muted">No events yet. Try the replay attack demo on a device.</p>}
      <ul className="flex flex-col gap-1">
        {log.map((event) => (
          <li
            key={event.id}
            className={`rounded border px-2 py-1 text-xs ${
              event.verdict === 'accepted' ? 'border-accent/30 text-accent' : 'border-accent-danger/30 text-accent-danger'
            }`}
          >
            <div className="flex justify-between">
              <span>{event.deviceId}</span>
              <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="text-muted">{event.reason}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
