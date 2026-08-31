import { useMemo } from 'react';
import { PottedPlant } from './Furniture';
import {
  getArtDecoWallpaper,
  getDiamondLatticeWallpaper,
  getPlasterWallTexture,
  getRippleWallpaper,
  getScallopWaveWallpaper,
  getScatterDotWallpaper,
} from './textures';

const WALL_HEIGHT = 2.6;
const EXT_THICKNESS = 0.16;
const INT_THICKNESS = 0.1;
const WALL_COLOR = '#f7f6f2';
const TRIM_COLOR = '#ffffff';
const GLASS_COLOR = '#a8d8dc';
const CAP_COLOR = '#3a3a38';
const RAILING_COLOR = '#8a8578';

// The house tiles a single 16x14 footprint edge-to-edge - see data/devices.ts
// ROOMS. A balcony deck extends south off the living room, reached through
// the balcony slider in the south exterior wall.
const FOOTPRINT = { x0: 0, x1: 16, z0: 0, z1: 14 };
const BALCONY = { x0: 2, x1: 6, z0: -3, z1: 0 };

interface WallSegmentsProps {
  axis: 'x' | 'z';
  fixed: number;
  ranges: [number, number][];
  thickness: number;
  cap?: boolean;
}

function WallSegments({ axis, fixed, ranges, thickness, cap }: WallSegmentsProps) {
  const wallTexture = useMemo(() => getPlasterWallTexture(), []);

  return (
    <>
      {ranges.map(([a, b], i) => {
        const length = b - a;
        const mid = (a + b) / 2;
        const position: [number, number, number] =
          axis === 'x' ? [mid, WALL_HEIGHT / 2, fixed] : [fixed, WALL_HEIGHT / 2, mid];
        const size: [number, number, number] =
          axis === 'x' ? [length, WALL_HEIGHT, thickness] : [thickness, WALL_HEIGHT, length];

        return (
          <group key={i}>
            <mesh position={position} receiveShadow castShadow>
              <boxGeometry args={size} />
              <meshStandardMaterial map={wallTexture} color={WALL_COLOR} roughness={0.92} />
            </mesh>
            {/* Baseboard trim, every wall - mirrors the crown-molding cap at floor level */}
            <mesh position={[position[0], 0.09, position[2]]} castShadow receiveShadow>
              <boxGeometry
                args={
                  axis === 'x' ? [length + 0.06, 0.18, thickness + 0.05] : [thickness + 0.05, 0.18, length + 0.06]
                }
              />
              <meshStandardMaterial color={TRIM_COLOR} roughness={0.45} />
            </mesh>
            {cap && (
              <mesh position={[position[0], WALL_HEIGHT + 0.04, position[2]]}>
                <boxGeometry
                  args={
                    axis === 'x'
                      ? [length + 0.1, 0.08, thickness + 0.1]
                      : [thickness + 0.1, 0.08, length + 0.1]
                  }
                />
                <meshStandardMaterial color={CAP_COLOR} roughness={0.8} />
              </mesh>
            )}
          </group>
        );
      })}
    </>
  );
}

interface WindowProps {
  position: [number, number, number];
  wide: number;
  facing: 'north' | 'south' | 'east' | 'west';
}

// Plane geometry's default normal points +z. Rotate around Y so the glass
// faces into the room regardless of which exterior wall it's set into.
const FACING_ROTATION_Y: Record<WindowProps['facing'], number> = {
  south: 0,
  north: Math.PI,
  west: Math.PI / 2,
  east: -Math.PI / 2,
};

function Window({ position, wide, facing }: WindowProps) {
  const paneSize: [number, number] = [wide, WALL_HEIGHT * 0.42];
  const frameSize: [number, number] = [wide + 0.14, WALL_HEIGHT * 0.5];

  return (
    <group position={position} rotation={[0, FACING_ROTATION_Y[facing], 0]}>
      <mesh>
        <planeGeometry args={frameSize} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={paneSize} />
        <meshStandardMaterial color={GLASS_COLOR} emissive={GLASS_COLOR} emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.018]}>
        <boxGeometry args={[paneSize[0], 0.015, 0.01]} />
        <meshStandardMaterial color={TRIM_COLOR} />
      </mesh>
      <mesh position={[0, 0, 0.018]}>
        <boxGeometry args={[0.015, paneSize[1], 0.01]} />
        <meshStandardMaterial color={TRIM_COLOR} />
      </mesh>
    </group>
  );
}

interface WallpaperProps {
  position: [number, number, number];
  size: [number, number];
  facing: 'north' | 'south' | 'east' | 'west';
  texture: ReturnType<typeof getPlasterWallTexture>;
}

// A single wallpaper panel, mounted just proud of a wall's interior face - same
// offset pattern as Window above, so it never z-fights with the plaster wall
// behind it. Each room gets its own texture, applied to every wall run that
// borders that room (see ROOM_WALLPAPER_RUNS below) so no wall is left blank.
function Wallpaper({ position, size, facing, texture }: WallpaperProps) {
  return (
    <mesh position={position} rotation={[0, FACING_ROTATION_Y[facing], 0]}>
      <planeGeometry args={size} />
      <meshStandardMaterial map={texture} roughness={0.88} />
    </mesh>
  );
}

const WALLPAPER_Y = WALL_HEIGHT / 2 + 0.05;
const WALLPAPER_H = WALL_HEIGHT - 0.2;

// +1 walls (south/west) sit at fixed + offset; -1 walls (north/east) sit at
// fixed - offset - matches FACING_ROTATION_Y's normal directions above.
const FACE_OFFSET_SIGN: Record<WallpaperProps['facing'], 1 | -1> = { south: 1, west: 1, north: -1, east: -1 };

interface WallRunSpec {
  /** The wall's fixed coordinate - a z-value for south/north runs, an x-value for west/east runs. */
  fixed: number;
  /** Solid spans along that wall (excludes door/passthrough gaps) - x-intervals for south/north, z-intervals for west/east. */
  ranges: [number, number][];
  facing: WallpaperProps['facing'];
  thicknessHalf: number;
}

// Every wall run bordering each room, one entry per wall side (4 per room), each
// possibly split into multiple ranges by a door or open passthrough gap. Derived
// directly from the wall layout below, so every wall a room touches gets papered
// right up to (not through) any doorway.
const ROOM_WALLPAPER_RUNS: Record<string, WallRunSpec[]> = {
  'living-room': [
    { fixed: 0, ranges: [[0, 2], [6, 9]], facing: 'south', thicknessHalf: EXT_THICKNESS / 2 }, // south ext
    { fixed: 0, ranges: [[0, 5], [6.2, 8]], facing: 'west', thicknessHalf: EXT_THICKNESS / 2 }, // west ext
    { fixed: 9, ranges: [[0, 3], [5, 8]], facing: 'east', thicknessHalf: INT_THICKNESS / 2 }, // vs kitchen
    { fixed: 8, ranges: [[0, 2], [3.2, 9]], facing: 'north', thicknessHalf: INT_THICKNESS / 2 }, // vs bedroom row
  ],
  kitchen: [
    { fixed: 0, ranges: [[9, 16]], facing: 'south', thicknessHalf: EXT_THICKNESS / 2 }, // south ext
    { fixed: 16, ranges: [[0, 8]], facing: 'east', thicknessHalf: EXT_THICKNESS / 2 }, // east ext
    { fixed: 9, ranges: [[0, 3], [5, 8]], facing: 'west', thicknessHalf: INT_THICKNESS / 2 }, // vs living room
    { fixed: 8, ranges: [[9, 13], [14.2, 16]], facing: 'north', thicknessHalf: INT_THICKNESS / 2 }, // vs bathroom/bedroom-2 row
  ],
  'bedroom-1': [
    { fixed: 0, ranges: [[8, 14]], facing: 'west', thicknessHalf: EXT_THICKNESS / 2 }, // west ext
    { fixed: 14, ranges: [[0, 7]], facing: 'north', thicknessHalf: EXT_THICKNESS / 2 }, // north ext
    { fixed: 7, ranges: [[8, 10.5], [11.5, 14]], facing: 'east', thicknessHalf: INT_THICKNESS / 2 }, // vs bathroom
    { fixed: 8, ranges: [[0, 2], [3.2, 7]], facing: 'south', thicknessHalf: INT_THICKNESS / 2 }, // vs living/kitchen row
  ],
  bathroom: [
    { fixed: 14, ranges: [[7, 10]], facing: 'north', thicknessHalf: EXT_THICKNESS / 2 }, // north ext
    { fixed: 7, ranges: [[8, 10.5], [11.5, 14]], facing: 'west', thicknessHalf: INT_THICKNESS / 2 }, // vs bedroom 1
    { fixed: 10, ranges: [[8, 14]], facing: 'east', thicknessHalf: INT_THICKNESS / 2 }, // vs bedroom 2
    { fixed: 8, ranges: [[7, 10]], facing: 'south', thicknessHalf: INT_THICKNESS / 2 }, // vs living/kitchen row
  ],
  'bedroom-2': [
    { fixed: 14, ranges: [[10, 16]], facing: 'north', thicknessHalf: EXT_THICKNESS / 2 }, // north ext
    { fixed: 16, ranges: [[8, 14]], facing: 'east', thicknessHalf: EXT_THICKNESS / 2 }, // east ext
    { fixed: 10, ranges: [[8, 14]], facing: 'west', thicknessHalf: INT_THICKNESS / 2 }, // vs bathroom
    { fixed: 8, ranges: [[10, 13], [14.2, 16]], facing: 'south', thicknessHalf: INT_THICKNESS / 2 }, // vs living/kitchen row
  ],
};

function RoomWallpapers({ runs, texture }: { runs: WallRunSpec[]; texture: ReturnType<typeof getPlasterWallTexture> }) {
  return (
    <>
      {runs.map((run, ri) =>
        run.ranges.map(([a, b], si) => {
          const mid = (a + b) / 2;
          const length = b - a - 0.04;
          const alongX = run.facing === 'south' || run.facing === 'north';
          const offset = (run.thicknessHalf + 0.002) * FACE_OFFSET_SIGN[run.facing];
          const position: [number, number, number] = alongX
            ? [mid, WALLPAPER_Y, run.fixed + offset]
            : [run.fixed + offset, WALLPAPER_Y, mid];

          return (
            <Wallpaper
              key={`${ri}-${si}`}
              position={position}
              size={[length, WALLPAPER_H]}
              facing={run.facing}
              texture={texture}
            />
          );
        }),
      )}
    </>
  );
}

function BalconyDeck() {
  const { x0, x1, z0, z1 } = BALCONY;
  const width = x1 - x0;
  const depth = z0 - z1 > 0 ? z0 - z1 : z1 - z0;
  const centerX = (x0 + x1) / 2;
  const centerZ = (z0 + z1) / 2;
  const railHeight = 0.9;
  const postGap = 0.5;

  const posts: [number, number][] = [];
  for (let x = x0; x <= x1; x += postGap) posts.push([x, z0]);
  for (let z = z0; z <= z1; z += postGap) {
    posts.push([x0, z]);
    posts.push([x1, z]);
  }

  return (
    <group>
      <mesh position={[centerX, -0.02, centerZ]} receiveShadow>
        <boxGeometry args={[width, 0.04, depth]} />
        <meshStandardMaterial color="#c9b896" roughness={0.8} />
      </mesh>
      {posts.map(([px, pz], i) => (
        <mesh key={i} position={[px, railHeight / 2, pz]} castShadow>
          <boxGeometry args={[0.04, railHeight, 0.04]} />
          <meshStandardMaterial color={RAILING_COLOR} metalness={0.3} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[centerX, railHeight, z0]}>
        <boxGeometry args={[width, 0.04, 0.04]} />
        <meshStandardMaterial color={RAILING_COLOR} metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[x0, railHeight, centerZ]}>
        <boxGeometry args={[0.04, 0.04, depth]} />
        <meshStandardMaterial color={RAILING_COLOR} metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[x1, railHeight, centerZ]}>
        <boxGeometry args={[0.04, 0.04, depth]} />
        <meshStandardMaterial color={RAILING_COLOR} metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Small bistro set + plants so the deck reads as used space, not bare concrete */}
      <mesh position={[centerX, 0.38, centerZ]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.03, 16]} />
        <meshStandardMaterial color="#8a6238" roughness={0.6} />
      </mesh>
      <mesh position={[centerX, 0.19, centerZ]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.36, 8]} />
        <meshStandardMaterial color="#5c4025" roughness={0.6} />
      </mesh>
      {[-0.5, 0.5].map((dx, i) => (
        <mesh key={i} position={[centerX + dx, 0.24, centerZ]} castShadow>
          <boxGeometry args={[0.3, 0.48, 0.3]} />
          <meshStandardMaterial color="#7a9270" roughness={0.8} />
        </mesh>
      ))}
      <PottedPlant position={[x0 + 0.35, 0, z0 + 0.35]} scale={1} />
      <PottedPlant position={[x1 - 0.35, 0, z0 + 0.35]} scale={0.85} />
    </group>
  );
}

export function HouseShell() {
  const { x0, x1, z0, z1 } = FOOTPRINT;
  const extFace = EXT_THICKNESS / 2;
  const winY = WALL_HEIGHT * 0.55;

  // One original, self-designed wallpaper print per room - each a seamlessly
  // tileable pattern (repeat count tuned per panel so the motif reads at a
  // sensible physical scale), not a reference-based mural.
  const livingRoomWallpaper = useMemo(() => getArtDecoWallpaper(7, 3), []);
  const bedroom1Wallpaper = useMemo(() => getScatterDotWallpaper(6, 4), []);
  const bedroom2Wallpaper = useMemo(() => getScallopWaveWallpaper(6, 4), []);
  const kitchenWallpaper = useMemo(() => getDiamondLatticeWallpaper(7, 4), []);
  const bathroomWallpaper = useMemo(() => getRippleWallpaper(3, 4), []);

  return (
    <group>
      {/* Exterior perimeter */}
      <WallSegments
        axis="x"
        fixed={z0}
        thickness={EXT_THICKNESS}
        ranges={[
          [x0, BALCONY.x0],
          [BALCONY.x1, x1],
        ]}
        cap
      />
      <WallSegments axis="x" fixed={z1} thickness={EXT_THICKNESS} ranges={[[x0, x1]]} cap />
      <WallSegments
        axis="z"
        fixed={x0}
        thickness={EXT_THICKNESS}
        ranges={[
          [z0, 5],
          [6.2, z1],
        ]}
        cap
      />
      <WallSegments axis="z" fixed={x1} thickness={EXT_THICKNESS} ranges={[[z0, z1]]} cap />

      {/* Interior partitions, each with doorway gaps connecting neighboring rooms.
          All get the same top cap as the exterior perimeter, so the trim line runs
          continuously along every wall in the house, not just the outline. */}
      {/* Living room | Kitchen (open pass-through, no door leaf) */}
      <WallSegments
        axis="z"
        fixed={9}
        thickness={INT_THICKNESS}
        ranges={[
          [z0, 3],
          [5, 8],
        ]}
        cap
      />
      {/* Bedroom 1 | Bathroom (bathroom door) */}
      <WallSegments
        axis="z"
        fixed={7}
        thickness={INT_THICKNESS}
        ranges={[
          [8, 10.5],
          [11.5, z1],
        ]}
        cap
      />
      {/* Bathroom | Bedroom 2, solid */}
      <WallSegments axis="z" fixed={10} thickness={INT_THICKNESS} ranges={[[8, z1]]} cap />
      {/* Living/Kitchen row | Bedroom/Bathroom row, with bedroom 1 + bedroom 2 doors */}
      <WallSegments
        axis="x"
        fixed={8}
        thickness={INT_THICKNESS}
        ranges={[
          [x0, 2],
          [3.2, 13],
          [14.2, x1],
        ]}
        cap
      />

      {/* Windows, set just inside each exterior wall's interior face */}
      <Window position={[11, winY, z0 + extFace + 0.001]} wide={1.6} facing="south" />
      <Window position={[extFace + 0.001, winY, 2]} wide={1.6} facing="west" />
      <Window position={[2, winY, z1 - extFace - 0.001]} wide={1.6} facing="north" />
      <Window position={[8.5, winY, z1 - extFace - 0.001]} wide={0.9} facing="north" />
      <Window position={[x1 - extFace - 0.001, winY, 11]} wide={1.6} facing="east" />

      {/* Wallpaper - every wall run bordering each room gets that room's pattern,
          right up to (never through) a doorway, so no wall is left plain. */}
      <RoomWallpapers runs={ROOM_WALLPAPER_RUNS['living-room']} texture={livingRoomWallpaper} />
      <RoomWallpapers runs={ROOM_WALLPAPER_RUNS.kitchen} texture={kitchenWallpaper} />
      <RoomWallpapers runs={ROOM_WALLPAPER_RUNS['bedroom-1']} texture={bedroom1Wallpaper} />
      <RoomWallpapers runs={ROOM_WALLPAPER_RUNS.bathroom} texture={bathroomWallpaper} />
      <RoomWallpapers runs={ROOM_WALLPAPER_RUNS['bedroom-2']} texture={bedroom2Wallpaper} />

      <BalconyDeck />
    </group>
  );
}
