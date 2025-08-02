import { describe, it, expect, beforeEach } from 'vitest';
import { saveGame, loadGame, clearGame } from '../persistence/persist';
import { createNewGame } from '../data/init';
import '../tests/setup';

describe('persistence round-trip', () => {
  const seed = 42;

  beforeEach(() => {
    const store: Record<string, string> = {};
    const storage: Storage = {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => { store[k] = String(v); },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      key: (i: number) => Object.keys(store)[i] ?? null,
      get length() { return Object.keys(store).length; },
    } as Storage;
    Object.defineProperty(global, 'localStorage', {
      configurable: true,
      value: storage,
      writable: true,
    });
  });

  it('saves and loads a minimal game state', () => {
    const state = createNewGame(['A', 'B'], seed);
    saveGame(state);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    if (!loaded) throw new Error('expected loaded state');
    expect(loaded.players.length).toBe(2);
    expect(loaded.players[0].cash).toBeGreaterThan(0);
    expect(Array.isArray(loaded.tiles)).toBe(true);
    expect(loaded.tiles.length).toBeGreaterThan(0);
    clearGame();
    expect(loadGame()).toBeNull();
  });
});