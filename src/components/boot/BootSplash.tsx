import { Canvas, Circle, RadialGradient, vec } from '@shopify/react-native-skia';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useEffect, useRef } from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { HomeMascot } from '@/components/home/HomeMascot';
import { avAlpha } from '@/theme/arcadiaV2';
import { BOOT_SPLASH } from '@/theme/bootSplash';

const LOGO_SOURCE = require('../../../assets/splash-logo.png') as number;

const PAL_SIZE = 84;
const DOT = 8;
const DOT_GAP = 8;
const DOT_PERIOD_MS = 900;

interface BootSplashProps {
  /** Boot work (fonts + save data) is done — fade out now. */
  ready: boolean;
  /** First frame that matches the native splash is on screen — hide the native splash. */
  onHandoff: () => void;
  /** Exit finished; the owner unmounts this. */
  onDone: () => void;
}

/**
 * App-layer launch screen (M10). The NATIVE splash is a static frame — solid
 * `BOOT_SPLASH.background` with the logo centred at `logoWidth`. This view's
 * first frame draws exactly that, so hiding the native splash is invisible;
 * only then does the richer layer fade in: sky-to-deep-blue gradient, a soft
 * glow behind the logo, the Pal and a three-pixel loading beat.
 *
 * It never holds the app: the moment `ready` flips it fades out (240ms) over
 * the already-mounted Home. A fast boot sees native → Home with one short
 * cross-fade; the richer layer only becomes noticeable when boot really
 * takes time. Reduce Motion: no pulse, shorter fades.
 */
export const BootSplash = memo(function BootSplash({ ready, onHandoff, onDone }: BootSplashProps) {
  const { width, height } = useWindowDimensions();
  const reducedMotion = !!useReducedMotion();

  const logoW = BOOT_SPLASH.logoWidth;
  const logoH = logoW / BOOT_SPLASH.logoAspect;
  const cx = width / 2;
  const cy = height / 2;

  // ── Native hand-off: on the logo's first decoded frame (fallback: timer). ──
  const handedOff = useRef(false);
  const doHandoff = useCallback(() => {
    if (handedOff.current) return;
    handedOff.current = true;
    onHandoff();
  }, [onHandoff]);
  useEffect(() => {
    const t = setTimeout(doHandoff, BOOT_SPLASH.handoffFallbackMs);
    return () => clearTimeout(t);
  }, [doHandoff]);

  // ── Enter: the layers the native splash can't draw. ──
  const enter = useSharedValue(0);
  useEffect(() => {
    enter.set(withTiming(1, { duration: reducedMotion ? 0 : BOOT_SPLASH.enterMs, easing: Easing.out(Easing.quad) }));
  }, [enter, reducedMotion]);
  const enterStyle = useAnimatedStyle(() => ({ opacity: enter.value }));
  const palStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 10 }],
  }));

  // ── Exit: fade the whole loader off Home as soon as boot is done. ──
  const exit = useSharedValue(1);
  useEffect(() => {
    if (!ready) return;
    exit.set(withTiming(0, {
      duration: reducedMotion ? BOOT_SPLASH.exitReducedMs : BOOT_SPLASH.exitMs,
      easing: Easing.in(Easing.quad),
    }, (finished) => {
      if (finished) runOnJS(onDone)();
    }));
  }, [ready, reducedMotion, exit, onDone]);
  const exitStyle = useAnimatedStyle(() => ({ opacity: exit.value }));

  const glowR = Math.max(logoW * 0.9, 200);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, exitStyle]}
      pointerEvents={ready ? 'none' : 'auto'}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading Pixel Arcadia"
      accessibilityState={{ busy: !ready }}
    >
      <Animated.View style={[StyleSheet.absoluteFill, enterStyle]} pointerEvents="none">
        <LinearGradient
          colors={BOOT_SPLASH.gradient}
          locations={BOOT_SPLASH.gradientStops}
          style={StyleSheet.absoluteFill}
        />
        <Canvas style={StyleSheet.absoluteFill}>
          <Circle cx={cx} cy={cy} r={glowR}>
            <RadialGradient
              c={vec(cx, cy)}
              r={glowR}
              colors={[avAlpha(BOOT_SPLASH.glow, 0.55), avAlpha(BOOT_SPLASH.glow, 0.18), avAlpha(BOOT_SPLASH.glow, 0)]}
              positions={[0, 0.45, 1]}
            />
          </Circle>
        </Canvas>
      </Animated.View>

      {/* Same size + centre as the native splash image: this is the hand-off anchor. */}
      <Image
        source={LOGO_SOURCE}
        resizeMode="contain"
        fadeDuration={0}
        onLoadEnd={doHandoff}
        style={{ position: 'absolute', width: logoW, height: logoH, left: cx - logoW / 2, top: cy - logoH / 2 }}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />

      <Animated.View
        pointerEvents="none"
        style={[styles.below, { top: cy + logoH / 2 + 18 }, palStyle]}
      >
        <HomeMascot size={PAL_SIZE} active={!ready} reducedMotion={reducedMotion} />
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <LoaderDot key={i} index={i} reducedMotion={reducedMotion} />
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
});

/** One square "pixel" of the loading beat; the three pulse in sequence. */
function LoaderDot({ index, reducedMotion }: { index: number; reducedMotion: boolean }) {
  const pulse = useSharedValue(reducedMotion ? 1 : 0.35);
  useEffect(() => {
    if (reducedMotion) return;
    const half = DOT_PERIOD_MS / 2;
    pulse.set(withDelay(index * (DOT_PERIOD_MS / 3), withRepeat(
      withSequence(withTiming(1, { duration: half }), withTiming(0.35, { duration: half })),
      -1,
    )));
  }, [pulse, index, reducedMotion]);
  const style = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.8 + pulse.value * 0.2 }],
  }));
  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  root: { backgroundColor: BOOT_SPLASH.background, zIndex: 1000, elevation: 1000 },
  below: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: DOT_GAP, marginTop: 18 },
  dot: { width: DOT, height: DOT, borderRadius: 2, backgroundColor: '#FFFFFF' },
});
