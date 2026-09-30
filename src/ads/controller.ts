import {
  AD_LOAD_TIMEOUT_MS,
  AD_OPEN_TIMEOUT_MS,
  AD_RETRY_BASE_MS,
  AD_RETRY_MAX_MS,
  REWARD_GRACE_MS,
} from './config';
import {
  AD_PLACEMENTS,
  PLACEMENT_FORMAT,
  type AdAnalyticsEvent,
  type AdHandle,
  type AdLoadState,
  type AdPlacement,
  type AdRequestOptions,
  type AdsSdk,
  type ShowResult,
} from './types';

type Timer = ReturnType<typeof setTimeout>;

interface ShowSession {
  opened: boolean;
  earned: boolean;
  done: boolean;
  openTimer: Timer | null;
  graceTimer: Timer | null;
  resolve: (result: ShowResult) => void;
}

interface Slot {
  state: AdLoadState;
  handle: AdHandle | null;
  unitId: string | null;
  failures: number;
  retryTimer: Timer | null;
  loadTimer: Timer | null;
  session: ShowSession | null;
}

export interface AdsControllerOptions {
  requestOptions: () => AdRequestOptions;
  /** Dev logging (callback order, failures). */
  log?: (message: string) => void;
  /** Semantic analytics sink (M14). */
  track?: (event: AdAnalyticsEvent, props?: Record<string, string | number | boolean>) => void;
}

/**
 * THE ad state machine. One slot per placement, one single-use SDK handle per
 * slot. Every native callback is checked against the slot's CURRENT handle, so
 * late events from a discarded ad can never touch a new one.
 *
 * Guarantees:
 *  - `start()` never throws or blocks; init failure → every placement `unavailable`.
 *  - Only one full-screen ad at a time (`busy`).
 *  - A show always resolves exactly once — on close, error, show rejection, or
 *    an open watchdog — so no caller can get stuck behind an ad.
 *  - `rewarded` is set ONLY by the SDK's earned-reward event, at most once per
 *    show. Open/impression/close never imply it.
 *  - After any show attempt the used ad is destroyed and a fresh one loads.
 *  - Load failures retry with backoff; nothing ever shows without an explicit
 *    `show()` from an app flow (a load finishing in the background shows nothing).
 */
export class AdsController {
  private readonly slots = new Map<AdPlacement, Slot>();
  private readonly listeners = new Set<() => void>();
  private showing: AdPlacement | null = null;
  private started = false;
  private sdkReady = false;
  private sdkFailed = false;
  private interstitialsEnabled = true;

  constructor(
    private readonly sdk: AdsSdk | null,
    units: Readonly<Record<AdPlacement, string | null>>,
    private readonly options: AdsControllerOptions,
  ) {
    for (const p of AD_PLACEMENTS) {
      const unitId = units[p];
      this.slots.set(p, {
        state: sdk && unitId ? 'idle' : 'unavailable',
        handle: null, unitId, failures: 0, retryTimer: null, loadTimer: null, session: null,
      });
    }
  }

  /** Initialize the SDK once, in the background, then preload every placement. */
  start(): void {
    if (this.started) return;
    this.started = true;
    if (!this.sdk) { this.log('no SDK — ads unavailable'); return; }
    let init: Promise<void>;
    try {
      init = this.sdk.initialize();
    } catch (e) {
      this.fail(e);
      return;
    }
    init.then(() => {
      this.sdkReady = true;
      this.log('SDK initialized');
      for (const p of AD_PLACEMENTS) this.load(p);
    }, (e: unknown) => this.fail(e));
  }

  getState(placement: AdPlacement): AdLoadState {
    return this.slot(placement).state;
  }

  /** Remove Ads stops interstitial requests as well as shows; rewarded slots remain active. */
  setInterstitialsEnabled(enabled: boolean): void {
    if (this.interstitialsEnabled === enabled) return;
    this.interstitialsEnabled = enabled;
    const slot = this.slot('INTERSTITIAL_CAMPAIGN');
    if (!enabled) {
      if (slot.session) this.finishShow('INTERSTITIAL_CAMPAIGN', 'failed');
      this.clearTimer(slot, 'retryTimer');
      this.clearTimer(slot, 'loadTimer');
      this.discard(slot);
      this.setState('INTERSTITIAL_CAMPAIGN', 'unavailable');
    } else if (this.sdk && slot.unitId && !this.sdkFailed) {
      this.setState('INTERSTITIAL_CAMPAIGN', 'idle');
      this.load('INTERSTITIAL_CAMPAIGN');
    }
  }

  isShowing(): boolean {
    return this.showing !== null;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  track(event: AdAnalyticsEvent, props?: Record<string, string | number | boolean>): void {
    this.log(`event ${event}${props ? ` ${JSON.stringify(props)}` : ''}`);
    this.options.track?.(event, props);
  }

  /** (Re)load a placement if it isn't already loading/loaded/showing. */
  load(placement: AdPlacement): void {
    const slot = this.slot(placement);
    if (placement === 'INTERSTITIAL_CAMPAIGN' && !this.interstitialsEnabled) return;
    if (!this.sdk || !this.sdkReady || !slot.unitId) return;
    if (slot.state === 'loading' || slot.state === 'ready' || slot.state === 'showing' || slot.state === 'unavailable') return;
    this.clearTimer(slot, 'retryTimer');
    this.discard(slot);

    let handle: AdHandle;
    try {
      handle = this.sdk.create(PLACEMENT_FORMAT[placement], slot.unitId, this.options.requestOptions());
    } catch (e) {
      this.loadFailed(placement, `create threw: ${String(e)}`);
      return;
    }
    slot.handle = handle;
    const live = () => slot.handle === handle;

    handle.on('loaded', () => {
      if (!live() || slot.state !== 'loading') return;
      this.clearTimer(slot, 'loadTimer');
      slot.failures = 0;
      this.setState(placement, 'ready');
    });
    handle.on('error', () => {
      if (!live()) return;
      if (slot.state === 'loading') this.loadFailed(placement, 'load error');
      else if (slot.session) this.finishShow(placement, 'failed');
    });
    handle.on('opened', () => {
      if (!live() || !slot.session || slot.session.done) return;
      this.log(`${placement} opened`);
      slot.session.opened = true;
      if (slot.session.openTimer) { clearTimeout(slot.session.openTimer); slot.session.openTimer = null; }
    });
    handle.on('earned', () => {
      const s = slot.session;
      if (!live() || !s || s.done || s.earned) return;
      this.log(`${placement} earned reward`);
      s.earned = true;
    });
    handle.on('closed', () => {
      const s = slot.session;
      if (!live() || !s || s.done) return;
      this.log(`${placement} closed (earned=${String(s.earned)})`);
      if (PLACEMENT_FORMAT[placement] === 'rewarded' && !s.earned) {
        // iOS delivers the reward during playback, but give a late reward event
        // a short window before concluding there was none.
        if (!s.graceTimer) s.graceTimer = setTimeout(() => this.finishShow(placement, 'closed'), REWARD_GRACE_MS);
        return;
      }
      this.finishShow(placement, 'closed');
    });

    this.setState(placement, 'loading');
    slot.loadTimer = setTimeout(() => {
      if (live() && slot.state === 'loading') this.loadFailed(placement, 'load timeout');
    }, AD_LOAD_TIMEOUT_MS);
    try {
      handle.load();
    } catch (e) {
      this.loadFailed(placement, `load threw: ${String(e)}`);
    }
  }

  /**
   * Show a READY placement. Resolves exactly once with what happened; never
   * rejects. Only app flows call this — nothing shows on its own.
   */
  show(placement: AdPlacement): Promise<ShowResult> {
    const slot = this.slot(placement);
    if (this.showing !== null) return Promise.resolve({ outcome: 'busy', opened: false, rewarded: false });
    if (slot.state !== 'ready' || !slot.handle) {
      if (slot.state === 'idle' || slot.state === 'error') this.load(placement);
      return Promise.resolve({ outcome: 'unavailable', opened: false, rewarded: false });
    }
    const handle = slot.handle;
    this.showing = placement;
    this.setState(placement, 'showing');
    return new Promise<ShowResult>((resolve) => {
      const session: ShowSession = { opened: false, earned: false, done: false, openTimer: null, graceTimer: null, resolve };
      slot.session = session;
      session.openTimer = setTimeout(() => {
        if (!session.opened) this.finishShow(placement, 'failed');
      }, AD_OPEN_TIMEOUT_MS);
      let shown: Promise<void>;
      try {
        shown = handle.show();
      } catch (e) {
        this.log(`${placement} show threw: ${String(e)}`);
        this.finishShow(placement, 'failed');
        return;
      }
      shown.catch((e: unknown) => {
        this.log(`${placement} show rejected: ${String(e)}`);
        if (slot.session === session && !session.opened) this.finishShow(placement, 'failed');
      });
    });
  }

  // ── internals ────────────────────────────────────────────────────────────

  private finishShow(placement: AdPlacement, outcome: 'closed' | 'failed'): void {
    const slot = this.slot(placement);
    const s = slot.session;
    if (!s || s.done) return;
    s.done = true;
    if (s.openTimer) clearTimeout(s.openTimer);
    if (s.graceTimer) clearTimeout(s.graceTimer);
    slot.session = null;
    if (this.showing === placement) this.showing = null;
    // Single use: this ad is spent whatever happened. Load a fresh one.
    this.discard(slot);
    this.setState(placement, 'idle');
    s.resolve({ outcome, opened: s.opened, rewarded: s.earned });
    this.load(placement);
  }

  private loadFailed(placement: AdPlacement, why: string): void {
    const slot = this.slot(placement);
    this.clearTimer(slot, 'loadTimer');
    this.discard(slot);
    slot.failures += 1;
    const delay = Math.min(AD_RETRY_MAX_MS, AD_RETRY_BASE_MS * 2 ** (slot.failures - 1));
    this.log(`${placement} ${why}; retry in ${delay}ms`);
    this.setState(placement, 'error');
    this.clearTimer(slot, 'retryTimer');
    slot.retryTimer = setTimeout(() => {
      slot.retryTimer = null;
      this.load(placement);
    }, delay);
  }

  private fail(e: unknown): void {
    this.log(`SDK init failed: ${String(e)} — ads unavailable`);
    this.sdkFailed = true;
    for (const p of AD_PLACEMENTS) this.setState(p, 'unavailable');
  }

  private discard(slot: Slot): void {
    const h = slot.handle;
    slot.handle = null;
    if (!h) return;
    try { h.destroy(); } catch { /* already gone */ }
  }

  private clearTimer(slot: Slot, key: 'retryTimer' | 'loadTimer'): void {
    const t = slot[key];
    if (t) clearTimeout(t);
    slot[key] = null;
  }

  private setState(placement: AdPlacement, state: AdLoadState): void {
    const slot = this.slot(placement);
    if (slot.state === state) return;
    slot.state = state;
    for (const l of this.listeners) {
      try { l(); } catch { /* a UI listener never breaks the ad layer */ }
    }
  }

  private slot(placement: AdPlacement): Slot {
    return this.slots.get(placement)!;
  }

  private log(message: string): void {
    this.options.log?.(`[ads] ${message}`);
  }
}
