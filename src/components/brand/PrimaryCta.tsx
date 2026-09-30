import { memo, useCallback, useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AV, AV_FONT } from '@/theme/arcadiaV2';

/** v2 gold face — the same ramp as Home's PLAY (`HomePlayButton`). */
const GOLD_FACE = [AV.goldLight, AV.gold, AV.goldDeep] as const;

interface PrimaryCtaProps {
  /** Uppercased automatically. PLAY / NEXT / CONTINUE / RETRY. */
  label: string;
  onPress: () => void;
  onPressIn?: () => void;
  disabled?: boolean;
  /** `primary` = the one gold CTA per screen. `secondary` = glass + border. */
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
  /**
   * Opt-in slow glow-breathing idle state (UI-R2 — Home's PLAY/CONTINUE only).
   * Defaults to `false` so every existing consumer (Try Again, NEXT, Worlds,
   * etc.) renders exactly as before. iOS-only effect (animates `shadowOpacity`/
   * `shadowRadius`, never Android `elevation` — animating elevation re-renders
   * the shadow every frame). Reduced motion holds at the midpoint.
   */
  idleGlow?: boolean;
}

/**
 * The approved Pixel Arcadia primary call-to-action. One `primary` per screen;
 * PLAY / NEXT / RETRY / CONTINUE all share this exact treatment and nothing else
 * does. Token-driven — no bespoke per-screen button styling.
 *
 *  - primary  : v2 gold fill (AV.goldLight → gold → goldDeep, as Home PLAY),
 *               inset top highlight + goldLip bottom lip, gold drop glow,
 *               AV.goldInk, pressed = +2px / lip removed / glow dimmed (90ms),
 *               disabled = deep glass fill + secondary ink, no glow.
 *  - secondary: glass fill + 1px glass border, white ink.
 *  Label: Rubik 900 (M17C.1 — previously system bold).
 */
export const PrimaryCta = memo(function PrimaryCta({
  label,
  onPress,
  onPressIn,
  disabled = false,
  variant = 'primary',
  fullWidth = false,
  style,
  accessibilityHint,
  idleGlow = false,
}: PrimaryCtaProps) {
  const text = label.toUpperCase();
  const isPrimary = variant === 'primary';
  const reducedMotion = useReducedMotion();
  const breathe = useSharedValue(0.5);

  useEffect(() => {
    cancelAnimation(breathe);
    if (!idleGlow) { breathe.set(0.5); return; }
    if (reducedMotion) { breathe.set(0.5); return; }
    breathe.set(withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => cancelAnimation(breathe);
  }, [idleGlow, reducedMotion, breathe]);

  const breatheStyle = useAnimatedStyle(() => {
    if (!idleGlow || Platform.OS !== 'ios') return {};
    return { shadowOpacity: 0.28 + breathe.value * 0.16, shadowRadius: 16 + breathe.value * 10 };
  });

  // UI-R9 press/release polish — additive to the existing `translateY(2)`
  // snap (kept, it's the instant "acknowledged" beat every consumer already
  // has). This adds the missing physical half: a quick squash on press-in,
  // a short spring settle on release, so PLAY/NEXT/RETRY/Worlds all get the
  // same tactile family without changing what any of them DO on press.
  const press = useSharedValue(0);
  const handlePressIn = useCallback(() => {
    press.set(withTiming(1, { duration: 70, easing: Easing.out(Easing.cubic) }));
    onPressIn?.();
  }, [press, onPressIn]);
  const handlePressOut = useCallback(() => {
    press.set(reducedMotion
      ? withTiming(0, { duration: 90 })
      : withSpring(0, { damping: 14, stiffness: 260 }));
  }, [press, reducedMotion]);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * 0.03 }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={text}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      hitSlop={10}
      style={[fullWidth && styles.fullWidth, style]}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.shell,
            fullWidth && styles.fullWidth,
            isPrimary && !disabled && styles.glow,
            isPrimary && pressed && styles.glowPressed,
            isPrimary && !disabled && !pressed ? breatheStyle : null,
            pressed && !disabled && styles.pressed,
            !disabled && pressStyle,
          ]}
        >
          {disabled ? (
            <View style={[styles.fill, styles.disabledFill]} />
          ) : isPrimary ? (
            <LinearGradient colors={GOLD_FACE} style={styles.fill} />
          ) : (
            <View style={[styles.fill, styles.secondaryFill]} />
          )}

          {isPrimary && !disabled ? (
            <>
              <View style={styles.topHighlight} />
              {!pressed ? <View style={styles.bottomLip} /> : null}
            </>
          ) : null}

          <Text
            style={[
              styles.label,
              isPrimary && !disabled ? styles.inkPrimary : styles.inkMuted,
              !isPrimary && !disabled && styles.inkSecondary,
            ]}
          >
            {text}
          </Text>
        </Animated.View>
      )}
    </Pressable>
  );
});

const RADIUS = 16;
const MIN_HEIGHT = 52;

const styles = StyleSheet.create({
  fullWidth: { alignSelf: 'stretch' },
  shell: {
    minHeight: MIN_HEIGHT,
    minWidth: 200,
    borderRadius: RADIUS,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pressed: { transform: [{ translateY: 2 }] },
  glow: {
    ...Platform.select({
      ios: {
        shadowColor: AV.goldDeep,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 20,
        shadowOpacity: 0.32,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  glowPressed: {
    ...Platform.select({
      ios: { shadowOpacity: 0.4, shadowRadius: 14 },
      android: { elevation: 5 },
      default: {},
    }),
  },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: RADIUS },
  secondaryFill: { backgroundColor: AV.glass, borderWidth: 1, borderColor: AV.glassBorder },
  disabledFill: { backgroundColor: AV.glassDeep },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: RADIUS,
    right: RADIUS,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  bottomLip: {
    position: 'absolute',
    bottom: 0,
    left: RADIUS,
    right: RADIUS,
    height: 3,
    backgroundColor: AV.goldLip,
  },
  label: { fontFamily: AV_FONT.black, fontSize: 17, letterSpacing: 17 * 0.16 },
  inkPrimary: { color: AV.goldInk },
  inkMuted: { color: AV.textSecondary },
  inkSecondary: { color: AV.white },
});
