import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

function makeCanvas(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return { canvas, ctx: canvas.getContext('2d')! };
}

function noise(ctx: CanvasRenderingContext2D, size: number, alpha: number) {
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 255 * alpha;
    data[i] += grain;
    data[i + 1] += grain;
    data[i + 2] += grain;
  }
  ctx.putImageData(imageData, 0, 0);
}

let woodFloorTexture: CanvasTexture | null = null;
export function getWoodFloorTexture() {
  if (woodFloorTexture) return woodFloorTexture;

  const size = 256;
  const { canvas, ctx } = makeCanvas(size);

  ctx.fillStyle = '#8a6a4a';
  ctx.fillRect(0, 0, size, size);

  const plankWidth = size / 8;
  for (let i = 0; i < 8; i++) {
    const shade = 6 + Math.sin(i * 1.7) * 6;
    ctx.fillStyle = `rgba(${shade > 0 ? 40 : 0}, ${20}, ${10}, ${Math.abs(shade) / 40})`;
    ctx.fillRect(i * plankWidth, 0, 1.5, size);
  }

  noise(ctx, size, 0.05);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(4, 4);
  woodFloorTexture = texture;
  return texture;
}

let furnitureWoodTexture: CanvasTexture | null = null;
// Finer-grained wood texture for furniture surfaces (tables, bed frames, shelving)  - 
// a separate texture/repeat from the floor's wider plank pattern, since both are
// cached singletons and would otherwise fight over one shared repeat setting.
export function getFurnitureWoodTexture() {
  if (furnitureWoodTexture) return furnitureWoodTexture;

  const size = 256;
  const { canvas, ctx } = makeCanvas(size);

  ctx.fillStyle = '#8a6238';
  ctx.fillRect(0, 0, size, size);

  // Long horizontal grain streaks
  for (let i = 0; i < 40; i++) {
    const y = Math.random() * size;
    ctx.strokeStyle = `rgba(50,28,14,${0.05 + Math.random() * 0.09})`;
    ctx.lineWidth = 0.6 + Math.random() * 1.4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(size * 0.3, y + (Math.random() - 0.5) * 8, size * 0.7, y + (Math.random() - 0.5) * 8, size, y);
    ctx.stroke();
  }
  // Occasional darker knots
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = 'rgba(40,22,10,0.25)';
    ctx.beginPath();
    ctx.ellipse(Math.random() * size, Math.random() * size, 4 + Math.random() * 3, 8 + Math.random() * 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  noise(ctx, size, 0.03);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 1);
  furnitureWoodTexture = texture;
  return texture;
}

let plasterWallTexture: CanvasTexture | null = null;
export function getPlasterWallTexture() {
  if (plasterWallTexture) return plasterWallTexture;

  const size = 128;
  const { canvas, ctx } = makeCanvas(size);

  ctx.fillStyle = '#f7f6f2';
  ctx.fillRect(0, 0, size, size);
  noise(ctx, size, 0.025);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(2, 1);
  plasterWallTexture = texture;
  return texture;
}

let tileFloorTexture: CanvasTexture | null = null;
export function getTileFloorTexture() {
  if (tileFloorTexture) return tileFloorTexture;

  const size = 256;
  const { canvas, ctx } = makeCanvas(size);

  ctx.fillStyle = '#e9e7df';
  ctx.fillRect(0, 0, size, size);

  const tile = size / 4;
  ctx.strokeStyle = 'rgba(120,115,100,0.4)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tile, 0);
    ctx.lineTo(i * tile, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * tile);
    ctx.lineTo(size, i * tile);
    ctx.stroke();
  }

  noise(ctx, size, 0.02);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(3, 3);
  tileFloorTexture = texture;
  return texture;
}

let kitchenFloorTexture: CanvasTexture | null = null;
export function getKitchenFloorTexture() {
  if (kitchenFloorTexture) return kitchenFloorTexture;

  const size = 256;
  const { canvas, ctx } = makeCanvas(size);

  // Warm two-tone checkerboard tile - visually distinct from the bathroom's
  // cool grey-grid tile, and from the bedrooms/living room's wood planks.
  const tile = size / 4;
  const colorA = '#d8bc94';
  const colorB = '#c9a476';
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? colorA : colorB;
      ctx.fillRect(col * tile, row * tile, tile, tile);
    }
  }

  ctx.strokeStyle = 'rgba(90,60,30,0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tile, 0);
    ctx.lineTo(i * tile, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * tile);
    ctx.lineTo(size, i * tile);
    ctx.stroke();
  }

  noise(ctx, size, 0.025);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(3, 3);
  kitchenFloorTexture = texture;
  return texture;
}

// Original, self-designed wallpaper patterns - each is a small SEAMLESSLY TILEABLE
// canvas tile (not a mural), stretched across a room's accent wall via
// texture.repeat, the way real wallpaper repeats a print. One distinct pattern per
// room, all original geometric/abstract motifs (no reference imagery).

function tileBase(size: number, fill: string) {
  const { canvas, ctx } = makeCanvas(size);
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, size, size);
  return { canvas, ctx };
}

function finishTile(canvas: HTMLCanvasElement, repeatX: number, repeatY: number) {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  return texture;
}

// Art-deco scalloped arches, sage + terracotta on cream - living room.
// The arch is drawn as a half-circle whose ends land exactly on the tile's
// bottom corners, so adjacent tiles' arches link up into a continuous
// scalloped border when repeated.
export function getArtDecoWallpaper(repeatX = 8, repeatY = 4) {
  const size = 160;
  const { canvas, ctx } = tileBase(size, '#efe9dc');

  ctx.strokeStyle = 'rgba(122,146,112,0.55)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(size / 2, size, size * 0.5, Math.PI, 2 * Math.PI);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(217,114,86,0.5)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(size / 2, size, size * 0.34, Math.PI, 2 * Math.PI);
  ctx.stroke();

  ctx.fillStyle = 'rgba(122,146,112,0.4)';
  ctx.beginPath();
  ctx.arc(size / 2, size - size * 0.5, 3.5, 0, Math.PI * 2);
  ctx.fill();

  noise(ctx, size, 0.015);
  return finishTile(canvas, repeatX, repeatY);
}

// Scattered soft dots in two sizes/tones - a calm, uncrowded print for a
// bedroom. Dots near an edge are echoed on the opposite edge so the scatter
// tiles seamlessly.
export function getScatterDotWallpaper(repeatX = 6, repeatY = 6) {
  const size = 140;
  const { canvas, ctx } = tileBase(size, '#efe8da');
  const margin = 16;

  const dots: { x: number; y: number; r: number; color: string }[] = [];
  for (let i = 0; i < 10; i++) {
    dots.push({
      x: Math.random() * size,
      y: Math.random() * size,
      r: 2.5 + Math.random() * 4,
      color: Math.random() > 0.5 ? 'rgba(46,66,103,0.4)' : 'rgba(217,165,58,0.45)',
    });
  }

  const draw = (x: number, y: number, r: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  for (const d of dots) {
    draw(d.x, d.y, d.r, d.color);
    // Echo across whichever edges this dot sits close to, so it doesn't clip at the tile seam.
    const nearLeft = d.x < margin;
    const nearRight = d.x > size - margin;
    const nearTop = d.y < margin;
    const nearBottom = d.y > size - margin;
    if (nearLeft) draw(d.x + size, d.y, d.r, d.color);
    if (nearRight) draw(d.x - size, d.y, d.r, d.color);
    if (nearTop) draw(d.x, d.y + size, d.r, d.color);
    if (nearBottom) draw(d.x, d.y - size, d.r, d.color);
  }

  noise(ctx, size, 0.015);
  return finishTile(canvas, repeatX, repeatY);
}

// Horizontal scalloped wave stripes in blush/coral - the second bedroom's print.
// Built from a single sine period per tile row, so it repeats cleanly.
export function getScallopWaveWallpaper(repeatX = 5, repeatY = 5) {
  const size = 128;
  const { canvas, ctx } = tileBase(size, '#f0e6de');

  const rows = 3;
  for (let r = 0; r < rows; r++) {
    const baseline = ((r + 0.5) / rows) * size;
    ctx.strokeStyle = r % 2 === 0 ? 'rgba(201,106,128,0.5)' : 'rgba(217,165,58,0.4)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (let x = 0; x <= size; x += 4) {
      const y = baseline + Math.sin((x / size) * Math.PI * 2) * (size / rows) * 0.28;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  noise(ctx, size, 0.015);
  return finishTile(canvas, repeatX, repeatY);
}

// Diamond lattice, sage on cream - kitchen accent wall. Simple crossed
// diagonal grid, tiles natively since the lines run edge-to-edge.
export function getDiamondLatticeWallpaper(repeatX = 6, repeatY = 6) {
  const size = 96;
  const { canvas, ctx } = tileBase(size, '#eee8da');

  ctx.strokeStyle = 'rgba(122,146,112,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, size / 2);
  ctx.lineTo(size / 2, 0);
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size, size / 2);
  ctx.moveTo(size, size / 2);
  ctx.lineTo(size / 2, size);
  ctx.moveTo(size / 2, size);
  ctx.lineTo(0, size / 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(217,114,86,0.35)';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 2.5, 0, Math.PI * 2);
  ctx.fill();

  noise(ctx, size, 0.02);
  return finishTile(canvas, repeatX, repeatY);
}

// Thin horizontal ripple lines, teal on cream - bathroom accent wall. Each
// line is one full sine period, so successive tiles align seamlessly.
export function getRippleWallpaper(repeatX = 4, repeatY = 8) {
  const size = 96;
  const { canvas, ctx } = tileBase(size, '#e9eeec');

  const rows = 4;
  for (let r = 0; r < rows; r++) {
    const baseline = ((r + 0.5) / rows) * size;
    ctx.strokeStyle = 'rgba(47,122,114,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= size; x += 4) {
      const y = baseline + Math.sin((x / size) * Math.PI * 2 + r) * 3;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  noise(ctx, size, 0.015);
  return finishTile(canvas, repeatX, repeatY);
}

export function getRugTexture(base: string, accent: string) {
  const size = 128;
  const { canvas, ctx } = makeCanvas(size);

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, size - 20, size - 20);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(20, 20, size - 40, size - 40);

  noise(ctx, size, 0.03);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
