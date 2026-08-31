import { DoubleSide } from 'three';
import { useDeviceAnimation } from '../useDeviceAnimation';
import type { DeviceState } from '../../types/device';

interface Props {
  id: string;
  position: [number, number, number];
  /** Faces +z by default (correct for a room's min-z wall) - rotate for any other wall. */
  rotationY?: number;
  onSelect: (id: string) => void;
}

const BRASS = '#c2a25a';

// A wall-mounted sconce - backplate + arm + fabric shade - used in pairs on
// opposite walls instead of a single hanging ceiling pendant.
export function WallSconce({ id, position, rotationY = 0, onSelect }: Props) {
  const { state } = useDeviceAnimation<Extract<DeviceState, { type: 'light' }>>(id);
  if (!state) return null;

  const lightIntensity = state.on ? 2.5 + state.brightness * 6 : 0;
  const shadeGlow = state.on ? 1.8 + state.brightness * 1.8 : 0;
  const shadeColor = state.on ? '#ffe9a8' : '#cbb98a';

  return (
    <group position={position} rotation={[0, rotationY, 0]} onClick={(e) => (e.stopPropagation(), onSelect(id))}>
      {/* Backplate against the wall */}
      <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 12]} />
        <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Arm extending into the room */}
      <mesh position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.26, 8]} />
        <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Fabric drum shade - upright, like a small standing lampshade, carried on the arm */}
      <mesh position={[0, 0, 0.28]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.16, 16, 1, true]} />
        <meshStandardMaterial
          color={shadeColor}
          emissive={shadeColor}
          emissiveIntensity={shadeGlow}
          side={DoubleSide}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0, 0.09, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.11, 0.008, 8, 16]} />
        <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.09, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.11, 0.008, 8, 16]} />
        <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.35} />
      </mesh>

      {/* Not a shadow caster - shadows are reserved for the 1-2 key scene lights */}
      {state.on && <pointLight position={[0, 0, 0.3]} color="#ffcd94" intensity={lightIntensity} distance={8} decay={1.5} />}
    </group>
  );
}
