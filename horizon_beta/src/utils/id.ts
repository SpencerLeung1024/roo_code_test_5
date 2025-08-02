/**
 * Simple deterministic id generator based on an incrementing counter.
 * You can optionally seed the counter to stabilize sequences for tests.
 */

export interface IdGen {
  next: () => string;
  value: () => number;
}

export function createIdGen(seed = 1): IdGen {
  let counter = Math.max(0, Math.floor(seed));
  return {
    next: () => {
      counter += 1;
      return String(counter);
    },
    value: () => counter,
  };
}