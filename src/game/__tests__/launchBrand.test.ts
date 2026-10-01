import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { CAMPAIGN_VERSION, PUBLISHED_MAX_LEVEL } from '@/game/levels/publishing';
import { PRODUCT_NAME } from '@/theme/appIdentity';
import { BOOT_SPLASH } from '@/theme/bootSplash';

/**
 * M17C.1 final launch branding. Source/config/asset-header assertions only —
 * the Jest environment is plain Node (no RN renderer), matching brand.test.ts.
 */
const repoRoot = resolve(__dirname, '../../..');
const read = (rel: string) => readFileSync(join(repoRoot, rel), 'utf8');
const sha256 = (rel: string) => createHash('sha256').update(readFileSync(join(repoRoot, rel))).digest('hex');

const LAUNCH_BLUE = '#3B63E8';

interface AppJson {
  expo: {
    name: string;
    backgroundColor: string;
    icon: string;
    ios: { bundleIdentifier: string };
    android: { package: string; adaptiveIcon: { backgroundColor: string; foregroundImage: string; backgroundImage: string; monochromeImage: string } };
    web: { name: string; themeColor: string; backgroundColor: string; favicon: string };
    plugins: unknown[];
  };
}
const app = (JSON.parse(read('app.json')) as AppJson).expo;

function walk(rel: string, ext: RegExp): string[] {
  const out: string[] = [];
  for (const name of readdirSync(join(repoRoot, rel))) {
    const child = `${rel}/${name}`;
    if (name === '__tests__' || name === 'node_modules') continue;
    if (statSync(join(repoRoot, child)).isDirectory()) out.push(...walk(child, ext));
    else if (ext.test(name)) out.push(child);
  }
  return out;
}

/** Code with comments removed, so only strings/JSX a player could see remain. */
function withoutComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/** PNG IHDR: width, height, colour type (2 = RGB, 6 = RGBA). */
function pngHeader(rel: string): { width: number; height: number; colorType: number } {
  const buf = readFileSync(join(repoRoot, rel));
  expect(buf.subarray(12, 16).toString('ascii')).toBe('IHDR');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), colorType: buf.readUInt8(25) };
}

describe('M17C.1 — product name', () => {
  it('shows "Pixel Arcadia" as the display name everywhere', () => {
    expect(app.name).toBe('Pixel Arcadia');
    expect(app.web.name).toBe('Pixel Arcadia');
    expect(PRODUCT_NAME).toBe('Pixel Arcadia');
  });

  it('has no user-facing "Orbitide" in any screen, component or route', () => {
    const ui = [...walk('src', /\.tsx$/), ...walk('app', /\.tsx$/)];
    expect(ui.length).toBeGreaterThan(50);
    const hits = ui.filter((rel) => /orbitide/i.test(withoutComments(read(rel))));
    expect(hits).toEqual([]);
  });

  it('keeps the internal technical identifiers untouched', () => {
    expect(app.ios.bundleIdentifier).toBe('com.andresbotia.orbitide');
    expect(app.android.package).toBe('com.andresbotia.orbitide');
    expect(read('src/storage/progress.ts')).toMatch(/'orbitide\/progress\/v1'/);
  });
});

describe('M17D.0 — final launch icon (supersedes M17C.1 Portal Mosaic)', () => {
  /** The approved artwork, checked in byte-for-byte. */
  const SOURCE = 'assets/brand/app-icon-source.png';
  const SOURCE_SHA256 = 'f4ce33a3d87fa4868d0097fb332aa930ac19ff156ccf04c97fa2fde2821a4225';

  /** SHA-256 of retired icon files: the robot / legacy navy set (pre-M17C.1) and Portal Mosaic (M17C.1). */
  const RETIRED_ICON_HASHES = new Set([
    '35cf9c965e24524329ba0c2dc1572eb89da0564dc82f7caf769c011e5786c829', // robot icon.png, brand/icon-dark.png
    'a64d8b9185cd7f001a58b5cf194be397841df4e9582647937b0697c2219143b2', // robot brand/icon-light.png
    '96bea4e0072dbfaa6192eb4b8ae290e4a2d44046b069b6b73d38a3a5a7bc0e3d', // robot adaptive / android foreground
    'f6f69e50a01468bae0837e50f4bd354c232df6aae78bb20c66dbfab1f5ec7164', // robot android monochrome
    'b4af378efb5ce318c1c5cf0ff02d7bb190db6c7ab7340470aa3fabb0f7d9b241', // android background (#182055)
    '673124caac0a3e43a279dc388dd3281031d74e37ba433114acfcc46980556ea6', // robot splash-icon.png
    'ca64f9b806b233e85adc8a371987683f01a60b37dd38b49bbb5d889c76e784c4', // robot favicon.png
    '9f239c19c7cef32b0dab38b3713b0da1b5290717f266b179379805e928fcad5e', // robot favicon-32.png
    '897c2c124d1095c8993b5a6e9b5af1843956be29260b64812092142570d23cd9', // robot favicon-16.png
    'a2bfca048d9599d95797bbd4cadf98216777c66ad39727a243775d0061542ff4', // robot public/favicon.png
    'ee8f8c69dccb4a69031c82c6965f1e96573697edb2b674be6f6764f4d82d7f76', // robot public/favicon-32.png
    'a894a08e2dd9540133d6456dafdd702cbf8b7795ad2d681eeb9873024f541d4e', // robot public/favicon-16.png
    'cb432bf78f49c602b09c507e43837b94d06b26ec1a003fb18ff2df59baa23df6', // Portal Mosaic icon.png, brand/icon-light.png
    '0b03b51dbab5f0e5f01ad281462890f150f866012e684d3fc4fe012948ef573c', // Portal Mosaic brand/icon-dark.png
    '6c10c56c120a901b2e2de7026a590f56271f871def5bd9cf768e9b4c038b9930', // Portal Mosaic adaptive / android foreground
    '8387ce0eb85978bf620cbd10ee9d3afabea936f16702b9d6957e49ad6967f96c', // Portal Mosaic android background
    '087565a5908502be6cff009467834f370914bb39b7c15317ce029c7cae3fb54e', // Portal Mosaic android monochrome
    '1bb6ddbf1081b6bf0b1209fd00cc1cd3c36a2ec68223dd317e9abea3ffc5a2e3', // Portal Mosaic splash-icon.png
    '121ea4e81f340b1fcd0c0d7b75af7063ebbb3c0664d9cfb16b718e1e04107c68', // Portal Mosaic favicon.png (assets + public)
    '25ed7fa86908b9bae11251030b165129c7769af22f227ce2f9ee9410a74f2b3f', // Portal Mosaic favicon-32.png
    '9acb357659832414282497a6bc1b5c5a50c1d0be0a28e76c88c2b032140c5402', // Portal Mosaic favicon-16.png
  ]);
  /** Everything the generator writes. */
  const GENERATED = [
    'assets/icon.png',
    'assets/adaptive-icon.png',
    'assets/android-icon-foreground.png',
    'assets/android-icon-background.png',
    'assets/android-icon-monochrome.png',
    'assets/favicon.png',
    'assets/favicon-32.png',
    'assets/favicon-16.png',
    'public/favicon.png',
    'public/favicon-32.png',
    'public/favicon-16.png',
    'public/apple-touch-icon.png',
  ];

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PNG } = require('pngjs') as { PNG: { sync: { read(buf: Buffer): { width: number; height: number; data: Buffer } } } };
  const decode = (rel: string) => PNG.sync.read(readFileSync(join(repoRoot, rel)));

  it('keeps one canonical 1024×1024 opaque source: the approved artwork, unaltered', () => {
    expect(sha256(SOURCE)).toBe(SOURCE_SHA256);
    const src = decode(SOURCE);
    expect([src.width, src.height]).toEqual([1024, 1024]);
    for (let i = 3; i < src.data.length; i += 4) if (src.data[i] !== 255) throw new Error(`transparent source pixel at ${(i - 3) / 4}`);
  });

  it('ships the source pixels as a 1024×1024 RGB App Store icon with no alpha channel', () => {
    expect(app.icon).toBe('./assets/icon.png');
    expect(pngHeader('assets/icon.png')).toEqual({ width: 1024, height: 1024, colorType: 2 });
    const icon = decode('assets/icon.png').data;
    const src = decode(SOURCE).data;
    expect(icon.equals(src)).toBe(true); // pngjs decodes RGB as opaque RGBA: identical pixels, no recolour/crop
  });

  it('wires Android adaptive layers and the favicon to the generated files', () => {
    const a = app.android.adaptiveIcon;
    expect(a).toEqual({
      backgroundColor: LAUNCH_BLUE,
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    });
    expect(pngHeader('assets/android-icon-foreground.png')).toEqual({ width: 1024, height: 1024, colorType: 6 });
    expect(pngHeader('assets/android-icon-monochrome.png')).toEqual({ width: 1024, height: 1024, colorType: 6 });
    expect(pngHeader('assets/android-icon-background.png')).toMatchObject({ width: 1024, height: 1024 });
    expect(app.web.favicon).toBe('./assets/favicon.png');
    expect(read('app/+html.tsx')).toMatch(/rel="apple-touch-icon" href="\/apple-touch-icon\.png"/);
  });

  it('regenerates every icon output byte-for-byte from the source (deterministic, in sync)', () => {
    const outDir = mkdtempSync(join(tmpdir(), 'pa-brand-'));
    try {
      for (let run = 0; run < 2; run++) {
        const res = spawnSync(process.execPath, ['scripts/generate-brand-assets.mjs', '--out', outDir], { cwd: repoRoot, encoding: 'utf8' });
        expect(res.status).toBe(0);
        for (const rel of GENERATED) {
          expect(`${rel} ${createHash('sha256').update(readFileSync(join(outDir, rel))).digest('hex')}`).toBe(`${rel} ${sha256(rel)}`);
        }
      }
    } finally {
      rmSync(outDir, { recursive: true, force: true });
    }
  }, 60_000);

  it.each(GENERATED)('%s is not a retired robot / Portal Mosaic asset', (rel) => {
    expect(RETIRED_ICON_HASHES.has(sha256(rel))).toBe(false);
  });

  it('retires the Portal Mosaic generator and its stale outputs', () => {
    const gen = read('scripts/generate-brand-assets.mjs');
    expect(gen).toContain(SOURCE);
    expect(gen).not.toMatch(/function drawMark|const TILES|#FF4F8B|#3FD99A/); // no procedural mosaic left
    expect(() => statSync(join(repoRoot, 'scripts/generate-brand-assets.py'))).toThrow();
    for (const rel of [
      'assets/splash-icon.png', 'assets/brand/icon-light.png', 'assets/brand/icon-dark.png',
      'assets/brand/logo-mark.svg', 'assets/brand/logo-mark-full.svg',
      'assets/brand/logo-mark-mono-light.svg', 'assets/brand/logo-mark-mono-dark.svg',
    ]) {
      expect(() => statSync(join(repoRoot, rel))).toThrow();
    }
  });
});

describe('M17C.1 — launch colours', () => {
  const splash = app.plugins.find(
    (p): p is [string, { backgroundColor: string; imageWidth: number }] => Array.isArray(p) && p[0] === 'expo-splash-screen',
  );

  it('keeps launch blue #3B63E8 for native splash, root view and loader base', () => {
    expect(BOOT_SPLASH.background).toBe(LAUNCH_BLUE);
    expect(app.backgroundColor).toBe(LAUNCH_BLUE);
    expect(splash?.[1].backgroundColor).toBe(LAUNCH_BLUE);
    expect(splash?.[1].imageWidth).toBe(280);
  });

  it('no longer uses the legacy #182055 Android icon plate', () => {
    expect(app.android.adaptiveIcon.backgroundColor).toBe(LAUNCH_BLUE);
    expect(read('app.json')).not.toMatch(/#182055/i);
  });

  it('has no violet (#5236C8) in the startup loader gradient', () => {
    expect(BOOT_SPLASH.gradient).not.toContain('#5236C8');
    expect(BOOT_SPLASH.gradient).toEqual(['#5C8CFF', '#3B63E8', '#2450CC']);
  });

  it('uses launch blue for web theme/background colours', () => {
    expect(app.web.themeColor).toBe(LAUNCH_BLUE);
    expect(app.web.backgroundColor).toBe(LAUNCH_BLUE);
    const html = read('app/+html.tsx');
    expect(html).toMatch(/name="theme-color" content="#3B63E8"/);
    expect(html).not.toMatch(/#0E1442/i);
    expect(read('app.json')).not.toMatch(/#0E1442/i);
  });
});

describe('M17C.1 — real Settings screen', () => {
  const screen = read('src/screens/SettingsScreen.tsx');

  it('removes the placeholder screen and copy', () => {
    expect(() => statSync(join(repoRoot, 'src/screens/SettingsPlaceholderScreen.tsx'))).toThrow();
    const sources = [...walk('src', /\.tsx?$/), ...walk('app', /\.tsx?$/)];
    const hits = sources.filter((rel) => /Nothing is wired yet|Settings will live here/.test(read(rel)));
    expect(hits).toEqual([]);
  });

  it('routes /settings to the real screen', () => {
    expect(read('app/settings.tsx')).toMatch(/<SettingsScreen onBack=/);
  });

  it('renders working controls: Color Assist, Restore Purchases and the app version', () => {
    expect(screen).toMatch(/useColorAssist\(\)/);
    expect(screen).toMatch(/<Switch[\s\S]*?value=\{colorAssist\.enabled\}[\s\S]*?onValueChange=\{colorAssist\.setEnabled\}/);
    expect(screen).toMatch(/useRestorePurchases\(\)/);
    expect(screen).toMatch(/onPress=\{\(\) => void restore\.restore\(\)\}/);
    expect(screen).toMatch(/nativeApplicationVersion/);
    expect(screen).toMatch(/accessibilityRole="header">SETTINGS</);
  });

  it('shows only the real Privacy Policy link and required UMP choices', () => {
    expect(screen).not.toMatch(/https?:\/\//);
    expect(screen).toMatch(/openPrivacyPolicy\(Linking,/);
    expect(screen).toMatch(/accessibilityLabel="Privacy Policy"/);
    expect(screen).toMatch(/privacyOptionsRequired \?/);
    expect(screen).toMatch(/accessibilityLabel="Ad Privacy Choices"/);
    expect(screen).not.toMatch(/accessibilityLabel="Terms"|accessibilityLabel="Support"/);
  });

  it('restores through the central IAP controller only (no RevenueCat in UI)', () => {
    const hook = read('src/hooks/useRestorePurchases.ts');
    expect(hook).toMatch(/usePurchases\(\)/);
    for (const src of [hook, screen]) expect(src).not.toMatch(/react-native-purchases/);
    expect(read('src/screens/StoreScreen.tsx')).toMatch(/useRestorePurchases\(\)/);
  });

  it('uses only Rubik (AV_FONT) — no system-font weights, no Space Grotesk', () => {
    expect(screen).toMatch(/AV_FONT\./);
    expect(screen).not.toMatch(/fontWeight/);
    expect(screen).not.toMatch(/SpaceGrotesk/);
  });
});

describe('M17C.1 — typography + CTA cleanup', () => {
  it('moves the corrected labels onto Rubik', () => {
    expect(read('src/components/brand/PrimaryCta.tsx')).toMatch(/label: \{ fontFamily: AV_FONT\.black,/);
    expect(read('src/components/difficulty/DifficultyGate.tsx')).toMatch(/label: \{ fontFamily: AV_FONT\.extraBold,/);
    const bomb = read('src/components/gameplay/BombTargetingOverlay.tsx');
    const banner = /bannerText: \{([\s\S]*?)\}/.exec(bomb)?.[1] ?? '';
    expect(banner).toMatch(/\.\.\.GP_TYPE\.label/); // GP_TYPE.label = Rubik 700
    expect(withoutComments(banner)).not.toMatch(/fontWeight/);
  });

  it('draws PrimaryCta with the v2 gold ramp, not the legacy amber/navy brand gradients', () => {
    const cta = read('src/components/brand/PrimaryCta.tsx');
    expect(cta).toMatch(/\[AV\.goldLight, AV\.gold, AV\.goldDeep\]/);
    expect(cta).toMatch(/AV\.goldInk/);
    expect(cta).toMatch(/AV\.goldLip/);
    expect(cta).not.toMatch(/BrandGradientView|brandGradient|brandInk|brandColor|#FF8A1F/);
  });

  it('does not load Space Grotesk, and nothing rendered depends on it', () => {
    expect(read('app/_layout.tsx')).not.toMatch(/space-grotesk|SpaceGrotesk/);
    // The only Space Grotesk consumers are the unrendered legacy lockups.
    const renderers = [...walk('src', /\.tsx$/), ...walk('app', /\.tsx$/)]
      .filter((rel) => !rel.startsWith('src/components/brand/'))
      .filter((rel) => /PixelArcadiaWordmark|BrandLockup|SpaceGrotesk/.test(withoutComments(read(rel))));
    expect(renderers).toEqual([]);
  });
});

describe('v1 launch campaign publishing', () => {
  it('publishes all 500 levels', () => {
    expect(PUBLISHED_MAX_LEVEL).toBe(500);
  });

  it("identifies the v1 launch campaign", () => {
    expect(CAMPAIGN_VERSION).toBe('v1-500');
  });
});
