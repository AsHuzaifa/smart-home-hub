import { Text } from '@react-three/drei';
import { Color } from 'three';
import { useDeviceStore } from '../../state/deviceStore';
import type { DeviceState } from '../../types/device';

interface Props {
  id: string;
  position: [number, number, number];
  onSelect: (id: string) => void;
}

const COLD = new Color('#4f8a82');
const HOT = new Color('#a8452f');

export function Thermostat({ id, position, onSelect }: Props) {
  const state = useDeviceStore((s) => s.devices[id]?.state) as
    | Extract<DeviceState, { type: 'thermostat' }>
    | undefined;
  if (!state) return null;

  const t = Math.min(Math.max((state.currentTemp - 15) / 20, 0), 1);
  const color = COLD.clone().lerp(HOT, t);

  return (
    <group position={position} onClick={(e) => (e.stopPropagation(), onSelect(id))}>
      {/* Mount plate */}
      <mesh castShadow>
        <boxGeometry args={[0.46, 0.46, 0.03]} />
        <meshStandardMaterial color="#4a3a26" roughness={0.7} />
      </mesh>
      {/* Bezel */}
      <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.19, 0.19, 0.03, 24]} />
        <meshStandardMaterial color="#e6e2ce" metalness={0.2} roughness={0.4} />
      </mesh>
      {/* Face */}
      <mesh position={[0, 0, 0.04]}>
        <circleGeometry args={[0.15, 24]} />
        <meshStandardMaterial color="#1c1d12" roughness={0.5} />
      </mesh>
      <Text position={[0, 0, 0.05]} fontSize={0.12} color={`#${color.getHexString()}`} anchorX="center" anchorY="middle">
        {Math.round(state.currentTemp)}°
      </Text>
    </group>
  );
}
