/**
 * Simple currency formatter for placeholders.
 * TODO: Replace with configurable currency/locale handling if needed.
 */
export function formatMoney(value: number): string {
  const sign = value < 0 ? '-' : '';
  const num = Math.abs(value);
  return `${sign}$${num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}