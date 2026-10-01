import AsyncStorage from '@react-native-async-storage/async-storage';

/** Redacted, opt-in local Simulator trace. Never enabled in an EAS profile. */
const enabled = process.env.EXPO_PUBLIC_IAP_DIAGNOSTICS === '1';
const lines: string[] = [];

export function recordIapDiagnostic(line: string): void {
  if (!enabled) return;
  lines.push(line);
  console.log(`[iap] ${line}`);
  void AsyncStorage.setItem('@m17d1_iap_diagnostics', JSON.stringify(lines));
}
