import { requireOptionalNativeModule } from 'expo';

export interface StoreKitDiagnosticProduct {
  id: string;
  displayName: string;
  displayPrice: string;
  type: string;
}

export interface StoreKitDiagnosticResult {
  bundleId: string;
  build: string;
  products: StoreKitDiagnosticProduct[];
}

interface StoreKitDiagnosticNativeModule {
  lookupProducts(): Promise<StoreKitDiagnosticResult>;
}

/** Optional so Android, web, Expo Go, and tests report an error instead of crashing. */
export const StoreKitDiagnosticNative =
  requireOptionalNativeModule<StoreKitDiagnosticNativeModule>('StoreKitDiagnostic');
