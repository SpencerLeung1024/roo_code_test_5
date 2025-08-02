import type { GameState, Versioned } from '../types';

export const SAVE_VERSION = 1;

/**
 * Shallow serialize: we currently just wrap with a version tag.
 * The state is JSON-safe already.
 */
export function serialize(state: GameState): Versioned<GameState> {
  return {
    version: SAVE_VERSION,
    data: state,
  };
}

/**
 * Shallow deserialize: validate version (no migrations yet) and return data.
 */
export function deserialize(payload: Versioned<GameState>): GameState {
  if (!payload || typeof payload.version !== 'number' || !payload.data) {
    throw new Error('deserialize: invalid payload');
  }
  if (payload.version !== SAVE_VERSION) {
    // In the future we can handle migrations here.
    // For now, accept only exact version.
    throw new Error(`deserialize: unsupported version ${payload.version} != ${SAVE_VERSION}`);
  }
  return payload.data;
}