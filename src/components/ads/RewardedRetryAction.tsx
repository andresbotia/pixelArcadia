import { memo, useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { adFlows } from '@/ads/service';
import { feedback } from '@/game/feedback';
import { useAdPlacement, useAdsPolicy } from '@/hooks/useAds';
import { useHearts } from '@/hooks/useHearts';
import { GP, GP_TYPE, gpAlpha } from '@/theme/gameplayUi';

interface RewardedRetryActionProps {
  levelId: number;
  /** The confirmed reward is saved; start the free retry now. */
  onRewarded: () => void;
}

/**
 * WATCH AD & RETRY on the loss card (campaign only — the caller never mounts
 * it in dev). Offered only when the player is OUT of hearts: with a heart left
 * the normal retry is already free, so an ad would buy nothing. Hidden when
 * the placement is unavailable (ads off / SDK failed); visible but disabled
 * while an ad loads. The reward is one free retry start — the heart this loss
 * cost is not refunded.
 */
export const RewardedRetryAction = memo(function RewardedRetryAction({ levelId, onRewarded }: RewardedRetryActionProps) {
  const { hearts, loading } = useHearts();
  const state = useAdPlacement('REWARDED_RETRY');
  const policy = useAdsPolicy();
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  const handlePress = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    feedback.emit('select');
    try {
      const earned = await adFlows.watchRewardedRetry('campaign', levelId);
      if (earned) onRewarded();
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }, [levelId, onRewarded]);

  if (loading || hearts > 0 || !policy.rewardedEnabled || state === 'unavailable') return null;
  const ready = state === 'ready' && !busy;

  return (
    <Pressable
      onPress={handlePress}
      disabled={!ready}
      accessibilityRole="button"
      accessibilityLabel="Watch an ad to retry"
      accessibilityState={{ disabled: !ready, busy }}
      style={({ pressed }) => [styles.btn, !ready && styles.btnDisabled, pressed && styles.pressed]}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>AD</Text>
      </View>
      <Text style={styles.label}>{ready || busy ? 'WATCH AD & RETRY' : 'AD LOADING…'}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  btn: {
    alignSelf: 'stretch',
    height: 46,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: gpAlpha(GP.gold, 0.7),
    backgroundColor: gpAlpha(GP.gold, 0.1),
    marginBottom: 4,
  },
  btnDisabled: { opacity: 0.45 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  badge: {
    paddingHorizontal: 5,
    height: 18,
    borderRadius: 5,
    justifyContent: 'center',
    backgroundColor: GP.gold,
  },
  badgeText: { ...GP_TYPE.label, fontSize: 10, color: '#5A2A00', letterSpacing: 0.8 },
  label: { ...GP_TYPE.label, fontSize: 13, color: GP.gold, letterSpacing: 1.4 },
});
