import { useMemo, type ReactElement } from 'react';
import { DoubleSide } from 'three';
import { getFurnitureWoodTexture, getRugTexture } from './textures';
import type { RoomDef } from '../types/device';

const WHITE_CABINET = '#f2f1ea';
const TEAL = '#2f7a72';
const TEAL_DARK = '#245e58';
const MUSTARD = '#d9a53a';
const CORAL = '#d97256';
const NAVY = '#2e4267';
const SAGE = '#7a9270';
const CREAM = '#f4f1e0';
const CHARCOAL = '#33322e';
const PLANT_GREEN = '#3f6b3f';
const POT_TERRACOTTA = '#b5673f';

function Rug({
  width,
  depth,
  position,
  base,
  accent,
}: {
  width: number;
  depth: number;
  position: [number, number, number];
  base: string;
  accent: string;
}) {
  const texture = useMemo(() => getRugTexture(base, accent), [base, accent]);
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial map={texture} roughness={0.9} />
    </mesh>
  );
}

export function PottedPlant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.1, 0.3, 10]} />
        <meshStandardMaterial color={POT_TERRACOTTA} roughness={0.8} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[Math.cos((i / 5) * Math.PI * 2) * 0.08, 0.45 + i * 0.03, Math.sin((i / 5) * Math.PI * 2) * 0.08]}
          rotation={[0, (i / 5) * Math.PI * 2, Math.PI / 5]}
          castShadow
        >
          <coneGeometry args={[0.05, 0.4, 6]} />
          <meshStandardMaterial color={PLANT_GREEN} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// Default orientation faces +z (books visible from larger-z side) - correct
// with no rotation when placed against a room's min-z ("south") wall. Pass
// rotationY for placement against any other wall.
function Bookshelf({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  const bookColors = [CORAL, TEAL, MUSTARD, NAVY, SAGE, '#a04b6b'];
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1.7, 0.32]} />
        <meshStandardMaterial map={getFurnitureWoodTexture()} color="#9a9a9a" roughness={0.6} />
      </mesh>
      {[0.5, 0.05, -0.4].map((shelfY, i) => (
        <group key={i} position={[0, shelfY, 0.08]}>
          {bookColors.slice(0, 5).map((color, j) => (
            <mesh key={j} position={[-0.35 + j * 0.16, 0.15, 0]} castShadow>
              <boxGeometry args={[0.1, 0.28 + (j % 2) * 0.06, 0.2]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function FloorLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.01, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 16]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.4, 8]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.42, 0]} castShadow>
        <coneGeometry args={[0.2, 0.26, 16, 1, true]} />
        <meshStandardMaterial color={CREAM} side={DoubleSide} roughness={0.7} />
      </mesh>
      {/* Always-on decorative mood light, not tied to any device - soft warm falloff, no shadow */}
      <pointLight position={[0, 1.3, 0]} color="#ffb877" intensity={0.35} distance={3.5} decay={2} />
    </group>
  );
}

function WallArt({ position, rotationY = 0, color }: { position: [number, number, number]; rotationY?: number; color: string }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <planeGeometry args={[0.5, 0.65]} />
        <meshStandardMaterial color={CREAM} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[0.38, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}

// Wall-mounted flat panel. Faces +z by default (correct for a room's min-z
// wall) - pass rotationY for placement against any other wall.
function WallTV({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[0.06, 0.06, 0.04]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.01]} castShadow>
        <boxGeometry args={[1.3, 0.75, 0.04]} />
        <meshStandardMaterial color="#111111" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[1.22, 0.68]} />
        <meshStandardMaterial color="#1c2a33" roughness={0.2} metalness={0.1} />
      </mesh>
    </group>
  );
}

function ConsoleTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.76, 0.9]} />
        <meshStandardMaterial map={getFurnitureWoodTexture()} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.68, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.18, 12]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.6} />
      </mesh>
      <pointLight position={[0, 0.85, 0]} color="#ffb877" intensity={0.2} distance={2} decay={2} />
    </group>
  );
}

function LivingRoomFurniture() {
  return (
    <group>
      {/* Massive area rug anchoring both seating clusters, in the house's cream/blush palette */}
      <Rug width={7} depth={4} position={[0, 0.005, -1]} base={CREAM} accent="#d9a58f" />

      {/* Sofa, backed against the west wall, facing east into the room */}
      <group position={[-4.05, 0, -1.5]}>
        <mesh position={[-0.32, 0.62, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.5, 2]} />
          <meshStandardMaterial color={TEAL_DARK} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.75, 0.5, 2]} />
          <meshStandardMaterial color={TEAL} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.5, -0.94]} castShadow receiveShadow>
          <boxGeometry args={[0.75, 0.3, 0.15]} />
          <meshStandardMaterial color={TEAL_DARK} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.5, 0.94]} castShadow receiveShadow>
          <boxGeometry args={[0.75, 0.3, 0.15]} />
          <meshStandardMaterial color={TEAL_DARK} roughness={0.85} />
        </mesh>
        {/* Throw pillows */}
        <mesh position={[0.15, 0.58, -0.5]} rotation={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.12, 0.32, 0.32]} />
          <meshStandardMaterial color={MUSTARD} roughness={0.9} />
        </mesh>
        <mesh position={[0.15, 0.58, 0.5]} rotation={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.12, 0.32, 0.32]} />
          <meshStandardMaterial color={CORAL} roughness={0.9} />
        </mesh>
      </group>

      {/* Coffee table, centered in front of the sofa */}
      <mesh position={[-2.1, 0.18, -1.5]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.05, 0.9]} />
        <meshStandardMaterial map={getFurnitureWoodTexture()} roughness={0.6} />
      </mesh>
      {[[-0.2, -0.4], [-0.2, 0.4], [0.2, -0.4], [0.2, 0.4]].map(([dx, dz], i) => (
        <mesh key={i} position={[-2.1 + dx, 0.08, -1.5 + dz]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.16, 6]} />
          <meshStandardMaterial map={getFurnitureWoodTexture()} roughness={0.6} />
        </mesh>
      ))}

      {/* Second, larger sofa, freestanding and facing north toward the TV */}
      <group position={[2, 0, -1.7]}>
        <mesh position={[0, 0.62, -0.34]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.5, 0.17]} />
          <meshStandardMaterial color={NAVY} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.5, 0.85]} />
          <meshStandardMaterial color="#3a5686" roughness={0.85} />
        </mesh>
        <mesh position={[-1.3, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.17, 0.3, 0.85]} />
          <meshStandardMaterial color={NAVY} roughness={0.85} />
        </mesh>
        <mesh position={[1.3, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.17, 0.3, 0.85]} />
          <meshStandardMaterial color={NAVY} roughness={0.85} />
        </mesh>
        {/* Throw pillows */}
        <mesh position={[-0.7, 0.58, 0.2]} rotation={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.32, 0.32, 0.12]} />
          <meshStandardMaterial color={CORAL} roughness={0.9} />
        </mesh>
        <mesh position={[0.7, 0.58, 0.2]} rotation={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.32, 0.32, 0.12]} />
          <meshStandardMaterial color={MUSTARD} roughness={0.9} />
        </mesh>
      </group>

      {/* Center table in front of the second sofa */}
      <mesh position={[2, 0.18, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.05, 0.55]} />
        <meshStandardMaterial map={getFurnitureWoodTexture()} roughness={0.6} />
      </mesh>
      {[[-0.45, -0.2], [-0.45, 0.2], [0.45, -0.2], [0.45, 0.2]].map(([dx, dz], i) => (
        <mesh key={i} position={[2 + dx, 0.08, -0.5 + dz]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.16, 6]} />
          <meshStandardMaterial map={getFurnitureWoodTexture()} roughness={0.6} />
        </mesh>
      ))}

      {/* TV console against the solid stretch of the north wall, facing south into the room */}
      <mesh position={[2, 0.28, 3.72]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.4, 0.4]} />
        <meshStandardMaterial color={WHITE_CABINET} roughness={0.6} />
      </mesh>
      <mesh position={[2, 0.9, 3.45]} castShadow>
        <boxGeometry args={[1.4, 0.9, 0.05]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.4} />
      </mesh>

      {/* Bookshelf against the south (exterior) wall, clear of the balcony door */}
      <Bookshelf position={[3.3, 0.85, -3.83]} />

      {/* Small entry console just north of the front door, out of its swing path */}
      <ConsoleTable position={[-4.15, 0, 2.9]} />

      <WallArt position={[-3.6, 1.7, 3.95]} color={MUSTARD} />
      <WallArt position={[-2.6, 1.7, 3.95]} color={CORAL} />

      <PottedPlant position={[1.6, 0, -3.6]} scale={1.1} />
      <PottedPlant position={[-3.9, 0, 3.6]} scale={0.9} />
      <FloorLamp position={[-3.75, 0, -0.15]} />
    </group>
  );
}

function KitchenFurniture() {
  return (
    <group>
      {/* Counter run along back (north) wall */}
      <mesh position={[0, 0.45, -3]} castShadow receiveShadow>
        <boxGeometry args={[5.5, 0.9, 0.6]} />
        <meshStandardMaterial color={WHITE_CABINET} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.92, -3]} castShadow>
        <boxGeometry args={[5.5, 0.05, 0.65]} />
        <meshStandardMaterial map={getFurnitureWoodTexture()} roughness={0.5} />
      </mesh>
      {/* Upper cabinets */}
      <mesh position={[-1.5, 2, -3.2]} castShadow>
        <boxGeometry args={[2, 0.7, 0.35]} />
        <meshStandardMaterial color={WHITE_CABINET} roughness={0.6} />
      </mesh>
      {/* Stovetop */}
      <mesh position={[1.5, 0.94, -3]} castShadow>
        <boxGeometry args={[0.7, 0.02, 0.5]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.3} metalness={0.4} />
      </mesh>
      {[[-0.18, -0.12], [0.18, -0.12], [-0.18, 0.12], [0.18, 0.12]].map(([dx, dz], i) => (
        <mesh key={i} position={[1.5 + dx, 0.95, -3 + dz]}>
          <cylinderGeometry args={[0.07, 0.07, 0.01, 16]} />
          <meshStandardMaterial color="#a8382a" emissive="#a8382a" emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* Fridge */}
      <mesh position={[2.6, 0.9, -3]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 1.8, 0.6]} />
        <meshStandardMaterial color={WHITE_CABINET} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Island, with a pendant light overhead */}
      <mesh position={[0, 0.4, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.8, 0.9]} />
        <meshStandardMaterial color={NAVY} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.82, -0.2]} castShadow>
        <boxGeometry args={[1.9, 0.04, 1]} />
        <meshStandardMaterial map={getFurnitureWoodTexture()} roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.35, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.6, 6]} />
        <meshStandardMaterial color={CHARCOAL} />
      </mesh>
      <mesh position={[0, 2.02, 0]} castShadow>
        <coneGeometry args={[0.14, 0.13, 16, 1, true]} />
        <meshStandardMaterial color={CHARCOAL} side={DoubleSide} roughness={0.5} metalness={0.3} />
      </mesh>
      <pointLight position={[0, 1.95, 0]} color="#ffb877" intensity={0.3} distance={3} decay={2} />
      {/* Bar stools */}
      {[-0.7, 0.7].map((dx, i) => (
        <group key={i} position={[dx, 0, 1]}>
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.56, 6]} />
            <meshStandardMaterial map={getFurnitureWoodTexture()} color="#9a9a9a" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.58, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.05, 12]} />
            <meshStandardMaterial color={MUSTARD} roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Small dining nook by the south window */}
      <Rug width={1.8} depth={1.6} position={[2.4, 0.005, 3] as [number, number, number]} base={CREAM} accent={SAGE} />
      <mesh position={[2.4, 0.4, 3]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.04, 20]} />
        <meshStandardMaterial map={getFurnitureWoodTexture()} roughness={0.6} />
      </mesh>
      <mesh position={[2.4, 0.2, 3]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.36, 8]} />
        <meshStandardMaterial map={getFurnitureWoodTexture()} color="#9a9a9a" roughness={0.6} />
      </mesh>
      {[[-0.65, 0], [0.65, 0], [0, -0.65], [0, 0.65]].map(([dx, dz], i) => (
        <mesh key={i} position={[2.4 + dx, 0.24, 3 + dz]} castShadow>
          <boxGeometry args={[0.3, 0.48, 0.3]} />
          <meshStandardMaterial color={SAGE} roughness={0.8} />
        </mesh>
      ))}

      <PottedPlant position={[-2.7, 0, 3.4]} scale={0.9} />
    </group>
  );
}

function Bedroom1Furniture() {
  return (
    <group>
      <Rug width={2.2} depth={1.8} position={[-0.4, 0.005, -0.3]} base={CREAM} accent={NAVY} />

      {/* Bed, headboard against the west wall, footboard pointing east into the room */}
      <group position={[-2.3, 0, 0]}>
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.35, 1.9]} />
          <meshStandardMaterial map={getFurnitureWoodTexture()} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.1, 0.15, 1.8]} />
          <meshStandardMaterial color={CREAM} roughness={0.9} />
        </mesh>
        {/* Blanket, foot end (east) */}
        <mesh position={[0.65, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.1, 1.8]} />
          <meshStandardMaterial color={NAVY} roughness={0.85} />
        </mesh>
        {/* Headboard panel, west end against the wall */}
        <mesh position={[-0.9, 0.62, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.3, 1.8]} />
          <meshStandardMaterial color={NAVY} roughness={0.8} />
        </mesh>
        {/* Pillows near the headboard */}
        <mesh position={[-0.75, 0.55, -0.55]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.12, 0.55]} />
          <meshStandardMaterial color={CREAM} roughness={0.9} />
        </mesh>
        <mesh position={[-0.75, 0.55, 0.55]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.12, 0.55]} />
          <meshStandardMaterial color={CREAM} roughness={0.9} />
        </mesh>
      </group>

      {/* Nightstand + lamp, beside the headboard */}
      <mesh position={[-3.1, 0.25, -1.3]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.5, 0.4]} />
        <meshStandardMaterial map={getFurnitureWoodTexture()} roughness={0.6} />
      </mesh>
      <mesh position={[-3.1, 0.6, -1.3]}>
        <coneGeometry args={[0.1, 0.12, 12]} />
        <meshStandardMaterial color={MUSTARD} roughness={0.7} />
      </mesh>
      {/* Always-on decorative mood light, not tied to any device */}
      <pointLight position={[-3.1, 0.55, -1.3]} color="#ffb877" intensity={0.25} distance={2.5} decay={2} />

      {/* Wardrobe against the north wall, clear of the window */}
      <mesh position={[1.8, 0.9, 2.72]} castShadow receiveShadow>
        <boxGeometry args={[1, 1.8, 0.55]} />
        <meshStandardMaterial color={WHITE_CABINET} roughness={0.6} />
      </mesh>
      <mesh position={[1.8, 0.9, 2.44]}>
        <boxGeometry args={[0.02, 1.6, 0.02]} />
        <meshStandardMaterial color={CHARCOAL} />
      </mesh>

      {/* Bookshelf against the south wall, clear of the doorway gap */}
      <Bookshelf position={[1.5, 0.85, -2.83]} />

      {/* Wall-mounted TV on the east wall, facing the bed */}
      <WallTV position={[3.42, 1.5, -1.7]} rotationY={-Math.PI / 2} />
    </group>
  );
}

function BathroomFurniture() {
  return (
    <group>
      {/* Vanity + sink, against the south (interior) wall */}
      <mesh position={[0, 0.4, -2.6]} castShadow receiveShadow>
        <boxGeometry args={[1, 0.8, 0.5]} />
        <meshStandardMaterial color={WHITE_CABINET} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.84, -2.6]} castShadow>
        <boxGeometry args={[0.9, 0.08, 0.45]} />
        <meshStandardMaterial color="#e6e6e6" roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.9, -2.6]}>
        <cylinderGeometry args={[0.16, 0.16, 0.06, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      {/* Mirror */}
      <mesh position={[0, 1.6, -2.85]}>
        <boxGeometry args={[0.7, 0.6, 0.03]} />
        <meshStandardMaterial color="#bcd6d8" metalness={0.6} roughness={0.1} />
      </mesh>

      {/* Toilet, against the west wall, clear of the doorway gap */}
      <group position={[-1, 0, -1.6]}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.4, 0.5]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.5, -0.15]} castShadow>
          <boxGeometry args={[0.35, 0.25, 0.15]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
      </group>

      {/* Shower stall, against the east wall */}
      <group position={[0.85, 0, 1.3]}>
        <mesh position={[0, 0.01, 0]} receiveShadow>
          <boxGeometry args={[1, 0.02, 1]} />
          <meshStandardMaterial color="#dfe6e6" roughness={0.4} />
        </mesh>
        <mesh position={[-0.48, 0.9, 0]}>
          <boxGeometry args={[0.02, 1.8, 1]} />
          <meshStandardMaterial color="#a8d8dc" transparent opacity={0.35} />
        </mesh>
        <mesh position={[0, 0.9, -0.48]}>
          <boxGeometry args={[1, 1.8, 0.02]} />
          <meshStandardMaterial color="#a8d8dc" transparent opacity={0.35} />
        </mesh>
      </group>

      <Rug width={0.8} depth={0.5} position={[0, 0.005, -1.7]} base={CREAM} accent={TEAL} />
    </group>
  );
}

function Bedroom2Furniture() {
  return (
    <group>
      <Rug width={1.8} depth={1.4} position={[-1.3, 0.005, 0]} base={CREAM} accent={CORAL} />

      {/* Bed, headboard against the north wall, footboard pointing south into the room */}
      <group position={[-1.5, 0, 1.9]}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.3, 1.9]} />
          <meshStandardMaterial map={getFurnitureWoodTexture()} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.12, 1.8]} />
          <meshStandardMaterial color={CREAM} roughness={0.9} />
        </mesh>
        {/* Blanket, foot end (south) */}
        <mesh position={[0, 0.48, -0.5]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.08, 0.7]} />
          <meshStandardMaterial color={CORAL} roughness={0.85} />
        </mesh>
        {/* Headboard, north end against the wall */}
        <mesh position={[0, 0.55, 0.75]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.24, 0.15]} />
          <meshStandardMaterial color={CORAL} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.5, 0.62]} castShadow receiveShadow>
          <boxGeometry args={[0.45, 0.1, 0.32]} />
          <meshStandardMaterial color={CREAM} roughness={0.9} />
        </mesh>
      </group>

      {/* Desk against the east wall, facing the window */}
      <mesh position={[2.55, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.05, 1.2]} />
        <meshStandardMaterial map={getFurnitureWoodTexture()} roughness={0.6} />
      </mesh>
      {[[-0.2, -0.5], [-0.2, 0.5], [0.2, -0.5], [0.2, 0.5]].map(([dx, dz], i) => (
        <mesh key={i} position={[2.55 + dx, 0.2, dz]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
          <meshStandardMaterial map={getFurnitureWoodTexture()} color="#9a9a9a" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[2.15, 0.25, 0]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.4]} />
        <meshStandardMaterial color={SAGE} roughness={0.8} />
      </mesh>

      {/* Bookshelf against the south wall, clear of the doorway gap */}
      <Bookshelf position={[2, 0.85, -2.83]} />
      <PottedPlant position={[2.5, 0, 2.5]} scale={0.8} />

      {/* Wall-mounted TV on the south wall, facing the bed */}
      <WallTV position={[-2, 1.5, -2.92]} />
    </group>
  );
}

const FURNITURE_BY_ROOM: Record<RoomDef['id'], () => ReactElement> = {
  'living-room': LivingRoomFurniture,
  kitchen: KitchenFurniture,
  'bedroom-1': Bedroom1Furniture,
  bathroom: BathroomFurniture,
  'bedroom-2': Bedroom2Furniture,
};

export function RoomFurniture({ roomId }: { roomId: RoomDef['id'] }) {
  const Component = FURNITURE_BY_ROOM[roomId];
  return <Component />;
}
