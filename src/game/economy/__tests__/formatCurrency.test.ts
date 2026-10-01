import { coinsAccessibilityLabel, formatCoinsFull, formatCurrency } from '../formatCurrency';

describe('formatCurrency', () => {
  it('shows small balances in full', () => {
    expect(formatCurrency(0)).toBe('0');
    expect(formatCurrency(50)).toBe('50');
    expect(formatCurrency(300)).toBe('300');
  });

  it('15. 999', () => expect(formatCurrency(999)).toBe('999'));
  it('16. 1,300', () => expect(formatCurrency(1300)).toBe('1,300'));
  it('1,000 uses its full grouped value', () => expect(formatCurrency(1000)).toBe('1,000'));
  it('17. 9,999', () => expect(formatCurrency(9999)).toBe('9,999'));
  it('18. 10,000 → 10K', () => expect(formatCurrency(10_000)).toBe('10K'));
  it('19. 12,500 → 12.5K', () => expect(formatCurrency(12_500)).toBe('12.5K'));

  it('truncates rather than rounds up (never shows more than owned)', () => {
    expect(formatCurrency(99_999)).toBe('99.9K');
    expect(formatCurrency(12_599)).toBe('12.5K');
    expect(formatCurrency(10_050)).toBe('10K');
  });

  it('20. 100,000+ drops the decimal', () => {
    expect(formatCurrency(100_000)).toBe('100K');
    expect(formatCurrency(125_000)).toBe('125K');
    expect(formatCurrency(999_999)).toBe('999K');
  });

  it('21. 1,000,000+ switches to M (then B)', () => {
    expect(formatCurrency(1_000_000)).toBe('1M');
    expect(formatCurrency(1_200_000)).toBe('1.2M');
    expect(formatCurrency(12_345_678)).toBe('12.3M');
    expect(formatCurrency(250_000_000)).toBe('250M');
    expect(formatCurrency(1_500_000_000)).toBe('1.5B');
  });

  it('never renders garbage for bad input', () => {
    expect(formatCurrency(-5)).toBe('0');
    expect(formatCurrency(Number.NaN)).toBe('0');
    expect(formatCurrency(1300.9)).toBe('1,300');
  });

  it('keeps every compact readout within 5 glyphs up to 99.9K (pill-width budget)', () => {
    for (const n of [0, 999, 1300, 9999, 10_000, 12_500, 99_999, 100_000, 999_999, 1_200_000]) {
      expect(formatCurrency(n).length).toBeLessThanOrEqual(5);
    }
  });
});

describe('coin accessibility', () => {
  it('always speaks the exact amount', () => {
    expect(formatCoinsFull(12_500)).toBe('12,500');
    expect(coinsAccessibilityLabel(1_234_567)).toBe('1,234,567 coins');
  });
});
