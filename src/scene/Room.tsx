import type { RoomDef } from '../types/device';

const WALL_HEIGHT = 2.6;
const WALL_THICKNESS = 0.1;

export function Room({ room }: { room: RoomDef }) {
  const { x, z, width, depth } = room.bounds;
  const centerX = x + width / 2;
  const centerZ = z + depth / 2;

  return (
    <group position={[centerX, 0, centerZ]}>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#1c2530" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, WALL_HEIGHT / 2, -depth / 2]}>
        <boxGeometry args={[width, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color="#2a3542" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-width / 2, WALL_HEIGHT / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, depth]} />
        <meshStandardMaterial color="#2a3542" />
      </mesh>

      <mesh position={[0, 0.02, depth / 2 - 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width * 0.6, 0.02]} />
        <meshBasicMaterial color="#3fb950" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
