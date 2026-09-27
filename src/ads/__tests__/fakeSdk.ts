/** Scriptable stand-in for the native SDK: tests fire every callback by hand. */
import type { AdFormat, AdHandle, AdHandleEvent, AdsSdk } from '../types';

export class FakeHandle implements AdHandle {
  readonly listeners = new Map<AdHandleEvent, (() => void)[]>();
  loadCalls = 0;
  showCalls = 0;
  destroyed = false;
  /** Replace to make show() reject / throw. */
  showImpl: () => Promise<void> = () => Promise.resolve();

  constructor(readonly format: AdFormat, readonly unitId: string) {}

  load(): void { this.loadCalls += 1; }
  show(): Promise<void> { this.showCalls += 1; return this.showImpl(); }
  on(event: AdHandleEvent, listener: () => void): void {
    this.listeners.set(event, [...(this.listeners.get(event) ?? []), listener]);
  }
  destroy(): void { this.destroyed = true; }
  emit(event: AdHandleEvent): void {
    for (const l of this.listeners.get(event) ?? []) l();
  }
}

export class FakeSdk implements AdsSdk {
  readonly handles: FakeHandle[] = [];
  initImpl: () => Promise<void> = () => Promise.resolve();

  initialize(): Promise<void> { return this.initImpl(); }
  create(format: AdFormat, unitId: string): AdHandle {
    const h = new FakeHandle(format, unitId);
    this.handles.push(h);
    return h;
  }
  /** Newest handle for a unit. */
  latest(unitId: string): FakeHandle {
    const found = [...this.handles].reverse().find((h) => h.unitId === unitId);
    if (!found) throw new Error(`no handle for ${unitId}`);
    return found;
  }
}

export const UNITS = {
  INTERSTITIAL_CAMPAIGN: 'unit-int',
  REWARDED_RETRY: 'unit-retry',
  REWARDED_HEART: 'unit-heart',
} as const;

/** Let pending promise callbacks (SDK init, show) run under fake timers. */
export async function flush(): Promise<void> {
  for (let i = 0; i < 5; i++) await Promise.resolve();
}
