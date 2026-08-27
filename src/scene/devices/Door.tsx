import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MathUtils, type Group } from 'three';
import { useDeviceStore } from '../../state/deviceStore';
import type { DeviceState } from '../../types/device';

interface Props {
  id: string;
  position: [number, number, number];
  onSelect: (id: string) => void;
}

const OPEN_ANGLE = 1.4;

export function Door({ id, position, onSelect }: Props) {
  const state = useDeviceStore((s) => s.devices[id]?.state) as
    | Extract<DeviceState, { type: 'door' }>
    | undefined;
  const hingeRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!hingeRef.current) return;
    const target = state?.open ? OPEN_ANGLE : 0;
    hingeRef.current.rotation.y = MathUtils.damp(hingeRef.current.rotation.y, target, 4, delta);
  });

  if (!state) return null;

  return (
    <group position={position} onClick={(e) => (e.stopPropagation(), onSelect(id))}>
      <group ref={hingeRef}>
        <mesh position={[0.4, 1, 0]}>
          <boxGeometry args={[0.8, 2, 0.06]} />
          <meshStandardMaterial
            color={state.locked ? '#f85149' : '#3fb950'}
            emissive={state.locked ? '#f85149' : '#3fb950'}
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}
