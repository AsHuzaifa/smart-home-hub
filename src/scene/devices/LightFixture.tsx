import { DoubleSide } from 'three';
import { useDeviceAnimation } from '../useDeviceAnimation';
import type { DeviceState } from '../../types/device';

interface Props {
  id: string;
  position: [number, number, number];
  onSelect: (id: string) => void;
}

export function LightFixture({ id, position, onSelect }: Props) {
  const { state } = useDeviceAnimation<Extract<DeviceState, { type: 'light' }>>(id);
  if (!state) return null;

  const lightIntensity = state.on ? 3 + state.brightness * 7 : 0;
  const bulbGlow = state.on ? 2 + state.brightness * 2 : 0;
  const bulbColor = state.on ? '#ffe9a8' : '#8a8567';

  return (
    <group position={position} onClick={(e) => (e.stopPropagation(), onSelect(id))}>
      {/* Cord from ceiling down to the shade */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.7, 6]} />
        <meshStandardMaterial color="#2e2a20" />
      </mesh>

      {/* Shade */}
      <mesh position={[0, -0.02, 0]} castShadow>
        <coneGeometry args={[0.16, 0.14, 16, 1, true]} />
        <meshStandardMaterial color="#c9a876" side={DoubleSide} roughness={0.6} />
      </mesh>

      {/* Bulb */}
      <mesh position={[0, -0.08, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={bulbColor} emissive={bulbColor} emissiveIntensity={bulbGlow} />
      </mesh>

      {/* Not a shadow caster - shadows are reserved for the 1-2 key scene lights to protect performance */}
      {state.on && <pointLight color="#ffcd94" intensity={lightIntensity} distance={9} decay={1.5} />}
    </group>
  );
}
