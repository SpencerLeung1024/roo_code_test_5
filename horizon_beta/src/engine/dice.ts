import type { DiceResult } from '../types';
import type { RNG } from '../utils/rng';

export function roll2d6(rng: RNG): DiceResult {
  const d1 = rng.nextInt(1, 6);
  const d2 = rng.nextInt(1, 6);
  const total = d1 + d2;
  return { d1, d2, total, isDouble: d1 === d2 };
}