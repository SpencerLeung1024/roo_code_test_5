import type { GameState } from './types';
import { appVersion } from '../data/version';

// Storage keys matching versioned state for future migration work.
export const STORAGE_KEY_STATE = 'uv/state';
export const STORAGE_KEY_VERSION = `uv/version/${appVersion}`;

// No-op persistence for this subtask; keep signatures ready.
export function loadState(): GameState | null {
 return null;
}

export function saveState(_state: GameState): void {
 // intentionally no-op for now
}

export function clearState(): void {
 // intentionally no-op for now
}