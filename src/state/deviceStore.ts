import { create } from 'zustand';
import { INITIAL_DEVICES } from '../data/devices';
import { engine } from '../rules-engine/engine';
import { useSecurityStore } from './securityStore';
import type { Device, DeviceState } from '../types/device';

interface DeviceStoreState {
  devices: Record<string, Device>;
  setDeviceState: (id: string, patch: Partial<DeviceState>) => void;
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

    set((s) => ({
      devices: {
        ...s.devices,
        [id]: { ...device, state: { ...device.state, ...patch } as DeviceState },
      },
    }));

    useSecurityStore.getState().recordCommand(id, patch as Record<string, unknown>);
    engine.onDeviceChanged(id);
  },

  resetDevices: () => set({ devices: seedDevices() }),
}));
