import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { devNeighbours } from '@/game/levels/devLevelIndex';
import { GameScreen } from '@/screens/GameScreen';
import { AV, AV_FONT, AV_SIZE } from '@/theme/arcadiaV2';

interface DevPlayScreenProps {
  levelId: number;
  /** Load another level, staying in dev test mode. */
  onNavigate: (levelId: number) => void;
  /** Back to the Level Browser. */
  onBrowser: () => void;
}

const noop = () => {};

/**
 * DEV-ONLY: one authored level in dev test mode — the real {@link GameScreen}
 * with `mode="dev"` (sandboxed progression/economy) plus a discreet
 * PREV · LIST · REPLAY · NEXT bar that stays tappable over the result cards.
 */
export function DevPlayScreen({ levelId, onNavigate, onBrowser }: DevPlayScreenProps) {
  const insets = useSafeAreaInsets();
  // Bumping the run remounts the level from scratch (fresh session + fresh
  // sandbox inventory copy) — the dev "RESET LEVEL".
  const [run, setRun] = useState(0);
  const replay = useCallback(() => setRun((r) => r + 1), []);
  const { prev, next } = devNeighbours(levelId);

  return (
    <View style={styles.root}>
      <GameScreen
        key={`${levelId}:${run}`}
        levelId={levelId}
        mode="dev"
        onWin={noop}
        onAdvance={onNavigate}
        onExit={onBrowser}
        // No onResetProgress: dev test mode never offers the real campaign
        // reset (`playPolicy('dev').allowProgressReset`). ↻ below resets the level.
      />
      {/* Sits under the HUD row, beside the progress tab (clear of both). */}
      <View pointerEvents="box-none" style={[styles.bar, { top: insets.top + AV_SIZE.hudTopGap + AV_SIZE.hudRow + 4 }]}>
        <View style={styles.group}>
          <DevButton label={prev !== undefined ? `‹ ${prev}` : '‹'} disabled={prev === undefined} onPress={() => prev !== undefined && onNavigate(prev)} a11y="Previous level" />
          <DevButton label="LIST" onPress={onBrowser} a11y="Back to dev levels" />
        </View>
        <View style={styles.group}>
          <DevButton label="↻" onPress={replay} a11y="Replay level" />
          <DevButton label={next !== undefined ? `${next} ›` : '›'} disabled={next === undefined} onPress={() => next !== undefined && onNavigate(next)} a11y="Next level" />
        </View>
      </View>
    </View>
  );
}

function DevButton({ label, onPress, disabled, a11y }: { label: string; onPress: () => void; disabled?: boolean; a11y: string }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [styles.btn, disabled && styles.btnDisabled, pressed && styles.btnPressed]}
    >
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bar: {
    position: 'absolute',
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 500,
    elevation: 50,
  },
  group: { flexDirection: 'row', gap: 6 },
  btn: {
    height: 26,
    minWidth: 34,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,20,50,0.72)',
    borderWidth: 1,
    borderColor: AV.gold,
  },
  btnDisabled: { opacity: 0.35 },
  btnPressed: { opacity: 0.6 },
  btnText: { fontFamily: AV_FONT.extraBold, fontSize: 12, color: AV.gold, fontVariant: ['tabular-nums'] },
});
