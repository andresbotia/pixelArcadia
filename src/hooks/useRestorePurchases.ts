import { useCallback, useState } from 'react';

import { feedback } from '@/game/feedback';
import type { RestoreOutcome } from '@/iap/types';
import { usePurchases } from './usePurchases';

/** Player-facing result line for each restore outcome. */
export const RESTORE_OUTCOME_TEXT: Record<RestoreOutcome, string> = {
  restored: 'Purchases restored.',
  nothingToRestore: 'No purchases found.',
  failed: 'Restore failed. Please try again.',
  unavailable: 'Purchases are unavailable right now.',
};

/**
 * Restore Purchases UI state, shared by the Store and Settings rows. All store
 * work stays in the central IAP controller (`purchases().restore()`): it
 * restores the Remove Ads entitlement and never re-grants consumables.
 */
export function useRestorePurchases(): {
  restore: () => Promise<void>;
  running: boolean;
  /** Another purchase/restore is in flight in the controller. */
  busy: boolean;
  message: string | null;
} {
  const iap = usePurchases();
  const busy = iap.activeOperation !== null;
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { restore: runRestore } = iap;

  const restore = useCallback(async () => {
    if (running || busy) return;
    setRunning(true);
    setMessage(null);
    const outcome = await runRestore();
    setRunning(false);
    setMessage(RESTORE_OUTCOME_TEXT[outcome]);
    if (outcome === 'restored') feedback.emit('reward');
  }, [running, busy, runRestore]);

  return { restore, running, busy, message };
}
