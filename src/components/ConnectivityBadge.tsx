import type { Connectivity } from '../types/device';

const BAR_THRESHOLDS = [20, 40, 65, 85];

export function ConnectivityBadge({ connectivity, compact = false }: { connectivity: Connectivity; compact?: boolean }) {
  const { online, signalStrength, batteryLevel } = connectivity;

  return (
    <div className="flex items-center gap-1.5" title={online ? `Signal ${signalStrength}%` : 'Offline'}>
      <div className="flex items-end gap-0.5" style={{ height: 10 }}>
        {BAR_THRESHOLDS.map((threshold, i) => (
          <span
            key={threshold}
            className={`w-[3px] rounded-sm ${online && signalStrength >= threshold ? 'bg-accent-info' : 'bg-white/15'}`}
            style={{ height: 3 + i * 2.3 }}
          />
        ))}
      </div>
      {!compact && batteryLevel !== null && (
        <span className={`text-[0.62rem] tabular-nums ${batteryLevel < 20 ? 'text-accent-danger' : 'text-muted'}`}>
          {Math.round(batteryLevel)}%
        </span>
      )}
      {!online && <span className="text-[0.62rem] font-medium text-accent-danger">Offline</span>}
    </div>
  );
}
