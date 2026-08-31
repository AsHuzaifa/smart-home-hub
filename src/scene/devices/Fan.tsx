import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { useDeviceStore } from '../../state/deviceStore';
import type { DeviceState } from '../../types/device';

interface Props {
  id: string;
  position: [number, number, number];
  onSelect: (id: string) => void;
}

export function Fan({ id, position, onSelect }: Props) {
  const state = useDeviceStore((s) => s.devices[id]?.state) as
    | Extract<DeviceState, { type: 'fan' }>
    | undefined;
  const bladesRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!bladesRef.current || !state?.on) return;
    bladesRef.current.rotation.y += state.speed * delta * 8;
  });

  if (!state) return null;
  const bladeColor = state.on ? '#e6e2ce' : '#8a8567';

  return (
    <group position={position} onClick={(e) => (e.stopPropagation(), onSelect(id))}>
      {/* Downrod from ceiling */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.35, 6]} />
        <meshStandardMaterial color="#2e2a20" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Motor housing */}
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 12]} />
        <meshStandardMaterial color="#3a3626" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Each blade is nested in its own rotated group so the 0.32 offset is carried
          along that group's rotated axis - putting position + rotation on the same
          mesh instead left every blade translated along the same (unrotated) axis,
          bunching all four blades to one side instead of spreading them symmetrically. */}
      <group ref={bladesRef} position={[0, 0, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
            <mesh position={[0.32, 0, 0]} castShadow>
              <boxGeometry args={[0.55, 0.015, 0.12]} />
              <meshStandardMaterial color={bladeColor} roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
