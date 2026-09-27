import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { adFlows } from '@/ads/service';
import type { OutOfHeartsSource } from '@/analytics/api';
import { analytics } from '@/analytics/service';
import { HeartCountdown } from '@/components/hearts/HeartCountdown';
import { AvHeartIcon } from '@/components/v2/AvIcon';
import { LipSurface } from '@/components/v2/primitives';
import { feedback } from '@/game/feedback';
import { MAX_HEARTS } from '@/game/hearts/config';
import type { PlayMode } from '@/game/playMode';
import { useAdPlacement, useAdsPolicy } from '@/hooks/useAds';
import { useHearts } from '@/hooks/useHearts';
import { AV, AV_DEPTH, AV_FONT, avAlpha } from '@/theme/arcadiaV2';

interface OutOfHeartsModalProps {
  visible: boolean;
  onClose: () => void;
  /**
   * Offered once a heart has regenerated while the prompt is open. Omitted →
   * the prompt only closes.
   */
  onPlay?: () => void;
  /** Play mode of the caller. Only campaign ever mounts this; dev never gets the rewarded heart. */
  mode?: PlayMode;
  /** Where the player hit the gate (analytics `out_of_hearts_viewed.source`). */
  source?: OutOfHeartsSource;
}

const CARD_MAX_W = 320;
const MEDALLION = 64;
const BTN_H = 50;
const BTN_LIP = 4;

/**
 * OUT OF HEARTS (M11). A calm wait prompt, not a paywall: a heart medallion,
 * the live countdown to the next heart, and one dismiss action. No ads, no
 * purchase. If a heart lands while it's open, the copy flips to "ready" and
 * (when the caller passes `onPlay`) PLAY replaces GOT IT.
 *
 * M12: WATCH AD +1 HEART — a voluntary rewarded exchange while at 0 hearts.
 * Exactly +1 heart on the SDK's confirmed reward (via the central heart
 * grant, so regen progress is kept); the modal then shows HEART READY / PLAY
 * and waits for the player's tap. Hidden when ads are unavailable, disabled
 * while one loads.
 */
export const OutOfHeartsModal = memo(function OutOfHeartsModal({ visible, onClose, onPlay, mode = 'campaign', source = 'other' }: OutOfHeartsModalProps) {
  const { hearts, nextHeartAt } = useHearts();
  // One `out_of_hearts_viewed` per opening (the rising edge), never per render.
  const heartsRef = useRef(hearts);
  useEffect(() => { heartsRef.current = hearts; }, [hearts]);
  useEffect(() => {
    if (visible && mode === 'campaign') analytics.outOfHeartsViewed(source, heartsRef.current);
  }, [visible, mode, source]);
  const ready = hearts > 0;
  const canPlay = ready && !!onPlay;
  const adState = useAdPlacement('REWARDED_HEART');
  const adsPolicy = useAdsPolicy();
  const [watching, setWatching] = useState(false);
  const watchingRef = useRef(false);
  const offerAd = !ready && adsPolicy.rewardedEnabled && adState !== 'unavailable';
  const adReady = adState === 'ready' && !watching;

  const handleWatchAd = useCallback(async () => {
    if (watchingRef.current) return;
    watchingRef.current = true;
    setWatching(true);
    feedback.emit('select');
    try {
      const earned = await adFlows.watchRewardedHeart(mode);
      if (earned) feedback.emit('reward');
    } finally {
      watchingRef.current = false;
      setWatching(false);
    }
  }, [mode]);

  const handlePrimary = useCallback(() => {
    feedback.emit('select');
    onClose();
    if (canPlay) onPlay?.();
  }, [canPlay, onClose, onPlay]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.scrim}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" accessibilityRole="button" />

        <View style={styles.card} accessibilityViewIsModal>
          <View style={styles.medallionWrap}>
            <LinearGradient colors={[AV.heartTop, AV.heartBottom]} style={styles.medallion}>
              <View style={styles.medallionLip} />
              <AvHeartIcon size={30} />
            </LinearGradient>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{hearts}</Text>
            </View>
          </View>

          <Text style={styles.title} accessibilityRole="header">
            {ready ? 'HEART READY' : 'OUT OF HEARTS'}
          </Text>

          {ready ? (
            <Text style={styles.body}>A heart is back. You&apos;re good to play.</Text>
          ) : (
            <Text style={styles.body}>
              A new heart arrives in{' '}
              {nextHeartAt !== null ? (
                <HeartCountdown until={nextHeartAt} live={visible} style={styles.bodyTime} />
              ) : (
                <Text style={styles.bodyTime}>a moment</Text>
              )}
              .
            </Text>
          )}

          <Text style={styles.hint}>Hearts refill 1 every 30 min, up to {MAX_HEARTS}.</Text>

          {offerAd ? (
            <Pressable
              onPress={handleWatchAd}
              disabled={!adReady}
              accessibilityRole="button"
              accessibilityLabel="Watch an ad for one heart"
              accessibilityState={{ disabled: !adReady, busy: watching }}
              style={({ pressed }) => [styles.adBtn, !adReady && styles.adBtnDisabled, pressed && styles.pressed]}
            >
              <View style={styles.adBadge}>
                <Text style={styles.adBadgeText}>AD</Text>
              </View>
              <Text style={styles.adLabel}>{adReady || watching ? 'WATCH AD  +1' : 'AD LOADING…'}</Text>
              {adReady || watching ? <AvHeartIcon size={15} color={AV.heartBottom} /> : null}
            </Pressable>
          ) : null}

          <Pressable
            onPress={handlePrimary}
            accessibilityRole="button"
            accessibilityLabel={canPlay ? 'Play' : 'Got it'}
            style={({ pressed }) => [styles.btnWrap, pressed && styles.pressed]}
          >
            <LipSurface
              height={BTN_H}
              radius={16}
              lip={BTN_LIP}
              lipColor={canPlay ? AV.goldLip : AV.badgeLip}
              colors={canPlay ? [AV.goldLight, AV.gold, AV.goldDeep] : [AV.badgeTop, AV.badgeMid, AV.badgeBottom]}
              faceStyle={styles.btnFace}
            >
              <Text style={[styles.btnLabel, canPlay && styles.btnLabelGold]}>{canPlay ? 'PLAY' : 'GOT IT'}</Text>
            </LipSurface>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: avAlpha('#0A1840', 0.62),
  },
  card: {
    width: '100%',
    maxWidth: CARD_MAX_W,
    alignItems: 'center',
    paddingTop: MEDALLION / 2 + 16,
    paddingHorizontal: 22,
    paddingBottom: 20,
    marginTop: MEDALLION / 2,
    borderRadius: 26,
    backgroundColor: AV.plate,
    borderBottomWidth: AV_DEPTH.plateLip,
    borderBottomColor: AV.plateLip,
    ...AV_DEPTH.lift,
  },
  medallionWrap: { position: 'absolute', top: -MEDALLION / 2, alignSelf: 'center' },
  medallion: {
    width: MEDALLION,
    height: MEDALLION,
    borderRadius: MEDALLION / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: AV.white,
  },
  medallionLip: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, backgroundColor: AV.heartLip },
  countBadge: {
    position: 'absolute',
    right: -6,
    bottom: -2,
    minWidth: 26,
    height: 26,
    paddingHorizontal: 6,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AV.ink,
    borderWidth: 3,
    borderColor: AV.white,
  },
  countBadgeText: { fontFamily: AV_FONT.black, fontSize: 13, lineHeight: 15, color: AV.white, fontVariant: ['tabular-nums'] },
  title: { fontFamily: AV_FONT.black, fontSize: 22, letterSpacing: 1.5, color: AV.ink, textAlign: 'center' },
  body: {
    marginTop: 8,
    fontFamily: AV_FONT.medium,
    fontSize: 15,
    lineHeight: 21,
    color: AV.inkSoft,
    textAlign: 'center',
  },
  bodyTime: { fontFamily: AV_FONT.extraBold, color: AV.heartLip, fontVariant: ['tabular-nums'] },
  hint: {
    marginTop: 6,
    fontFamily: AV_FONT.medium,
    fontSize: 12,
    lineHeight: 16,
    color: AV.inkMuted,
    textAlign: 'center',
  },
  btnWrap: { alignSelf: 'stretch', marginTop: 18 },
  adBtn: {
    alignSelf: 'stretch',
    marginTop: 16,
    marginBottom: -6,
    height: 46,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 2,
    borderColor: AV.heartBottom,
    backgroundColor: avAlpha(AV.heartTop, 0.1),
  },
  adBtnDisabled: { opacity: 0.45 },
  adBadge: {
    paddingHorizontal: 5,
    height: 18,
    borderRadius: 5,
    justifyContent: 'center',
    backgroundColor: AV.heartBottom,
  },
  adBadgeText: { fontFamily: AV_FONT.black, fontSize: 10, color: AV.white, letterSpacing: 0.8 },
  adLabel: { fontFamily: AV_FONT.black, fontSize: 15, letterSpacing: 1.2, color: AV.heartLip },
  btnFace: { alignItems: 'center', justifyContent: 'center' },
  btnLabel: { fontFamily: AV_FONT.black, fontSize: 17, letterSpacing: 2, color: AV.white },
  btnLabelGold: { color: AV.goldInk },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
