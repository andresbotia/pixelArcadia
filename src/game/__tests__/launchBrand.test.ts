import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
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

describe('M17C.1 — Portal Mosaic icon replaces the legacy robot', () => {
  /** SHA-256 of the retired robot / legacy-navy icon files (pre-M17C.1 HEAD). */
  const LEGACY_ICON_HASHES = new Set([
    '35cf9c965e24524329ba0c2dc1572eb89da0564dc82f7caf769c011e5786c829', // icon.png, brand/icon-dark.png (robot)
    'a64d8b9185cd7f001a58b5cf194be397841df4e9582647937b0697c2219143b2', // brand/icon-light.png (robot)
    '96bea4e0072dbfaa6192eb4b8ae290e4a2d44046b069b6b73d38a3a5a7bc0e3d', // adaptive / android foreground (robot)
    'f6f69e50a01468bae0837e50f4bd354c232df6aae78bb20c66dbfab1f5ec7164', // android monochrome (robot)
    'b4af378efb5ce318c1c5cf0ff02d7bb190db6c7ab7340470aa3fabb0f7d9b241', // android background (#182055)
    '673124caac0a3e43a279dc388dd3281031d74e37ba433114acfcc46980556ea6', // splash-icon.png (robot + wordmark)
    'ca64f9b806b233e85adc8a371987683f01a60b37dd38b49bbb5d889c76e784c4', // favicon.png
    '9f239c19c7cef32b0dab38b3713b0da1b5290717f266b179379805e928fcad5e', // favicon-32.png
    '897c2c124d1095c8993b5a6e9b5af1843956be29260b64812092142570d23cd9', // favicon-16.png
    'a2bfca048d9599d95797bbd4cadf98216777c66ad39727a243775d0061542ff4', // public/favicon.png
    'ee8f8c69dccb4a69031c82c6965f1e96573697edb2b674be6f6764f4d82d7f76', // public/favicon-32.png
    'a894a08e2dd9540133d6456dafdd702cbf8b7795ad2d681eeb9873024f541d4e', // public/favicon-16.png
  ]);
  const ICON_FILES = [
    'assets/icon.png',
    'assets/brand/icon-light.png',
    'assets/brand/icon-dark.png',
    'assets/adaptive-icon.png',
    'assets/android-icon-foreground.png',
    'assets/android-icon-background.png',
    'assets/android-icon-monochrome.png',
    'assets/splash-icon.png',
    'assets/favicon.png',
    'assets/favicon-32.png',
    'assets/favicon-16.png',
    'public/favicon.png',
    'public/favicon-32.png',
    'public/favicon-16.png',
  ];

  it.each(ICON_FILES)('%s is not a legacy robot/navy asset', (rel) => {
    expect(LEGACY_ICON_HASHES.has(sha256(rel))).toBe(false);
  });

  it('ships a 1024×1024 RGB App Store icon with no alpha channel', () => {
    expect(app.icon).toBe('./assets/icon.png');
    expect(pngHeader('assets/icon.png')).toEqual({ width: 1024, height: 1024, colorType: 2 });
  });

  it('ships 1024×1024 Android adaptive layers (transparent foreground + monochrome)', () => {
    expect(pngHeader(app.android.adaptiveIcon.foregroundImage.replace('./', ''))).toEqual({ width: 1024, height: 1024, colorType: 6 });
    expect(pngHeader(app.android.adaptiveIcon.monochromeImage.replace('./', ''))).toEqual({ width: 1024, height: 1024, colorType: 6 });
    expect(pngHeader(app.android.adaptiveIcon.backgroundImage.replace('./', ''))).toMatchObject({ width: 1024, height: 1024 });
  });

  it('is generated by the Portal Mosaic script, and the robot generator is gone', () => {
    const gen = read('scripts/generate-brand-assets.mjs');
    expect(gen).toMatch(/Portal Mosaic/);
    for (const c of ['#FF4F8B', '#FFC53D', '#4FE3FF', '#3FD99A']) expect(gen).toContain(c);
    expect(() => statSync(join(repoRoot, 'scripts/generate-brand-assets.py'))).toThrow();
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
    expect(screen).toMatch(/openPrivacyPolicy\(Linking\.openURL\)/);
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

describe('M17C.1 — publishing unchanged', () => {
  it('keeps PUBLISHED_MAX_LEVEL at 50', () => {
    expect(PUBLISHED_MAX_LEVEL).toBe(50);
  });

  it("keeps CAMPAIGN_VERSION at 'v2-50'", () => {
    expect(CAMPAIGN_VERSION).toBe('v2-50');
  });
});
