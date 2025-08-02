/**
 * Minimal runtime guards (stubs).
 * TODO: Expand with full domain validation (tiles, cards, players, moves).
 */

export function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

export function isPositiveInt(v: unknown): v is number {
  return Number.isInteger(v) && (v as number) > 0;
}