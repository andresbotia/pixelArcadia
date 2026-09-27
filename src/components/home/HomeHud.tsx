import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HeartCountdown } from '@/components/hearts/HeartCountdown';
import { AvHeartIcon, AvIcon } from '@/components/v2/AvIcon';
import { CoinMedallion } from '@/components/v2/primitives';
import { coinsAccessibilityLabel, formatCurrency } from '@/game/economy/formatCurrency';
import { MAX_HEARTS } from '@/game/hearts/config';
import { AV, AV_FONT, AV_TYPE } from '@/theme/arcadiaV2';

interface HomeHudProps {
  hearts: number;
  /** Epoch ms of the next heart; `null` when full (no countdown is drawn). */
  nextHeartAt: number | null;
  /** Screen focused + app foregrounded — the countdown only ticks while true. */
  live: boolean;
  coins: number;
  /** Mint "+" on the coin pill. Omitted → the "+" is not drawn. */
  onAddCoins?: () => void;
  onSettings?: () => void;
}

/**
 * M7A — v2 Home resource bar: white 92% pills, 36pt tall, each led by a 28pt
 * medallion with a 2pt inner lip. Lives left (count over FULL, or over the
 * MM:SS to the next heart); coins (+ mint "+") and a glass settings button
 * right. Both pills size to their content — the balance is pre-compacted by
 * `formatCurrency` (≤ 5 glyphs up to 99.9K), so the row never overflows a
 * 375pt screen. Accessibility labels carry the exact values.
 */
export const HomeHud = memo(function HomeHud({
  hearts,
  nextHeartAt,
  live,
  coins,
  onAddCoins,
  onSettings,
}: HomeHudProps) {
  const full = hearts >= MAX_HEARTS || nextHeartAt === null;
  return (
    <View style={styles.row}>
      <View
        style={[styles.pill, styles.heartPill]}
        accessible
        accessibilityLabel={full ? `${hearts} lives, full` : `${hearts} of ${MAX_HEARTS} lives, next life soon`}
      >
        <LinearGradient colors={[AV.heartTop, AV.heartBottom]} style={[styles.medallion, styles.heartMedallion]}>
          <View style={[styles.innerLip, { backgroundColor: AV.heartLip }]} />
          <AvHeartIcon size={15} />
        </LinearGradient>
        <View style={styles.stack}>
          <Text style={styles.count}>{hearts}</Text>
          {full ? (
            <Text style={styles.sub}>FULL</Text>
          ) : (
            <HeartCountdown until={nextHeartAt} live={live} style={[styles.sub, styles.timer]} />
          )}
        </View>
      </View>

      <View style={styles.spacer} />

      <View style={[styles.pill, styles.coinPill, !onAddCoins && styles.coinPillBare]}>
        <View style={styles.coinValue} accessible accessibilityLabel={coinsAccessibilityLabel(coins)}>
          <CoinMedallion size={28} />
          <Text style={[styles.count, styles.coinCount]} numberOfLines={1}>
            {formatCurrency(coins)}
          </Text>
        </View>
        {onAddCoins ? (
          <Pressable
            onPress={onAddCoins}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Get more coins"
            style={({ pressed }) => [styles.plus, pressed && styles.pressed]}
          >
            <View style={[styles.innerLip, styles.plusLip]} />
            <Text style={styles.plusText}>+</Text>
          </Pressable>
        ) : null}
      </View>

      <Pressable
        onPress={onSettings}
        disabled={!onSettings}
        hitSlop={6}
        pressRetentionOffset={12}
        accessibilityRole="button"
        accessibilityLabel="Settings"
        accessibilityState={{ disabled: !onSettings }}
        style={({ pressed }) => [styles.gear, pressed && onSettings ? styles.pressed : null]}
      >
        <AvIcon name="gear" size={20} color={AV.white} stroke={2} />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    height: 40,
    marginTop: 7,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spacer: { flex: 1 },
  pill: {
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    // Solid 3pt drop — the design's pill lip, not a blur.
    shadowColor: AV.ink,
    shadowOpacity: 0.15,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  heartPill: { paddingLeft: 4, paddingRight: 12 },
  // 4pt around the medallion and the "+", 10pt clear between number and "+".
  coinPill: { paddingHorizontal: 4, gap: 10 },
  coinPillBare: { paddingRight: 12 },
  coinValue: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  medallion: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heartMedallion: { borderRadius: 14 },
  innerLip: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 2 },
  stack: { justifyContent: 'center' },
  count: { ...AV_TYPE.counter, color: AV.ink, lineHeight: 17 },
  // Floor only, so "0" and "50" don't collapse the pill; wider balances grow it.
  coinCount: { minWidth: 28, textAlign: 'center' },
  sub: { fontFamily: AV_FONT.bold, fontSize: 9, lineHeight: 10, letterSpacing: 0.5, color: AV.inkMuted },
  // Fixed-width digits so the pill doesn't twitch every second.
  timer: { color: AV.heartLip, fontVariant: ['tabular-nums'], letterSpacing: 0.2, minWidth: 27 },
  plus: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: AV.mint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  plusLip: { backgroundColor: AV.mintLip },
  plusText: { fontFamily: AV_FONT.black, fontSize: 18, lineHeight: 20, color: AV.white, marginTop: -1 },
  gear: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
});
