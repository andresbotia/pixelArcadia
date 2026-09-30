import { useCallback, useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import {
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_600SemiBold,
  Rubik_700Bold,
  Rubik_800ExtraBold,
  Rubik_900Black,
} from '@expo-google-fonts/rubik';
import { PixelifySans_600SemiBold } from '@expo-google-fonts/pixelify-sans';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { startAds } from '@/ads/service';
import { analytics, startAnalytics } from '@/analytics/service';
import { BootSplash } from '@/components/boot/BootSplash';
import { startPurchases } from '@/iap/service';
import { gameCenter } from '@/services/gameCenter';
import { preloadSaveData } from '@/storage/boot';
import { peekEconomy } from '@/storage/economy';
import { onHeartsRegenerated, peekHearts } from '@/storage/hearts';
import { getCachedRemoveAds } from '@/storage/iap';
import { loadProgress } from '@/storage/progress';
import { AV } from '@/theme/arcadiaV2';
import { BOOT_SPLASH } from '@/theme/bootSplash';

void SplashScreen.preventAutoHideAsync();

// Analytics (M14): super properties + the heart-regen observer BEFORE the boot
// preload, so hearts regenerated while the app was closed (reconciled during
// that preload) are captured too. Both are synchronous and cannot throw.
startAnalytics();
onHeartsRegenerated((e) => analytics.heartRegenerated({
  amount: e.amount,
  heartsAfter: e.heartsAfter,
  offlineElapsedMinutes: e.elapsedMs === null ? null : Math.round(e.elapsedMs / 60_000),
}));

/**
 * After the saves load: the one `app_opened` of this cold start, then
 * progression properties / ceiling check. Fire-and-forget.
 */
async function openAnalyticsSession(): Promise<void> {
  try {
    const progress = await loadProgress();
    analytics.appOpened({
      highestUnlocked: progress.highestUnlockedLevel,
      coins: peekEconomy()?.coins ?? 0,
      hearts: peekHearts()?.hearts ?? null,
      removeAdsOwned: getCachedRemoveAds(),
    });
    analytics.progressUpdated(progress.highestUnlockedLevel);
  } catch { /* analytics never affects the app */ }
}

export default function RootLayout() {
  // Live wordmark font + the v2 UI faces (Rubik for all UI and numbers,
  // Pixelify Sans for tiny brand captions). Home mounts underneath the boot
  // loader immediately; the loader lifts once these AND the saves are ready.
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_700Bold,
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_600SemiBold,
    Rubik_700Bold,
    Rubik_800ExtraBold,
    Rubik_900Black,
    PixelifySans_600SemiBold,
  });

  // M10 launch: native splash (static, same colour + logo) → `BootSplash`
  // (hides the native one on its first matching frame) → Home. Nothing here
  // waits on a timer except the safety cap for a storage call that never
  // answers; a fast boot goes straight through.
  const [savesReady, setSavesReady] = useState(false);
  const [bootVisible, setBootVisible] = useState(true);
  useEffect(() => {
    let alive = true;
    const settle = () => { if (alive) setSavesReady(true); };
    const cap = setTimeout(settle, BOOT_SPLASH.bootTimeoutMs);
    void preloadSaveData().then(() => {
      settle();
      void openAnalyticsSession();
      // Purchases (M13) start after the saves load, so the cached Remove Ads
      // entitlement applies to the ads policy at once — even offline — and
      // RevenueCat then reconciles in the background. Nothing waits on it.
      startPurchases();
      // The cached Remove Ads policy is applied synchronously above, before
      // the ad controller can request its first interstitial.
      startAds();
    });
    return () => { alive = false; clearTimeout(cap); };
  }, []);
  const bootReady = savesReady && (fontsLoaded || !!fontError);
  const hideNativeSplash = useCallback(() => { void SplashScreen.hideAsync(); }, []);
  const finishBoot = useCallback(() => setBootVisible(false), []);

  // Game Center is additive: sign-in runs in the background (GameKit shows
  // its own sheet if needed) and never gates the app. iOS only; no-op elsewhere.
  useEffect(() => { gameCenter.start(); }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {/*
          UI-R7 transition language. `slide_from_right` on Home → Worlds →
          World Levels resolves to the platform default push on iOS (per
          react-native-screens — it's an Android-only override; iOS already
          uses its own fast native push) and is left without an explicit
          `animationDuration`, since that option only customises
          `fade`/`fade_from_bottom`/`slide_from_bottom`/`simple_push`. Back
          navigation automatically reverses whichever animation a screen
          pushed with — no separate "back" language to maintain.
          `game` gets its own `fade_from_bottom` ("entering the stage") at a
          deliberately short 280ms — the previous unconfigured `fade` default
          was iOS's own 500ms, over this milestone's target ceiling.
        */}
        <Stack
          screenOptions={{
            headerShown: false,
            // v2 shell blue, so Home ⇄ gameplay fades never flash dark navy.
            contentStyle: { backgroundColor: AV.shellBottom },
            animation: 'fade',
            animationDuration: 220,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="shop" options={{ animation: 'fade', animationDuration: 220 }} />
          <Stack.Screen name="leaderboard" options={{ animation: 'fade', animationDuration: 220 }} />
          <Stack.Screen name="settings" options={{ animation: 'fade', animationDuration: 220 }} />
          <Stack.Screen name="worlds" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="world/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="game" options={{ animation: 'fade_from_bottom', animationDuration: 280 }} />
        </Stack>
        {bootVisible ? (
          <BootSplash ready={bootReady} onHandoff={hideNativeSplash} onDone={finishBoot} />
        ) : null}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
