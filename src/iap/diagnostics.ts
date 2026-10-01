import type { IapDiagnostics } from './controller';

/** Plain-text store diagnostics for the Settings long-press (TestFlight QA). Pure. */
export function formatIapDiagnostics(d: IapDiagnostics): string {
  return [
    `RevenueCat: ${d.mode}${d.configured ? ', configured' : ', not configured'}`,
    `Status: ${d.status} · products ${d.productFetch}`,
    `Products priced: ${d.priced}/${d.requested} (returned ${d.returned})`,
    d.missing.length ? `Missing: ${d.missing.join(', ')}` : 'Missing: none',
    `Last error: ${d.error ?? 'none'}`,
  ].join('\n');
}
