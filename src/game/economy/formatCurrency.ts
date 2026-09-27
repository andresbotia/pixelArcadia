/**
 * THE coin-balance formatter. Every coin readout (Home pill, gameplay HUD,
 * Store) goes through here — no component formats currency itself.
 *
 *   0 – 9,999     grouped in full        0 · 999 · 1,300 · 9,999
 *   10,000+       compact, one decimal   10K · 12.5K · 99.9K
 *   100 units+    compact, no decimal    125K · 999K
 *   millions+     same rules with M / B  1M · 1.2M · 12.3M · 1.2B
 *
 * Compact values round DOWN (truncate): a readout never shows more coins than
 * the player actually has (99,999 reads 99.9K, not 100K).
 */

/** Balances below this render in full. */
export const COMPACT_THRESHOLD = 10_000;

const UNITS: readonly (readonly [value: number, suffix: string])[] = [
  [1_000_000_000, 'B'],
  [1_000_000, 'M'],
  [1_000, 'K'],
];

function sanitize(n: number): number {
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

/** Full grouped integer: 1300 → "1,300". Negative / non-finite → "0". */
export function formatCoinsFull(n: number): string {
  return String(sanitize(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Display balance for tight UI (pills, HUD chips). See module doc for the rules. */
export function formatCurrency(n: number): string {
  const value = sanitize(n);
  if (value < COMPACT_THRESHOLD) return formatCoinsFull(value);

  for (const [unit, suffix] of UNITS) {
    if (value < unit) continue;
    const whole = Math.floor(value / unit);
    if (whole >= 100) return `${formatCoinsFull(whole)}${suffix}`;
    // Integer tenths avoid float artefacts (12,500 / 100 = 125 → "12.5").
    const tenths = Math.floor(value / (unit / 10));
    const decimal = tenths % 10;
    return decimal === 0 ? `${whole}${suffix}` : `${whole}.${decimal}${suffix}`;
  }
  return formatCoinsFull(value);
}

/** Screen-reader label: always the exact amount. */
export function coinsAccessibilityLabel(n: number): string {
  return `${formatCoinsFull(n)} coins`;
}
