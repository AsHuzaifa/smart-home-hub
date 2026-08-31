import { useMemo } from 'react';
import { RoomFurniture } from './Furniture';
import { getKitchenFloorTexture, getTileFloorTexture, getWoodFloorTexture } from './textures';
import type { RoomDef } from '../types/device';

function getFloorTextureFor(roomId: RoomDef['id']) {
  switch (roomId) {
    case 'kitchen':
      return { base: getKitchenFloorTexture(), tiles: true };
    case 'bathroom':
      return { base: getTileFloorTexture(), tiles: true };
    default:
      return { base: getWoodFloorTexture(), tiles: false };
  }
}

export function Room({ room }: { room: RoomDef }) {
  const { x, z, width, depth } = room.bounds;
  const centerX = x + width / 2;
  const centerZ = z + depth / 2;
  const { base, tiles } = getFloorTextureFor(room.id);

  const floorTexture = useMemo(() => {
    const tex = base.clone();
    tex.needsUpdate = true;
    tex.repeat.set(width / (tiles ? 3 : 2), depth / (tiles ? 3 : 2));
    return tex;
  }, [base, width, depth, tiles]);

  return (
    <group position={[centerX, 0, centerZ]}>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial map={floorTexture} roughness={tiles ? 0.4 : 0.75} />
      </mesh>

      <RoomFurniture roomId={room.id} />
    </group>
  );
}
