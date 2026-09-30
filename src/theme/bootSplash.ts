/**
 * Launch presentation tokens (M10), shared by the NATIVE splash (`app.json` →
 * `expo-splash-screen`) and the app-layer `BootSplash` that replaces it on the
 * first JS frame. The hand-off is only invisible if both draw the same thing
 * at the same place, so the values the native side needs live here and a unit
 * test pins `app.json` to them:
 *
 *  - `background`: native splash colour, app root colour, and the loader's
 *    base fill / gradient midpoint (where the logo sits).
 *  - `logoWidth`: the plugin's `imageWidth` (pt). The native storyboard
 *    centres a `logoWidth` square on screen and aspect-fits the logo into it;
 *    `BootSplash` centres the same logo at the same width.
 *
 * Pure data — no React Native imports, so tests can read it.
 */
export const BOOT_SPLASH = {
  /** Native splash + root view + loader midpoint. */
  background: '#3B63E8',
  /** Loader gradient: bright sky blue → base (behind the logo) → deep badge blue (M17C.1: no violet chrome). */
  gradient: ['#5C8CFF', '#3B63E8', '#2450CC'] as const,
  gradientStops: [0, 0.5, 1] as const,
  /** Soft light behind the logo. */
  glow: '#9FD0FF',
  /** Native `imageWidth` and the in-app logo width (pt). */
  logoWidth: 280,
  /** Intrinsic aspect of `assets/splash-logo.png` (1774 × 887). */
  logoAspect: 1774 / 887,
  /** Loader exit once boot is done — a transition, never a hold. */
  exitMs: 240,
  exitReducedMs: 120,
  /** Background / glow / Pal fade-in after the native hand-off. */
  enterMs: 320,
  /** If the logo never reports loaded, drop the native splash anyway (ms). */
  handoffFallbackMs: 1200,
  /** If storage never answers, reveal Home anyway — it has its own loading states (ms). */
  bootTimeoutMs: 3000,
} as const;

/** Native splash image (and the in-app loader's logo). Replace this file to rebrand the splash. */
export const SPLASH_LOGO_PATH = './assets/splash-logo.png';
