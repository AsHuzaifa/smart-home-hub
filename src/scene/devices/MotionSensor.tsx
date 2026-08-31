import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MathUtils, type Mesh, type MeshStandardMaterial } from 'three';
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
  const lensRef = useRef<Mesh>(null);

  useFrame(() => {
    if (!lensRef.current) return;
    const since = state?.lastTriggeredAt ? Date.now() - state.lastTriggeredAt : Infinity;
    const active = since < PULSE_WINDOW_MS;
    const targetScale = active ? 1.6 : 1;
    lensRef.current.scale.setScalar(MathUtils.damp(lensRef.current.scale.x, targetScale, 6, 1 / 60));
    const mat = lensRef.current.material as MeshStandardMaterial;
    mat.emissiveIntensity = MathUtils.damp(mat.emissiveIntensity, active ? 1.5 : 0.2, 6, 1 / 60);
  });

  if (!state) return null;

  return (
    <group position={position} onClick={(e) => (e.stopPropagation(), onSelect(id))}>
      {/* Base plate against the wall */}
      <mesh castShadow>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshStandardMaterial color="#3a3626" roughness={0.7} />
      </mesh>
      {/* Dome housing, bulging out from the wall toward +z */}
      <mesh position={[0, 0, 0.03]} castShadow>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#e6e2ce" roughness={0.5} />
      </mesh>
      {/* Lens, pulses on motion */}
      <mesh ref={lensRef} position={[0, 0, 0.045]}>
        <sphereGeometry args={[0.02, 10, 10]} />
        <meshStandardMaterial color="#c98a3a" emissive="#c98a3a" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}
