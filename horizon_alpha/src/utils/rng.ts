/**
 * Deterministic seedable RNG (LCG) with helpers for dice.
 * This is intentionally simple and sufficient for demo purposes.
 */

export interface RNG {
  seed(seed: number | string): void;
  next(): number; // [0, 1)
  nextInt(n: number): number; // [0..n-1]
  nextDie(): number; // [1..6]
}

function hashSeedToInt(seed: number | string): number {
  // Simple 32-bit hash (xorshift over char codes)
  let h = 2166136261 >>> 0;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) || 1;
}

function createLCG() {
  // Parameters for 32-bit LCG
  let state = 123456789 >>> 0;
  const m = 0x100000000; // 2^32
  const a = 1664525;
  const c = 1013904223;

  return {
    seed(seed: number | string) {
      state = hashSeedToInt(seed) >>> 0;
    },
    next(): number {
      state = (Math.imul(state, a) + c) >>> 0;
      return (state >>> 0) / m;
    },
    nextInt(n: number): number {
      if (n <= 0) return 0;
      return Math.floor(this.next() * n) >>> 0;
    },
    nextDie(): number {
      return this.nextInt(6) + 1;
    }
  };
}

export const rng: RNG = createLCG();