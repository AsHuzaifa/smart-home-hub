import type { TelemetryPoint } from '../state/telemetryStore';

// Minimal inline SVG line chart - no charting library, matching this
// project's stack decisions (charting libs were explicitly skipped).
export function Sparkline({
  points,
  width = 96,
  height = 28,
  color = '#5fb8c9',
}: {
  points: TelemetryPoint[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (points.length < 2) {
    return (
      <svg width={width} height={height} className="opacity-40">
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" strokeWidth={1} strokeDasharray="2 3" />
      </svg>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 3;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - pad - ((p.value - min) / range) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg width={width} height={height}>
      <polyline points={coords.join(' ')} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={coords[coords.length - 1].split(',')[0]} cy={coords[coords.length - 1].split(',')[1]} r={2} fill={color} />
    </svg>
  );
}
