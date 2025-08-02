/**
 * Basic formatting helpers for money values.
 */

export function formatMoney(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  return `${sign}$${abs.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function parseMoney(input: string): number {
  // Very lenient parser: strips non-digits except leading '-'
  const trimmed = input.trim();
  const neg = trimmed.startsWith('-');
  const digits = trimmed.replace(/[^0-9]/g, '');
  const n = Number(digits || '0');
  return neg ? -n : n;
}