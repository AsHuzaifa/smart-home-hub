import { create } from 'zustand';
import { INITIAL_DEVICES } from '../data/devices';
import { engine } from '../rules-engine/engine';
import { useSecurityStore } from './securityStore';
import { useTelemetryStore } from './telemetryStore';
import type { Connectivity, Device, DeviceState } from '../types/device';

// The two "sensed" numeric fields telemetry history tracks - everything else
// (on/off, locked/open, etc.) isn't a sensor reading worth charting.
const TELEMETRY_FIELDS = ['temp', 'currentTemp'] as const;

interface DeviceStoreState {
  devices: Record<string, Device>;
  setDeviceState: (id: string, patch: Partial<DeviceState>) => void;
  setConnectivity: (id: string, patch: Partial<Connectivity>) => void;
  resetDevices: () => void;
}

function seedDevices(): Record<string, Device> {
  return Object.fromEntries(INITIAL_DEVICES.map((d) => [d.id, d]));
}

export const useDeviceStore = create<DeviceStoreState>((set, get) => ({
  devices: seedDevices(),

  setDeviceState: (id, patch) => {
    const device = get().devices[id];
    if (!device) return;

    // An unreachable device can't be commanded - mirrors the offline guard in
    // evaluateCondition.ts (fail closed), but for actions instead of conditions.
    // Reconnecting goes through setConnectivity, not this method, so it's unaffected.
    if (!device.connectivity.online) return;

    let nextState = { ...device.state, ...patch } as DeviceState;

    // A locked door can't be opened - if this patch would leave the door both
    // locked and open, the open change is refused (locking always wins).
    if (nextState.type === 'door' && nextState.locked && nextState.open) {
      const previousOpen = device.state.type === 'door' ? device.state.open : false;
      nextState = { ...nextState, open: previousOpen };
    }

    set((s) => ({
      devices: {
        ...s.devices,
        [id]: { ...device, state: nextState },
      },
    }));

    useSecurityStore.getState().recordCommand(id, patch as Record<string, unknown>);

    for (const field of TELEMETRY_FIELDS) {
      const value = (patch as Record<string, unknown>)[field];
      if (typeof value === 'number') useTelemetryStore.getState().recordReading(id, value);
    }

    engine.onDeviceChanged(id);
  },

  setConnectivity: (id, patch) => {
    const device = get().devices[id];
    if (!device) return;

    set((s) => ({
      devices: {
        ...s.devices,
        [id]: { ...device, connectivity: { ...device.connectivity, ...patch } },
      },
    }));
  },

  resetDevices: () => set({ devices: seedDevices() }),
}));
