import { memo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { ads } from '@/ads/service';
import type { AdPlacement } from '@/ads/types';
import { formatCurrency } from '@/game/economy/formatCurrency';
import { _devSetCoins } from '@/storage/economy';
import { _devSetHearts } from '@/storage/hearts';
import { AV, AV_FONT } from '@/theme/arcadiaV2';

const HEART_PRESETS = [0, 1, 4, 5] as const;
const COIN_PRESETS = [1_300, 9_999, 12_500, 125_000, 1_200_000] as const;

/**
 * Show a TEST ad straight from the controller (dev builds only ever resolve
 * Google's test units) and report the result. Grants nothing and never
 * touches the cadence — it bypasses the product flows on purpose.
 */
async function showTestAd(placement: AdPlacement): Promise<void> {
  const state = ads.getState(placement);
  const res = await ads.show(placement);
  Alert.alert('Test ad', `${placement}\nwas: ${state}\n${JSON.stringify(res)}`);
}

/**
 * DEV-ONLY: presets that write the REAL save, for checking the Home heart/coin
 * pills and the 0-heart gate without grinding losses. Separate from dev test
 * mode (which never touches the save); only reachable from the `__DEV__`-gated
 * Level Browser, so release builds never include it.
 */
export const DevSaveTools = memo(function DevSaveTools() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.row}>
      <Text style={styles.label}>REAL SAVE</Text>
      {HEART_PRESETS.map((n) => (
        <Tool key={`h${n}`} label={`♥ ${n}`} onPress={() => void _devSetHearts(n)} />
      ))}
      {COIN_PRESETS.map((n) => (
        <Tool key={`c${n}`} label={`◈ ${formatCurrency(n)}`} onPress={() => void _devSetCoins(n)} />
      ))}
      <Tool label="AD ▶ INT" onPress={() => void showTestAd('INTERSTITIAL_CAMPAIGN')} />
      <Tool label="AD ▶ RWD" onPress={() => void showTestAd('REWARDED_HEART')} />
    </ScrollView>
  );
});

function Tool({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Dev: set ${label}`}
      style={({ pressed }) => [styles.tool, pressed && styles.pressed]}
    >
      <Text style={styles.toolText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, marginTop: 8 },
  row: { paddingHorizontal: 16, gap: 6, alignItems: 'center' },
  label: { fontFamily: AV_FONT.extraBold, fontSize: 10, letterSpacing: 1, color: AV.coral, marginRight: 2 },
  tool: {
    height: 26,
    paddingHorizontal: 9,
    borderRadius: 8,
    justifyContent: 'center',
    backgroundColor: 'rgba(10,20,50,0.5)',
    borderWidth: 1,
    borderColor: AV.coral,
  },
  pressed: { opacity: 0.6 },
  toolText: { fontFamily: AV_FONT.extraBold, fontSize: 12, color: AV.white, fontVariant: ['tabular-nums'] },
});
