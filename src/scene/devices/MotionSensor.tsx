import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MathUtils, type Mesh } from 'three';
import { useDeviceStore } from '../../state/deviceStore';
import type { DeviceState } from '../../types/device';

interface Props {
  id: string;
  position: [number, number, number];
  onSelect: (id: string) => void;
}

const PULSE_WINDOW_MS = 1200;

export function MotionSensor({ id, position, onSelect }: Props) {
  const state = useDeviceStore((s) => s.devices[id]?.state) as
    | Extract<DeviceState, { type: 'motionSensor' }>
    | undefined;
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const since = state?.lastTriggeredAt ? Date.now() - state.lastTriggeredAt : Infinity;
    const active = since < PULSE_WINDOW_MS;
    const targetScale = active ? 1.6 : 1;
    meshRef.current.scale.setScalar(MathUtils.damp(meshRef.current.scale.x, targetScale, 6, 1 / 60));
    const mat = meshRef.current.material as import('three').MeshStandardMaterial;
    mat.emissiveIntensity = MathUtils.damp(mat.emissiveIntensity, active ? 1.5 : 0.2, 6, 1 / 60);
  });

  if (!state) return null;

  return (
    <group position={position} onClick={(e) => (e.stopPropagation(), onSelect(id))}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#d29922" emissive="#d29922" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}
