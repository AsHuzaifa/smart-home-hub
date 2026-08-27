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

  const intensity = state.on ? state.brightness * 2 : 0;
  const color = state.on ? '#ffe9a8' : '#4a4a4a';

  return (
    <group position={position} onClick={(e) => (e.stopPropagation(), onSelect(id))}>
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} />
      </mesh>
      {state.on && <pointLight color="#ffe9a8" intensity={intensity} distance={4} />}
    </group>
  );
}
