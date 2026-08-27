import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { ROOMS } from '../data/devices';
import { useDeviceStore } from '../state/deviceStore';
import { Room } from './Room';
import { Door } from './devices/Door';
import { Fan } from './devices/Fan';
import { LightFixture } from './devices/LightFixture';
import { MotionSensor } from './devices/MotionSensor';
import { Thermostat } from './devices/Thermostat';

function roomCenter(roomId: string) {
  const room = ROOMS.find((r) => r.id === roomId)!;
  return [room.bounds.x + room.bounds.width / 2, 0, room.bounds.z + room.bounds.depth / 2] as const;
}

export function FloorplanScene({ onSelectDevice }: { onSelectDevice: (id: string) => void }) {
  const devices = useDeviceStore((s) => s.devices);

  const FLOORPLAN_CENTER: [number, number, number] = [4, 0, 4];

  return (
    <Canvas camera={{ position: [4 + 16, 14, 4 + 16], fov: 40 }} shadows>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 5]} intensity={1} castShadow />
      <OrbitControls
        target={FLOORPLAN_CENTER}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.4}
        minDistance={10}
        maxDistance={36}
      />
      <ContactShadows position={[4, -0.01, 4]} opacity={0.4} scale={30} blur={2} far={10} />

      {ROOMS.map((room) => (
        <Room key={room.id} room={room} />
      ))}

      {Object.values(devices).map((device) => {
        const [cx, , cz] = roomCenter(device.room);
        const worldPosition: [number, number, number] = [
          cx + device.position[0],
          device.position[1],
          cz + device.position[2],
        ];

        switch (device.type) {
          case 'light':
            return <LightFixture key={device.id} id={device.id} position={worldPosition} onSelect={onSelectDevice} />;
          case 'fan':
            return <Fan key={device.id} id={device.id} position={worldPosition} onSelect={onSelectDevice} />;
          case 'door':
            return <Door key={device.id} id={device.id} position={worldPosition} onSelect={onSelectDevice} />;
          case 'thermostat':
            return <Thermostat key={device.id} id={device.id} position={worldPosition} onSelect={onSelectDevice} />;
          case 'motionSensor':
            return <MotionSensor key={device.id} id={device.id} position={worldPosition} onSelect={onSelectDevice} />;
          default:
            return null;
        }
      })}
    </Canvas>
  );
}
