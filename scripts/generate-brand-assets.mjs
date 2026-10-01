/**
 * Pixel Arcadia raster brand assets — M17D.0 final launch icon.
 *
 * ONE canonical source: `assets/brand/app-icon-source.png`, the approved
 * 1024×1024 artwork, checked in byte-for-byte. Every app-icon / favicon file
 * below is DERIVED from it by technical processing only — resampling,
 * flattening, insetting and (Android 13) a luminance silhouette. The artwork is
 * never redrawn, recoloured or re-cropped. Resampling uses CanvasKit (already
 * installed via @shopify/react-native-skia) and PNGs are written with pngjs
 * (via @expo/image-utils), so there is no new dependency and output is
 * byte-reproducible:
 *
 *   node scripts/generate-brand-assets.mjs              # writes into the repo
 *   node scripts/generate-brand-assets.mjs --out <dir>  # same tree under <dir> (tests)
 *
 * Supersedes the M17C.1 "Portal Mosaic" procedural icon (and the retired
 * Python robot generator before it). Outputs:
 *
 *   assets/icon.png                    1024  RGB opaque  App Store / iOS icon: the source pixels, alpha dropped, metadata stripped
 *   assets/android-icon-foreground.png 1024  RGBA        adaptive foreground: whole artwork inset to the 72/108 viewport, edges bled for parallax
 *   assets/adaptive-icon.png           1024  RGBA        same (legacy filename kept)
 *   assets/android-icon-background.png 1024  RGB opaque  launch blue #3B63E8 (hidden behind the opaque foreground)
 *   assets/android-icon-monochrome.png 1024  RGBA        white silhouette of the head/ears/eyes (Android 13 themed icon)
 *   assets/favicon.png, favicon-32.png, favicon-16.png   64/32/16 downscales of the artwork
 *   public/favicon.png, favicon-32.png, favicon-16.png   same, for manual <link> use
 *   public/apple-touch-icon.png        180   RGB opaque  web home-screen icon
 */
import { Buffer } from 'node:buffer';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const CanvasKitInit = require('canvaskit-wasm');
const { PNG } = require('pngjs');

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const outFlag = process.argv.indexOf('--out');
const OUT = outFlag > 0 ? resolve(process.argv[outFlag + 1]) : REPO;

const SOURCE = 'assets/brand/app-icon-source.png';
const SIZE = 1024;
/** Launch blue (src/theme/bootSplash.ts) — the existing icon background colour. */
const LAUNCH_BLUE = '#3B63E8';
/** Adaptive icons: 108dp layer, 72dp visible viewport → the artwork fills exactly the viewport. */
const ADAPTIVE_SCALE = 72 / 108;
/** Monochrome silhouette: sRGB luminance ramp separating the white head + bright eyes from the blue field / navy visor. */
const MONO_LO = 0.55;
const MONO_HI = 0.7;

// ── Source ───────────────────────────────────────────────────────────────
const source = PNG.sync.read(readFileSync(join(REPO, SOURCE)));
if (source.width !== SIZE || source.height !== SIZE) throw new Error(`${SOURCE} must be ${SIZE}×${SIZE}`);
for (let i = 3; i < source.data.length; i += 4) {
  if (source.data[i] !== 255) throw new Error(`${SOURCE} must be fully opaque (App Store icons cannot carry transparency)`);
}

const CK = await CanvasKitInit();
const IMAGE_INFO = {
  width: SIZE,
  height: SIZE,
  alphaType: CK.AlphaType.Unpremul,
  colorType: CK.ColorType.RGBA_8888,
  colorSpace: CK.ColorSpace.SRGB,
};
const art = CK.MakeImage(IMAGE_INFO, source.data, SIZE * 4);

/** White pixels whose alpha is the artwork's bright (head / ears / eyes) mask. */
function silhouetteImage() {
  const mask = Buffer.alloc(source.data.length);
  for (let i = 0; i < source.data.length; i += 4) {
    const l = (0.2126 * source.data[i] + 0.7152 * source.data[i + 1] + 0.0722 * source.data[i + 2]) / 255;
    const t = Math.min(1, Math.max(0, (l - MONO_LO) / (MONO_HI - MONO_LO)));
    mask[i] = mask[i + 1] = mask[i + 2] = 255;
    mask[i + 3] = Math.round(255 * t * t * (3 - 2 * t));
  }
  return CK.MakeImage(IMAGE_INFO, mask, SIZE * 4);
}

// ── Rendering ────────────────────────────────────────────────────────────
function encode(pixels, size, opaque) {
  const png = new PNG({ width: size, height: size, colorType: opaque ? 2 : 6, inputHasAlpha: true });
  png.data = Buffer.from(pixels);
  return PNG.sync.write(png, { colorType: opaque ? 2 : 6, inputHasAlpha: true });
}

/** Render at `size` px; `draw(canvas)` works in 1024 units. */
function render(size, draw, { opaque }) {
  const surface = CK.MakeSurface(size, size);
  const canvas = surface.getCanvas();
  canvas.clear(CK.TRANSPARENT);
  canvas.scale(size / SIZE, size / SIZE);
  draw(canvas);
  surface.flush();
  const pixels = surface.makeImageSnapshot().readPixels(0, 0, { ...IMAGE_INFO, width: size, height: size });
  surface.delete();
  return encode(pixels, size, opaque);
}

const fullRect = CK.XYWHRect(0, 0, SIZE, SIZE);
const filtered = () => {
  const p = new CK.Paint();
  p.setAntiAlias(true);
  return p;
};

/** The artwork, resampled to fill the canvas (favicons, touch icon). */
function drawArt(canvas) {
  canvas.drawImageRectOptions(art, fullRect, fullRect, CK.FilterMode.Linear, CK.MipmapMode.Linear, filtered());
}

/** `image` scaled about the centre; `bleed` clamps its edge pixels outward to fill the rest. */
function drawInset(canvas, image, scale, bleed) {
  const off = (SIZE * (1 - scale)) / 2;
  if (bleed) {
    const local = CK.Matrix.multiply(CK.Matrix.translated(off, off), CK.Matrix.scaled(scale, scale));
    const p = filtered();
    p.setShader(image.makeShaderOptions(CK.TileMode.Clamp, CK.TileMode.Clamp, CK.FilterMode.Linear, CK.MipmapMode.Linear, local));
    canvas.drawRect(fullRect, p);
  } else {
    const dst = CK.XYWHRect(off, off, SIZE * scale, SIZE * scale);
    canvas.drawImageRectOptions(image, fullRect, dst, CK.FilterMode.Linear, CK.MipmapMode.Linear, filtered());
  }
}

function out(rel, buf) {
  const path = join(OUT, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, buf);
  console.log(`wrote ${rel}`);
}

// iOS / App Store: the approved pixels exactly, without the (all-opaque) alpha
// channel or the source's colour-profile chunk. Apple applies the mask.
out('assets/icon.png', encode(source.data, SIZE, true));

// Android adaptive. The art cannot be split into layers without repainting it,
// so the whole artwork is the foreground, sized to the 72dp viewport (every
// launcher mask sits inside it; the face is well within the 66dp safe circle).
// Its edge pixels are clamped outward so launcher parallax never reveals a seam.
const foreground = render(SIZE, (c) => drawInset(c, art, ADAPTIVE_SCALE, true), { opaque: false });
out('assets/android-icon-foreground.png', foreground);
out('assets/adaptive-icon.png', foreground);
out('assets/android-icon-background.png', render(SIZE, (c) => {
  const p = new CK.Paint();
  p.setColor(CK.parseColorString(LAUNCH_BLUE));
  c.drawRect(fullRect, p);
}, { opaque: true }));
const silhouette = silhouetteImage();
out('assets/android-icon-monochrome.png', render(SIZE, (c) => drawInset(c, silhouette, ADAPTIVE_SCALE, false), { opaque: false }));

// Web.
for (const [name, size] of [['favicon.png', 64], ['favicon-32.png', 32], ['favicon-16.png', 16]]) {
  const buf = render(size, drawArt, { opaque: true });
  out(`assets/${name}`, buf);
  out(`public/${name}`, buf);
}
out('public/apple-touch-icon.png', render(180, drawArt, { opaque: true }));
