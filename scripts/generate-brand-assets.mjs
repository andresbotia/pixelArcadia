/**
 * Pixel Arcadia raster brand assets — M17C.1 "Portal Mosaic" icon.
 *
 * A stepped white arcade arch (the portal) framing a 2×2 pixel mosaic —
 * pink, gold, cyan, mint — over a warm gold halo, on the launch-blue field.
 * No text, no mascot. Drawn procedurally with CanvasKit (already installed via
 * @shopify/react-native-skia) and written with pngjs (via @expo/image-utils),
 * so no new dependency and the output is reproducible:
 *
 *   node scripts/generate-brand-assets.mjs
 *
 * Replaces the retired Python "Pixel Pal mascot" generator (generate-brand-assets.py). Outputs:
 *
 *   assets/icon.png                    1024  RGB opaque  App Store / iOS icon (no alpha channel)
 *   assets/brand/icon-light.png        1024  RGB opaque  marketing copy of icon.png
 *   assets/brand/icon-dark.png         1024  RGB opaque  marketing variant on the deep-blue well
 *   assets/android-icon-foreground.png 1024  RGBA        adaptive foreground, art inside the safe zone
 *   assets/adaptive-icon.png           1024  RGBA        same (legacy filename kept)
 *   assets/android-icon-background.png 1024  RGB opaque  launch-blue field
 *   assets/android-icon-monochrome.png 1024  RGBA        white silhouette (Android 13 themed icon)
 *   assets/splash-icon.png             1024  RGBA        the mark on transparent (not wired to config)
 *   assets/favicon.png, favicon-32.png, favicon-16.png   simplified mark (no halo / lips)
 *   public/favicon.png, favicon-32.png, favicon-16.png   same, for manual <link> use
 *   assets/brand/logo-mark.svg, logo-mark-full.svg, logo-mark-mono-light.svg, logo-mark-mono-dark.svg
 *
 * Colours are the v2 `AV` tokens (src/theme/arcadiaV2.ts) and the launch blue
 * (src/theme/bootSplash.ts). Geometry is in 1024 master units.
 */
import { Buffer } from 'node:buffer';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const CanvasKitInit = require('canvaskit-wasm');
const { PNG } = require('pngjs');

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = join(REPO, 'assets');
const PUBLIC = join(REPO, 'public');

// ── Palette ──────────────────────────────────────────────────────────────
const FIELD = ['#5C8CFF', '#3B63E8', '#2450CC']; // badgeTop → launch blue → badgeBottom
const FIELD_DARK = ['#1B3478', '#10245B', '#0A1A45']; // AV.well family
const FIELD_GLOW = '#9FD0FF'; // BOOT_SPLASH.glow
const WHITE = '#FFFFFF';
const ARCH_LIP = '#AFC5F5'; // AV.plateLip
const SHADOW = '#10245B'; // AV.well
const HALO = '#FFF3C4'; // AV.goldGlint — pale gold lifts the field without greying it
const TILES = [
  { face: '#FF4F8B', lip: '#D62D68' }, // heartBottom / heartLip
  { face: '#FFC53D', lip: '#D98500' }, // gold / goldLip
  { face: '#4FE3FF', lip: '#1FA7C9' }, // cyan
  { face: '#3FD99A', lip: '#1FAE74' }, // mint / mintLip
];

// ── Geometry (1024 master) ──────────────────────────────────────────────
/** Stepped arch: keystone, shoulders, upper posts, pillars. [x, y, w, h] */
const ARCH = [
  [400, 136, 224, 96],
  [232, 200, 176, 96],
  [616, 200, 176, 96],
  [168, 296, 128, 160],
  [728, 296, 128, 160],
  [152, 456, 128, 416],
  [744, 456, 128, 416],
];
const ARCH_R = 18;
const ARCH_LIP_Y = 22;
const TILE = 152;
const TILE_GAP = 16;
const TILE_R = 28;
const TILE_LIP_Y = 14;
const MOSAIC_X = 352;
const MOSAIC_Y = 424;
const tileRects = TILES.map((_, i) => [
  MOSAIC_X + (i % 2) * (TILE + TILE_GAP),
  MOSAIC_Y + Math.floor(i / 2) * (TILE + TILE_GAP),
  TILE,
  TILE,
]);
/** Bounding box of the drawn mark (arch + lips), for re-centering in the adaptive safe zone. */
const MARK_BOX = { x: 152, y: 136, w: 720, h: 736 + ARCH_LIP_Y };

const CK = await CanvasKitInit();

function color(hex, alpha = 1) {
  const c = CK.parseColorString(hex);
  c[3] = alpha;
  return c;
}

function paint(hex, alpha = 1, blurSigma = 0) {
  const p = new CK.Paint();
  p.setAntiAlias(true);
  p.setColor(color(hex, alpha));
  if (blurSigma > 0) p.setMaskFilter(CK.MaskFilter.MakeBlur(CK.BlurStyle.Normal, blurSigma, true));
  return p;
}

function rrect(canvas, [x, y, w, h], r, p) {
  canvas.drawRRect(CK.RRectXY(CK.XYWHRect(x, y, w, h), r, r), p);
}

function drawField(canvas, stops, rounded) {
  const p = new CK.Paint();
  p.setAntiAlias(true);
  p.setShader(CK.Shader.MakeLinearGradient([0, 0], [0, 1024], stops.map((s) => color(s)), [0, 0.55, 1], CK.TileMode.Clamp));
  if (rounded) rrect(canvas, [0, 0, 1024, 1024], 230, p);
  else canvas.drawRect(CK.XYWHRect(0, 0, 1024, 1024), p);
  const glow = new CK.Paint();
  glow.setAntiAlias(true);
  glow.setShader(CK.Shader.MakeRadialGradient([512, 470], 540, [color(FIELD_GLOW, 0.45), color(FIELD_GLOW, 0)], [0, 1], CK.TileMode.Clamp));
  if (rounded) rrect(canvas, [0, 0, 1024, 1024], 230, glow);
  else canvas.drawRect(CK.XYWHRect(0, 0, 1024, 1024), glow);
}

/** Full mark: halo, shadowed/lipped arch, recessed well, lipped mosaic tiles. */
function drawMark(canvas, { detail = true } = {}) {
  if (detail) {
    // Halo first so it only lifts the field, never tints the white arch.
    const halo = new CK.Paint();
    halo.setAntiAlias(true);
    halo.setShader(CK.Shader.MakeRadialGradient([512, 584], 340, [color(HALO, 0.55), color(HALO, 0.18), color(HALO, 0)], [0, 0.55, 1], CK.TileMode.Clamp));
    canvas.drawCircle(512, 584, 340, halo);
    const shadow = paint(SHADOW, 0.3, 18);
    for (const b of ARCH) rrect(canvas, [b[0], b[1] + 40, b[2], b[3]], ARCH_R, shadow);
    const lip = paint(ARCH_LIP);
    for (const b of ARCH) rrect(canvas, [b[0], b[1] + ARCH_LIP_Y, b[2], b[3]], ARCH_R, lip);
  }
  const face = paint(WHITE);
  for (const b of ARCH) rrect(canvas, b, ARCH_R, face);

  if (detail) {
    rrect(canvas, [MOSAIC_X - 4, MOSAIC_Y + 20, 2 * TILE + TILE_GAP + 8, 2 * TILE + TILE_GAP + 8], 40, paint(SHADOW, 0.28, 14));
  }
  tileRects.forEach((r, i) => {
    if (detail) rrect(canvas, [r[0], r[1] + TILE_LIP_Y, r[2], r[3]], TILE_R, paint(TILES[i].lip));
    rrect(canvas, r, TILE_R, paint(TILES[i].face));
    if (detail) rrect(canvas, [r[0] + 24, r[1] + 24, 40, 28], 8, paint(WHITE, 0.8));
  });
}

/** Flat single-colour silhouette (monochrome / themed icons). */
function drawSilhouette(canvas) {
  const p = paint(WHITE);
  for (const b of ARCH) rrect(canvas, b, ARCH_R, p);
  for (const r of tileRects) rrect(canvas, r, TILE_R, p);
}

/**
 * Render at `size` px. `draw(canvas)` works in 1024 units; `inset` scales the
 * art about the centre (1 = full bleed) for the adaptive-icon safe zone.
 */
function render(size, draw, { opaque, inset = 1 } = {}) {
  const surface = CK.MakeSurface(size, size);
  const canvas = surface.getCanvas();
  canvas.clear(CK.TRANSPARENT);
  canvas.scale(size / 1024, size / 1024);
  if (inset !== 1) {
    // centre the mark's own bounding box, then scale it into the safe zone
    const cx = MARK_BOX.x + MARK_BOX.w / 2;
    const cy = MARK_BOX.y + MARK_BOX.h / 2;
    canvas.translate(512, 512);
    canvas.scale(inset, inset);
    canvas.translate(-cx, -cy);
  }
  draw(canvas);
  surface.flush();
  const pixels = surface.makeImageSnapshot().readPixels(0, 0, {
    width: size,
    height: size,
    colorType: CK.ColorType.RGBA_8888,
    alphaType: CK.AlphaType.Unpremul,
    colorSpace: CK.ColorSpace.SRGB,
  });
  surface.delete();
  const png = new PNG({ width: size, height: size, colorType: opaque ? 2 : 6, inputHasAlpha: true });
  png.data = Buffer.from(pixels);
  return PNG.sync.write(png, { colorType: opaque ? 2 : 6, inputHasAlpha: true });
}

function out(path, buf) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, buf);
  console.log(`wrote ${path.replace(REPO + '/', '')}`);
}

// Adaptive icons: 108dp canvas, 66dp safe circle ≈ 61% — keep the mark's box within ~60%.
const ADAPTIVE_INSET = 0.6;

const icon = render(1024, (c) => { drawField(c, FIELD, false); drawMark(c); }, { opaque: true });
out(join(ASSETS, 'icon.png'), icon);
out(join(ASSETS, 'brand/icon-light.png'), icon);
out(join(ASSETS, 'brand/icon-dark.png'), render(1024, (c) => { drawField(c, FIELD_DARK, false); drawMark(c); }, { opaque: true }));

const foreground = render(1024, (c) => drawMark(c), { opaque: false, inset: ADAPTIVE_INSET });
out(join(ASSETS, 'android-icon-foreground.png'), foreground);
out(join(ASSETS, 'adaptive-icon.png'), foreground);
out(join(ASSETS, 'android-icon-background.png'), render(1024, (c) => drawField(c, FIELD, false), { opaque: true }));
out(join(ASSETS, 'android-icon-monochrome.png'), render(1024, (c) => drawSilhouette(c), { opaque: false, inset: ADAPTIVE_INSET }));
out(join(ASSETS, 'splash-icon.png'), render(1024, (c) => drawMark(c), { opaque: false, inset: 0.8 }));

// ── Vector marks (assets/brand/logo-mark*.svg, 120-unit viewBox, no filters/rasters) ──
const V = 120 / 1024;
const n = (v) => +(v * V).toFixed(2);
function svgRect([x, y, w, h], r, fill) {
  return `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(r)}"${fill ? ` fill="${fill}"` : ''}/>`;
}
function markSvg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Pixel Arcadia">\n${body}\n</svg>\n`;
}
const fullMarkSvg = markSvg([
  `  <g fill="${ARCH_LIP}">${ARCH.map((b) => svgRect([b[0], b[1] + ARCH_LIP_Y, b[2], b[3]], ARCH_R)).join('')}</g>`,
  `  <g fill="${WHITE}">${ARCH.map((b) => svgRect(b, ARCH_R)).join('')}</g>`,
  `  ${tileRects.map((r, i) => svgRect([r[0], r[1] + TILE_LIP_Y, r[2], r[3]], TILE_R, TILES[i].lip) + svgRect(r, TILE_R, TILES[i].face)).join('')}`,
].join('\n'));
const monoSvg = (ink) => markSvg(`  <g fill="${ink}">${[...ARCH.map((b) => svgRect(b, ARCH_R)), ...tileRects.map((r) => svgRect(r, TILE_R))].join('')}</g>`);
out(join(ASSETS, 'brand/logo-mark.svg'), fullMarkSvg);
out(join(ASSETS, 'brand/logo-mark-full.svg'), fullMarkSvg);
out(join(ASSETS, 'brand/logo-mark-mono-light.svg'), monoSvg('#17306E')); // AV.ink, for light backgrounds
out(join(ASSETS, 'brand/logo-mark-mono-dark.svg'), monoSvg(WHITE)); // for dark backgrounds

for (const [name, size] of [['favicon.png', 64], ['favicon-32.png', 32], ['favicon-16.png', 16]]) {
  const buf = render(size, (c) => { drawField(c, FIELD, true); drawMark(c, { detail: false }); }, { opaque: false });
  out(join(ASSETS, name), buf);
  out(join(PUBLIC, name), buf);
}
