import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MathUtils, type Group } from 'three';
import { useDeviceStore } from '../../state/deviceStore';
import type { DeviceState } from '../../types/device';

interface Props {
  id: string;
  position: [number, number, number];
  /** Rotate the whole door assembly so it sits flush in walls running along either axis. */
  rotationY?: number;
  onSelect: (id: string) => void;
}

const OPEN_ANGLE = 1.4;
const DOOR_WIDTH = 0.8;
const DOOR_HEIGHT = 2;
const FRAME_COLOR = '#4a3a26';

export function Door({ id, position, rotationY = 0, onSelect }: Props) {
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
  const panelColor = state.locked ? '#8a4a3a' : '#5a6b3f';

  return (
    <group position={position} rotation={[0, rotationY, 0]} onClick={(e) => (e.stopPropagation(), onSelect(id))}>
      {/* Door frame */}
      <mesh position={[0.4, DOOR_HEIGHT / 2, 0]} castShadow>
        <boxGeometry args={[0.06, DOOR_HEIGHT + 0.1, 0.1]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.6} />
      </mesh>
      <mesh position={[-0.4, DOOR_HEIGHT / 2, 0]} castShadow>
        <boxGeometry args={[0.06, DOOR_HEIGHT + 0.1, 0.1]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.6} />
      </mesh>
      <mesh position={[0, DOOR_HEIGHT + 0.05, 0]} castShadow>
        <boxGeometry args={[DOOR_WIDTH + 0.1, 0.06, 0.1]} />
        <meshStandardMaterial color={FRAME_COLOR} roughness={0.6} />
      </mesh>

      <group ref={hingeRef} position={[-0.4, 0, 0]}>
        <mesh position={[DOOR_WIDTH / 2, DOOR_HEIGHT / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[DOOR_WIDTH, DOOR_HEIGHT, 0.06]} />
          <meshStandardMaterial color={panelColor} roughness={0.55} emissive={panelColor} emissiveIntensity={0.08} />
        </mesh>
        {/* Recessed panel detail */}
        <mesh position={[DOOR_WIDTH / 2, DOOR_HEIGHT * 0.65, 0.035]}>
          <boxGeometry args={[DOOR_WIDTH * 0.7, DOOR_HEIGHT * 0.28, 0.01]} />
          <meshStandardMaterial color={panelColor} roughness={0.8} />
        </mesh>
        <mesh position={[DOOR_WIDTH / 2, DOOR_HEIGHT * 0.32, 0.035]}>
          <boxGeometry args={[DOOR_WIDTH * 0.7, DOOR_HEIGHT * 0.28, 0.01]} />
          <meshStandardMaterial color={panelColor} roughness={0.8} />
        </mesh>
        {/* Knob */}
        <mesh position={[DOOR_WIDTH - 0.08, DOOR_HEIGHT * 0.5, 0.04]} castShadow>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color="#c2a76b" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}
