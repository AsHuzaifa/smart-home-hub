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

  return (
    <group position={position} onClick={(e) => (e.stopPropagation(), onSelect(id))}>
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        <meshStandardMaterial color="#7d8998" />
      </mesh>
      <group ref={bladesRef} position={[0, 0.15, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]} position={[0.2, 0, 0]}>
            <boxGeometry args={[0.4, 0.02, 0.08]} />
            <meshStandardMaterial color={state.on ? '#58a6ff' : '#4a4a4a'} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
