import { create } from 'zustand';

export interface TelemetryPoint {
  timestamp: number;
  value: number;
}

const MAX_POINTS = 40;

interface TelemetryStoreState {
  history: Record<string, TelemetryPoint[]>;
  recordReading: (deviceId: string, value: number) => void;
}

// Same shape/pattern as securityStore's `log` - a capped array, newest data
// appended at the end (charts read left-to-right, oldest-to-newest).
export const useTelemetryStore = create<TelemetryStoreState>((set) => ({
  history: {},

  recordReading: (deviceId, value) =>
    set((s) => ({
      history: {
        ...s.history,
        [deviceId]: [...(s.history[deviceId] ?? []), { timestamp: Date.now(), value }].slice(-MAX_POINTS),
      },
    })),
}));
