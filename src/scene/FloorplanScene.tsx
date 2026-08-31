import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { ACESFilmicToneMapping } from 'three';
import { ROOMS } from '../data/devices';
import { useDeviceStore } from '../state/deviceStore';
import { HouseShell } from './HouseShell';
import { Room } from './Room';
import { AC } from './devices/AC';
import { Door } from './devices/Door';
import { Fan } from './devices/Fan';
import { LightFixture } from './devices/LightFixture';
import { MotionSensor } from './devices/MotionSensor';
import { SlidingDoor } from './devices/SlidingDoor';
import { Thermostat } from './devices/Thermostat';
import { WallSconce } from './devices/WallSconce';

function roomCenter(roomId: string) {
  const room = ROOMS.find((r) => r.id === roomId)!;
  return [room.bounds.x + room.bounds.width / 2, 0, room.bounds.z + room.bounds.depth / 2] as const;
}

const FLOORPLAN_CENTER: [number, number, number] = [8, 0, 7];

interface SconceSpot {
  position: [number, number, number];
  rotationY: number;
}

// Light devices rendered as a pair of wall-mounted sconces on opposite walls,
// spread for even coverage, instead of a single hanging ceiling pendant.
// Positions are room-local offsets (added to the room's center, like device.position).
const SCONCE_LAYOUT: Record<string, SconceSpot[]> = {
  'living-room-light': [
    // West-wall window sits at world z 1.2-2.8 (local z -2.8 to -1.2 here) - moved off
    // that span so the sconce isn't mounted directly over the window glass.
    { position: [-4.35, 1.6, 0], rotationY: Math.PI / 2 }, // west wall
    { position: [4.35, 1.6, -2.5], rotationY: -Math.PI / 2 }, // east wall
  ],
  'kitchen-light': [
    { position: [-3.35, 1.6, -2.5], rotationY: Math.PI / 2 }, // west wall
    { position: [3.35, 1.6, -2.5], rotationY: -Math.PI / 2 }, // east wall
  ],
  'bedroom-1-light': [
    { position: [-2.8, 1.6, 2.85], rotationY: Math.PI }, // north wall
    { position: [-2.8, 1.6, -2.85], rotationY: 0 }, // south wall
  ],
  'bedroom-2-light': [
    { position: [-2.85, 1.6, -2], rotationY: Math.PI / 2 }, // west wall
    { position: [2.85, 1.6, -2], rotationY: -Math.PI / 2 }, // east wall
  ],
};

export function FloorplanScene({ onSelectDevice }: { onSelectDevice: (id: string) => void }) {
  const devices = useDeviceStore((s) => s.devices);

  return (
    <Canvas
      camera={{ position: [8 + 20, 18, 7 + 20], fov: 36 }}
      shadows="soft"
      gl={{ alpha: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      onCreated={({ scene }) => {
        scene.background = null;
      }}
      style={{
        background:
          'radial-gradient(circle at 22% 15%, rgba(95, 184, 201, 0.16), transparent 45%), ' +
          'radial-gradient(circle at 85% 90%, rgba(224, 148, 74, 0.14), transparent 50%), ' +
          'linear-gradient(180deg, #1d1e23 0%, #0f1013 100%)',
      }}
    >
      {/* Warm ~2700K key light - the scene's one full-cost shadow caster */}
      <directionalLight
        position={[8 + 18, 22, 7 + 12]}
        intensity={1.15}
        color="#ffb877"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-bias={-0.0015}
      />
      {/* Warm soft fill from the opposite side, no shadow (evening-interior mood, not a cool contrast light) */}
      <directionalLight position={[-6, 10, -6]} intensity={0.28} color="#ffdcb0" />
      {/* Second, cheaper shadow caster for depth under furniture near the living room */}
      <pointLight position={[3, 3.2, 3]} intensity={0.5} color="#ffb877" distance={9} decay={2} castShadow shadow-mapSize={[512, 512]} />
      <hemisphereLight color="#ffe8cf" groundColor="#3a342c" intensity={0.4} />

      <OrbitControls
        target={FLOORPLAN_CENTER}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.4}
        minDistance={10}
        maxDistance={42}
      />
      <ContactShadows position={[8, -0.01, 7]} opacity={0.45} scale={34} blur={2.2} far={10} />

      <HouseShell />

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
          case 'light': {
            const sconceSpots = SCONCE_LAYOUT[device.id];
            if (sconceSpots) {
              return (
                <group key={device.id}>
                  {sconceSpots.map((spot, i) => (
                    <WallSconce
                      key={i}
                      id={device.id}
                      position={[cx + spot.position[0], spot.position[1], cz + spot.position[2]]}
                      rotationY={spot.rotationY}
                      onSelect={onSelectDevice}
                    />
                  ))}
                </group>
              );
            }
            return <LightFixture key={device.id} id={device.id} position={worldPosition} onSelect={onSelectDevice} />;
          }
          case 'fan':
            return <Fan key={device.id} id={device.id} position={worldPosition} onSelect={onSelectDevice} />;
          case 'door':
            return device.variant === 'slide' ? (
              <SlidingDoor
                key={device.id}
                id={device.id}
                position={worldPosition}
                rotationY={device.rotationY}
                onSelect={onSelectDevice}
              />
            ) : (
              <Door
                key={device.id}
                id={device.id}
                position={worldPosition}
                rotationY={device.rotationY}
                onSelect={onSelectDevice}
              />
            );
          case 'thermostat':
            return <Thermostat key={device.id} id={device.id} position={worldPosition} onSelect={onSelectDevice} />;
          case 'motionSensor':
            return <MotionSensor key={device.id} id={device.id} position={worldPosition} onSelect={onSelectDevice} />;
          case 'ac':
            return (
              <AC
                key={device.id}
                id={device.id}
                position={worldPosition}
                rotationY={device.rotationY}
                onSelect={onSelectDevice}
              />
            );
          default:
            return null;
        }
      })}
    </Canvas>
  );
}
