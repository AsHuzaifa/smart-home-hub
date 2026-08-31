import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { MathUtils, type Group } from 'three';
import { useDeviceStore } from '../../state/deviceStore';
import type { DeviceState } from '../../types/device';

interface Props {
  id: string;
  position: [number, number, number];
  rotationY?: number;
  onSelect: (id: string) => void;
}

const PANEL_WIDTH = 1.8;
const DOOR_HEIGHT = 2.35;
const SLIDE_DISTANCE = PANEL_WIDTH * 0.85;
const FRAME_COLOR = '#8a8578';
const GLASS_COLOR = '#a8d8dc';

export function SlidingDoor({ id, position, rotationY = 0, onSelect }: Props) {
  const state = useDeviceStore((s) => s.devices[id]?.state) as
    | Extract<DeviceState, { type: 'door' }>
    | undefined;
  const slidingPanelRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!slidingPanelRef.current) return;
    const target = state?.open ? -SLIDE_DISTANCE : 0;
    slidingPanelRef.current.position.x = MathUtils.damp(slidingPanelRef.current.position.x, target, 4, delta);
  });

  if (!state) return null;
  const trimTint = state.locked ? '#a8452f' : FRAME_COLOR;

  return (
    <group position={position} rotation={[0, rotationY, 0]} onClick={(e) => (e.stopPropagation(), onSelect(id))}>
      {/* Header track */}
      <mesh position={[0, DOOR_HEIGHT + 0.05, 0]} castShadow>
        <boxGeometry args={[PANEL_WIDTH * 2.1, 0.06, 0.12]} />
        <meshStandardMaterial color={trimTint} metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Threshold track */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[PANEL_WIDTH * 2.1, 0.03, 0.1]} />
        <meshStandardMaterial color={FRAME_COLOR} metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Fixed panel */}
      <mesh position={[PANEL_WIDTH / 2 + 0.05, DOOR_HEIGHT / 2, 0]}>
        <boxGeometry args={[PANEL_WIDTH - 0.1, DOOR_HEIGHT, 0.04]} />
        <meshStandardMaterial color={GLASS_COLOR} emissive={GLASS_COLOR} emissiveIntensity={0.35} transparent opacity={0.5} />
      </mesh>
      <mesh position={[PANEL_WIDTH - 0.02, DOOR_HEIGHT / 2, 0]} castShadow>
        <boxGeometry args={[0.05, DOOR_HEIGHT, 0.06]} />
        <meshStandardMaterial color={FRAME_COLOR} metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Sliding panel */}
      <group ref={slidingPanelRef} position={[0, 0, 0.02]}>
        <mesh position={[-PANEL_WIDTH / 2 - 0.05, DOOR_HEIGHT / 2, 0]} castShadow>
          <boxGeometry args={[PANEL_WIDTH - 0.1, DOOR_HEIGHT, 0.04]} />
          <meshStandardMaterial color={GLASS_COLOR} emissive={GLASS_COLOR} emissiveIntensity={0.35} transparent opacity={0.5} />
        </mesh>
        <mesh position={[-PANEL_WIDTH + 0.02, DOOR_HEIGHT / 2, 0]} castShadow>
          <boxGeometry args={[0.05, DOOR_HEIGHT, 0.06]} />
          <meshStandardMaterial color={FRAME_COLOR} metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[-0.03, DOOR_HEIGHT / 2, 0]} castShadow>
          <boxGeometry args={[0.05, DOOR_HEIGHT, 0.06]} />
          <meshStandardMaterial color={FRAME_COLOR} metalness={0.3} roughness={0.5} />
        </mesh>
        {/* Handle */}
        <mesh position={[0.15, DOOR_HEIGHT * 0.5, 0.03]} castShadow>
          <boxGeometry args={[0.03, 0.2, 0.02]} />
          <meshStandardMaterial color="#c2a76b" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}
