import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { HeartCountdown } from '@/components/hearts/HeartCountdown';
import { AvHeartIcon } from '@/components/v2/AvIcon';
import { LipSurface } from '@/components/v2/primitives';
import { feedback } from '@/game/feedback';
import { MAX_HEARTS } from '@/game/hearts/config';
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
}

const CARD_MAX_W = 320;
const MEDALLION = 64;
const BTN_H = 50;
const BTN_LIP = 4;

/**
 * OUT OF HEARTS (M11). A calm wait prompt, not a paywall: a heart medallion,
 * the live countdown to the next heart, and one dismiss action. No ads, no
 * purchase — those arrive in M12. If a heart lands while it's open, the copy
 * flips to "ready" and (when the caller passes `onPlay`) PLAY replaces GOT IT.
 */
export const OutOfHeartsModal = memo(function OutOfHeartsModal({ visible, onClose, onPlay }: OutOfHeartsModalProps) {
  const { hearts, nextHeartAt } = useHearts();
  const ready = hearts > 0;
  const canPlay = ready && !!onPlay;

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
  btnFace: { alignItems: 'center', justifyContent: 'center' },
  btnLabel: { fontFamily: AV_FONT.black, fontSize: 17, letterSpacing: 2, color: AV.white },
  btnLabelGold: { color: AV.goldInk },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
