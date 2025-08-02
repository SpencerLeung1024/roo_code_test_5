import type { GameState, Versioned } from '../types';
import { serialize, deserialize } from '../engine/serialization';

const STORAGE_KEY = 'uv-monopoly-v1';

function isMinimalValidState(s: GameState | null): s is GameState {
  if (!s) return false;
  if (!Array.isArray(s.players)) return false;
  if (!Array.isArray(s.tiles)) return false;
  if (s.tiles.length <= 0) return false;
  return true;
}

export function saveGame(state: GameState): void {
  try {
    const payload: Versioned<GameState> = serialize(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage errors for now
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw) as Versioned<GameState>;
    const state = deserialize(payload);
    return isMinimalValidState(state) ? state : null;
  } catch {
    return null;
  }
}

export function clearGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}