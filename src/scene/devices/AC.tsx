import { useDeviceAnimation } from '../useDeviceAnimation';
import type { DeviceState } from '../../types/device';

interface Props {
  id: string;
  position: [number, number, number];
  /** Faces +z by default (correct for a room's min-z wall) - rotate for any other wall. */
  rotationY?: number;
  onSelect: (id: string) => void;
}

const BODY_COLOR = '#eef1ee';
const VENT_COLOR = '#c9cec9';

// Wall-mounted split-AC unit - flat body + louvre vent + a status LED
// (red when off, green when on), used in the living room and bedroom 1.
export function AC({ id, position, rotationY = 0, onSelect }: Props) {
  const { state } = useDeviceAnimation<Extract<DeviceState, { type: 'ac' }>>(id);
  if (!state) return null;

  const ledColor = state.on ? '#4ade80' : '#ef4444';

  return (
    <group position={position} rotation={[0, rotationY, 0]} onClick={(e) => (e.stopPropagation(), onSelect(id))}>
      {/* Main body, flush against the wall */}
      <mesh position={[0, 0, 0.09]} castShadow>
        <boxGeometry args={[0.72, 0.24, 0.18]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.4} />
      </mesh>
      {/* Front louvre vent */}
      <mesh position={[0, -0.03, 0.185]}>
        <boxGeometry args={[0.62, 0.05, 0.01]} />
        <meshStandardMaterial color={VENT_COLOR} roughness={0.6} />
      </mesh>
      {/* Status LED */}
      <mesh position={[0.32, 0.08, 0.185]}>
        <sphereGeometry args={[0.013, 8, 8]} />
        <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={state.on ? 2.2 : 0.9} />
      </mesh>

      {/* Not a shadow caster - a faint cool glow is enough to read as "running" */}
      {state.on && <pointLight position={[0, -0.05, 0.35]} color="#dff5ff" intensity={0.6} distance={4} decay={2} />}
    </group>
  );
}
