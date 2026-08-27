import { Text } from '@react-three/drei';
import { Color } from 'three';
import { useDeviceStore } from '../../state/deviceStore';
import type { DeviceState } from '../../types/device';

interface Props {
  id: string;
  position: [number, number, number];
  onSelect: (id: string) => void;
}

const COLD = new Color('#58a6ff');
const HOT = new Color('#f85149');

export function Thermostat({ id, position, onSelect }: Props) {
  const state = useDeviceStore((s) => s.devices[id]?.state) as
    | Extract<DeviceState, { type: 'thermostat' }>
    | undefined;
  if (!state) return null;

  const t = Math.min(Math.max((state.currentTemp - 15) / 20, 0), 1);
  const color = COLD.clone().lerp(HOT, t);

  return (
    <group position={position} onClick={(e) => (e.stopPropagation(), onSelect(id))}>
      <mesh>
        <boxGeometry args={[0.4, 0.4, 0.05]} />
        <meshStandardMaterial color="#1c2530" />
      </mesh>
      <Text position={[0, 0, 0.03]} fontSize={0.14} color={`#${color.getHexString()}`} anchorX="center" anchorY="middle">
        {Math.round(state.currentTemp)}°
      </Text>
    </group>
  );
}
