import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';
import { useDeviceStore } from '../state/deviceStore';
import type { Device } from '../types/device';

// Reads a device's live state from the store and exposes a ref holding
// smoothly-damped scalar values driven each frame - shared by every device
// mesh component so animation easing stays consistent across the scene.
export function useDeviceAnimation<T extends Device['state']>(deviceId: string) {
  const state = useDeviceStore((s) => s.devices[deviceId]?.state) as T | undefined;
  const damped = useRef<Record<string, number>>({});

  useFrame((_, delta) => {
    if (!state) return;
    for (const [key, value] of Object.entries(state)) {
      if (typeof value !== 'number') continue;
      const current = damped.current[key] ?? value;
      damped.current[key] = MathUtils.damp(current, value, 4, delta);
    }
  });

  return { state, damped };
}
