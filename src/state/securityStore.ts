import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { issueToken } from '../security/tokenSim';
import type { SecurityEvent, SimulatedCommand } from '../types/security';
import { INITIAL_DEVICES } from '../data/devices';

interface SecurityStoreState {
  tokens: Record<string, string>;
  lastCommands: Record<string, SimulatedCommand>;
  log: SecurityEvent[];
  recordCommand: (deviceId: string, patch: Record<string, unknown>) => void;
  pushEvent: (event: Omit<SecurityEvent, 'id'>) => void;
}

export const useSecurityStore = create<SecurityStoreState>((set) => ({
  tokens: Object.fromEntries(INITIAL_DEVICES.map((d) => [d.id, issueToken(d.id)])),
  lastCommands: {},
  log: [],

  recordCommand: (deviceId, patch) =>
    set((s) => ({
      lastCommands: {
        ...s.lastCommands,
        [deviceId]: { deviceId, patch, timestamp: Date.now() },
      },
    })),

  pushEvent: (event) =>
    set((s) => ({
      log: [{ id: nanoid(), ...event }, ...s.log].slice(0, 50),
    })),
}));
