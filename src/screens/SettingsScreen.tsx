import { LinearGradient } from 'expo-linear-gradient';
import { memo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorAssist } from '@/hooks/useColorAssist';
import { adConsent } from '@/ads/service';
import { openPrivacyPolicy, PRIVACY_POLICY_URL } from '@/ads/consent';
import { useRestorePurchases } from '@/hooks/useRestorePurchases';
import { formatIapDiagnostics } from '@/iap/diagnostics';
import { IAP_IDS } from '@/iap/catalog';
import type { IapDiagnostics } from '@/iap/controller';
import { purchases } from '@/iap/service';
import { StoreKitDiagnosticNative, type StoreKitDiagnosticResult } from '../../modules/storekit-diagnostic';
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
type StoreKitState =
  | { status: 'notRun' | 'loading' }
  | { status: 'success'; result: StoreKitDiagnosticResult }
  | { status: 'error'; message: string };

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
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [revenueCatDiagnostic, setRevenueCatDiagnostic] = useState<IapDiagnostics | null>(null);
  const [storeKit, setStoreKit] = useState<StoreKitState>({ status: 'notRun' });
  const restoreDisabled = restore.running || restore.busy;
  const privacyOptionsRequired = useSyncExternalStore(
    (listener) => adConsent.subscribe(listener),
    () => adConsent.isPrivacyOptionsRequired(),
  );

  function showStoreDiagnostics(): void {
    setRevenueCatDiagnostic(purchases().diagnostics());
    setDiagnosticOpen(true);
  }

  async function runStoreKitDiagnostic(): Promise<void> {
    if (storeKit.status === 'loading') return;
    setRevenueCatDiagnostic(purchases().diagnostics());
    setStoreKit({ status: 'loading' });
    try {
      if (!StoreKitDiagnosticNative) throw new Error('StoreKit diagnostic native module is unavailable in this build.');
      const result = await StoreKitDiagnosticNative.lookupProducts();
      setStoreKit({ status: 'success', result });
      console.log('[iap] Direct StoreKit returned IDs:', result.products.map((p) => p.id).join(', ') || 'none');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStoreKit({ status: 'error', message });
      console.warn('[iap] Direct StoreKit lookup error:', message);
    }
  }

  const returnedProducts = storeKit.status === 'success' ? storeKit.result.products : [];
  const returnedIds = new Set(returnedProducts.map((product) => product.id));
  const missingIds = IAP_IDS.filter((id) => !returnedIds.has(id));

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
      <Modal visible={diagnosticOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setDiagnosticOpen(false)}>
        <SafeAreaView style={styles.diagnosticRoot}>
          <View style={styles.diagnosticHeader}>
            <Text style={styles.diagnosticTitle}>Store diagnostics</Text>
            <Pressable onPress={() => setDiagnosticOpen(false)} accessibilityRole="button" accessibilityLabel="Close store diagnostics">
              <Text style={styles.diagnosticButtonText}>Close</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.diagnosticContent}>
            <Text style={styles.diagnosticText}>RevenueCat: {revenueCatDiagnostic ? `${revenueCatDiagnostic.returned}/${revenueCatDiagnostic.requested}` : 'unavailable'}</Text>
            <Text style={styles.diagnosticText}>
              Direct StoreKit: {storeKit.status === 'notRun' ? 'Not Run' : storeKit.status === 'loading' ? 'Loading...' : storeKit.status === 'error' ? 'ERROR' : `${returnedProducts.length}/${IAP_IDS.length}`}
            </Text>
            {storeKit.status === 'error' ? <Text style={styles.diagnosticText}>Error: {storeKit.message}</Text> : null}
            {storeKit.status === 'success' ? (
              <>
                <Text style={styles.diagnosticText}>Bundle ID: {storeKit.result.bundleId}</Text>
                <Text style={styles.diagnosticText}>Build: {storeKit.result.build}</Text>
                <Text style={styles.diagnosticText}>StoreKit returned:</Text>
                {returnedProducts.length ? returnedProducts.map((product) => (
                  <Text key={product.id} style={styles.diagnosticDetail}>✓ {product.id}{'\n'}  {product.displayName} · {product.displayPrice} · {product.type}</Text>
                )) : <Text style={styles.diagnosticDetail}>None</Text>}
                <Text style={styles.diagnosticText}>StoreKit missing:</Text>
                {missingIds.length ? missingIds.map((id) => <Text key={id} style={styles.diagnosticDetail}>✗ {id}</Text>) : <Text style={styles.diagnosticDetail}>None</Text>}
              </>
            ) : null}
            <Pressable
              onPress={() => void runStoreKitDiagnostic()}
              disabled={storeKit.status === 'loading'}
              accessibilityRole="button"
              accessibilityLabel="Run StoreKit Diagnostic"
              accessibilityState={{ disabled: storeKit.status === 'loading', busy: storeKit.status === 'loading' }}
              style={[styles.diagnosticButton, storeKit.status === 'loading' && styles.dim]}
            >
              <Text style={styles.diagnosticButtonText}>Run StoreKit Diagnostic</Text>
            </Pressable>
            {revenueCatDiagnostic ? <Text style={styles.diagnosticDetail}>{formatIapDiagnostics(revenueCatDiagnostic)}</Text> : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  diagnosticRoot: { flex: 1, backgroundColor: AV.shellBottom },
  diagnosticHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  diagnosticTitle: { fontFamily: AV_FONT.bold, fontSize: 20, color: AV.white },
  diagnosticContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 10 },
  diagnosticText: { fontFamily: AV_FONT.semibold, fontSize: 16, color: AV.white },
  diagnosticDetail: { fontFamily: AV_FONT.medium, fontSize: 13, lineHeight: 20, color: AV.textSecondary },
  diagnosticButton: { alignSelf: 'flex-start', backgroundColor: AV.glass, borderColor: AV.glassBorder, borderWidth: 1, borderRadius: 12, padding: 14, marginVertical: 8 },
  diagnosticButtonText: { fontFamily: AV_FONT.bold, fontSize: 15, color: AV.white },
});
