import { LinearGradient } from 'expo-linear-gradient';
import { memo, useSyncExternalStore, type ReactNode } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorAssist } from '@/hooks/useColorAssist';
import { adConsent } from '@/ads/service';
import { openPrivacyPolicy, PRIVACY_POLICY_URL } from '@/ads/consent';
import { useRestorePurchases } from '@/hooks/useRestorePurchases';
import { formatIapDiagnostics } from '@/iap/diagnostics';
import { purchases } from '@/iap/service';
import { PRODUCT_NAME } from '@/theme/appIdentity';
import { AV, AV_FONT } from '@/theme/arcadiaV2';

interface SettingsScreenProps {
  onBack: () => void;
}

/** "1.0.0 (12)" from the native binary; null where unavailable (web / tests). */
function appVersionLabel(): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const app = require('expo-application') as typeof import('expo-application');
    const version = app.nativeApplicationVersion;
    if (!version) return null;
    return app.nativeBuildVersion ? `${version} (${app.nativeBuildVersion})` : version;
  } catch {
    return null;
  }
}

/** Fixed for the life of the process. */
const APP_VERSION = appVersionLabel();

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

/** Opens the published policy in the browser; if iOS refuses, say where it lives. */
function onPrivacyPolicy(): void {
  void openPrivacyPolicy(Linking, (error) => {
    if (isDev) console.warn('[settings] could not open the Privacy Policy', error);
  }).then((opened) => {
    if (!opened) Alert.alert('Privacy Policy', `Couldn't open your browser. The policy is at\n${PRIVACY_POLICY_URL}`);
  });
}

/**
 * Store diagnostics for TestFlight QA: long-press the version row. Counts,
 * product ids, configuration state and SDK error codes only — never keys,
 * transaction ids or account details.
 */
function showStoreDiagnostics(): void {
  Alert.alert('Store diagnostics', formatIapDiagnostics(purchases().diagnostics()));
}

/**
 * Settings (M17C.1). Only controls that already work end to end:
 *  - Color Assist — the persisted accessibility preference gameplay already honours.
 *  - Restore Purchases — the central IAP controller (Remove Ads only; never re-grants consumables).
 *  - About — product name and the installed version/build.
 * Privacy Policy links to the published policy; UMP supplies optional ad choices.
 * Long-pressing the version row shows safe store diagnostics (TestFlight QA).
 */
export const SettingsScreen = memo(function SettingsScreen({ onBack }: SettingsScreenProps) {
  const colorAssist = useColorAssist();
  const restore = useRestorePurchases();
  const restoreDisabled = restore.running || restore.busy;
  const privacyOptionsRequired = useSyncExternalStore(
    (listener) => adConsent.subscribe(listener),
    () => adConsent.isPrivacyOptionsRequired(),
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={[AV.shellTop, AV.shellBottom]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Text style={styles.backGlyph}>‹</Text>
          </Pressable>
          <Text style={styles.title} accessibilityRole="header">SETTINGS</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Section label="ACCESSIBILITY">
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Color Assist</Text>
                <Text style={styles.rowSub}>Adds a unique symbol to every color, on the board and on each Pal.</Text>
              </View>
              <Switch
                value={colorAssist.enabled}
                onValueChange={colorAssist.setEnabled}
                disabled={!colorAssist.ready}
                trackColor={{ false: AV.glassDeep, true: AV.mint }}
                thumbColor={AV.white}
                ios_backgroundColor={AV.glassDeep}
                accessibilityLabel="Color Assist"
              />
            </View>
          </Section>

          <Section label="PURCHASES">
            <Pressable
              onPress={() => void restore.restore()}
              disabled={restoreDisabled}
              accessibilityRole="button"
              accessibilityLabel="Restore purchases"
              accessibilityState={{ disabled: restoreDisabled, busy: restore.running }}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, restoreDisabled && styles.dim]}>
                  {restore.running ? 'Restoring…' : 'Restore Purchases'}
                </Text>
                <Text style={styles.rowSub}>
                  {restore.message ?? 'Brings back Remove Ads on this device.'}
                </Text>
              </View>
            </Pressable>
          </Section>

          <Section label="ABOUT">
            <Pressable onLongPress={showStoreDiagnostics} delayLongPress={800} accessible={false} style={styles.row}>
              <Text style={styles.rowTitle}>{PRODUCT_NAME}</Text>
              {APP_VERSION ? <Text style={styles.value}>{APP_VERSION}</Text> : null}
            </Pressable>
            <Pressable
              onPress={onPrivacyPolicy}
              accessibilityRole="link"
              accessibilityLabel="Privacy Policy"
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <Text style={styles.rowTitle}>Privacy Policy</Text>
            </Pressable>
            {privacyOptionsRequired ? (
              <Pressable
                onPress={() => { void adConsent.showPrivacyOptions(); }}
                accessibilityRole="button"
                accessibilityLabel="Ad Privacy Choices"
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <Text style={styles.rowTitle}>Ad Privacy Choices</Text>
              </Pressable>
            ) : null}
          </Section>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
});

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.kicker}>{label}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: AV.shellBottom },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AV.glass,
    borderWidth: 1,
    borderColor: AV.glassBorder,
  },
  backGlyph: { fontFamily: AV_FONT.bold, fontSize: 28, lineHeight: 30, color: AV.white, marginTop: -2 },
  title: { fontFamily: AV_FONT.black, fontSize: 26, color: AV.white, letterSpacing: 1.5 },
  content: { paddingHorizontal: 20, paddingBottom: 32, gap: 20 },
  section: { gap: 8 },
  kicker: { fontFamily: AV_FONT.extraBold, fontSize: 12, letterSpacing: 2, color: AV.textSecondary, paddingLeft: 4 },
  card: {
    borderRadius: 20,
    backgroundColor: AV.glass,
    borderWidth: 1,
    borderColor: AV.glassBorder,
    overflow: 'hidden',
  },
  row: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowText: { flex: 1, gap: 3 },
  rowTitle: { fontFamily: AV_FONT.bold, fontSize: 16, color: AV.white },
  rowSub: { fontFamily: AV_FONT.medium, fontSize: 13, lineHeight: 18, color: AV.textSecondary },
  value: { fontFamily: AV_FONT.semibold, fontSize: 14, color: AV.textSecondary, fontVariant: ['tabular-nums'] },
  dim: { opacity: 0.5 },
  pressed: { opacity: 0.75 },
});
