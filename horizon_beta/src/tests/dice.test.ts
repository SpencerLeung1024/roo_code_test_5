import { describe, it, expect } from 'vitest';
import { createRNG } from '../utils/rng';
import { roll2d6 } from '../engine/dice';

describe('roll2d6', () => {
  it('produces values within 1..6 and correct totals', () => {
    const rng = createRNG(123);
    const r = roll2d6(rng);
    expect(r.d1).toBeGreaterThanOrEqual(1);
    expect(r.d1).toBeLessThanOrEqual(6);
    expect(r.d2).toBeGreaterThanOrEqual(1);
    expect(r.d2).toBeLessThanOrEqual(6);
    expect(r.total).toBe(r.d1 + r.d2);
  });

  it('is deterministic for a given RNG seed sequence', () => {
    const rng1 = createRNG(42);
    const rng2 = createRNG(42);
    const a = roll2d6(rng1);
    const b = roll2d6(rng2);
    expect(a).toEqual(b);
  });
});