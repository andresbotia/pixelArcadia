import { LinearGradient } from 'expo-linear-gradient';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeBottomNav } from '@/components/home/HomeBottomNav';
import { feedback } from '@/game/feedback';
import type { GameCenterState } from '@/game/gameCenter/service';
import { highestClearedLevel } from '@/game/gameCenter/plan';
import { useGameCenter } from '@/hooks/useGameCenter';
import { useProgress } from '@/hooks/useProgress';
import { gameCenter } from '@/services/gameCenter';
import { AV, AV_FONT } from '@/theme/arcadiaV2';

interface LeaderboardScreenProps {
  onShop: () => void;
  onHome: () => void;
}

function statusLine(gc: GameCenterState): string {
  switch (gc.status) {
    case 'authenticated': return `Signed in as ${gc.player?.displayName ?? 'Player'}`;
    case 'authenticating': return 'Signing in to Game Center…';
    case 'signedOut': return 'Sign in to Game Center in Settings to join the leaderboard.';
    case 'error': return 'Game Center isn’t reachable right now. Your progress is safe.';
    default: return 'Game Center isn’t available on this device.';
  }
}

/**
 * Trophies tab (M9D): opens Game Center's NATIVE leaderboard / achievements
 * UI. No rankings are copied into the app. Works signed out — the buttons just
 * stay inactive.
 */
export function LeaderboardScreen({ onShop, onHome }: LeaderboardScreenProps) {
  const gc = useGameCenter();
  const { progress, loading } = useProgress();
  const ready = gc.status === 'authenticated';

  const open = useCallback(async (which: 'leaderboard' | 'achievements') => {
    const ok = which === 'leaderboard' ? await gameCenter.openLeaderboard() : await gameCenter.openAchievements();
    feedback.emit(ok ? 'select' : 'denied');
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient colors={[AV.shellTop, AV.shellBottom]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.title} accessibilityRole="header">LEADERBOARD</Text>

        <View style={styles.card}>
          <Text style={styles.kicker}>CAMPAIGN PROGRESS</Text>
          <Text style={styles.cleared}>
            {loading ? '—' : highestClearedLevel(progress.highestUnlockedLevel)}
          </Text>
          <Text style={styles.caption}>levels cleared</Text>
        </View>

        <Text style={styles.status}>{statusLine(gc)}</Text>

        <View style={styles.actions}>
          <ActionButton label="OPEN LEADERBOARD" disabled={!ready} onPress={() => void open('leaderboard')} />
          <ActionButton label="ACHIEVEMENTS" disabled={!ready} secondary onPress={() => void open('achievements')} />
        </View>
      </SafeAreaView>
      <HomeBottomNav active="leaderboard" onShop={onShop} onHome={onHome} onLeaderboard={noop} />
    </View>
  );
}

const noop = () => {};

function ActionButton({ label, onPress, disabled, secondary }: { label: string; onPress: () => void; disabled: boolean; secondary?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AV.shellBottom },
  safe: { flex: 1, paddingHorizontal: 20 },
  title: { fontFamily: AV_FONT.black, fontSize: 26, color: AV.white, letterSpacing: 1.5, paddingTop: 10 },
  card: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 22,
    borderRadius: 20,
    backgroundColor: AV.glass,
    borderWidth: 1,
    borderColor: AV.glassBorder,
  },
  kicker: { fontFamily: AV_FONT.extraBold, fontSize: 12, letterSpacing: 2, color: AV.textSecondary },
  cleared: { fontFamily: AV_FONT.black, fontSize: 48, color: AV.gold, fontVariant: ['tabular-nums'], marginTop: 4 },
  caption: { fontFamily: AV_FONT.semibold, fontSize: 13, color: AV.textSecondary },
  status: {
    marginTop: 18,
    textAlign: 'center',
    fontFamily: AV_FONT.medium,
    fontSize: 14,
    lineHeight: 19,
    color: AV.textSecondary,
  },
  actions: { marginTop: 18, gap: 10 },
  button: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AV.gold,
    borderBottomWidth: 3,
    borderBottomColor: AV.goldLip,
  },
  buttonSecondary: { backgroundColor: AV.glassDeep, borderBottomColor: 'transparent', borderWidth: 1, borderColor: AV.glassBorder },
  buttonDisabled: { opacity: 0.45 },
  buttonPressed: { transform: [{ translateY: 2 }] },
  buttonText: { fontFamily: AV_FONT.black, fontSize: 15, letterSpacing: 1, color: AV.goldInk },
  buttonTextSecondary: { color: AV.white },
});
