/**
 * Deterministic seedable RNG using a 32-bit Linear Congruential Generator (LCG).
 * Given the same starting seed, sequences are reproducible across sessions.
 *
 * X_{n+1} = (a * X_n + c) mod m
 * Parameters (Numerical Recipes):
 *   a = 1664525
 *   c = 1013904223
 *   m = 2^32
 */

export interface RNG {
  seed: number;
  nextFloat: () => number; // [0, 1)
  nextInt: (min: number, max: number) => number; // inclusive bounds
}

export function createRNG(seed: number): RNG {
  let state = seed >>> 0;

  const next = () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state;
  };

  const nextFloat = () => {
    // Use 0x100000000 for 2^32 to cover full 32-bit range; result in [0,1)
    return next() / 0x100000000;
  };

  const nextInt = (min: number, max: number) => {
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new Error('nextInt expects integer bounds');
    }
    if (max < min) {
      throw new Error('nextInt: max < min');
    }
    const r = nextFloat();
    return Math.floor(r * (max - min + 1)) + min;
  };

  return {
    seed,
    nextFloat,
    nextInt,
  };
}