import type { GameState, Player, CurrentPlayerJailInfo } from './types';
import { TurnPhase, SET_COLOR_CLASS, PLAYER_COLORS } from '../data/constants';

export const selectPlayers = (s: GameState): readonly Player[] => s.players;
export const selectCurrentPlayer = (s: GameState): Player | undefined => s.players[s.currentPlayerIndex];
export const selectTiles = (s: GameState) => s.tiles;
export const selectTurnInfo = (s: GameState) => s.turn;
export const selectLog = (s: GameState) => s.log;

// New selectors
export const selectPhase = (s: GameState): TurnPhase => s.turn.phase;
export const selectLastLogs = (s: GameState, count: number = 3): readonly string[] => s.log.slice(0, count);

// UI and tiles helpers
export const selectUI = (s: GameState) => s.ui;
export const selectTileById = (s: GameState, id: number) => s.tiles[id];
export const selectCurrentTile = (s: GameState) => {
  const p = selectCurrentPlayer(s);
  return p ? s.tiles[p.position] : undefined;
};

// Jail info for UI
export const selectCurrentPlayerJailInfo = (s: GameState): CurrentPlayerJailInfo | undefined => {
  const p = selectCurrentPlayer(s);
  if (!p) return undefined;
  return { status: p.jailStatus, turns: p.jailTurns, cards: p.getOutOfJailCards };
};

// Deck sizes helper
export const selectDeckSizes = (s: GameState) => ({
  chance: s.decks.chance.length,
  chanceDiscard: s.decks.chanceDiscard.length,
  community: s.decks.community.length,
  communityDiscard: s.decks.communityDiscard.length
});

// Players on a specific tile
export const selectPlayersOnTile = (s: GameState, tileIndex: number): readonly Player[] =>
  s.players.filter(p => p.position === tileIndex);

// Map property color group or tile.color to CSS class
export const selectColorForSet = (groupOrTile: { color?: string } | string): string => {
  const key = typeof groupOrTile === 'string' ? groupOrTile : groupOrTile.color ?? '';
  return SET_COLOR_CLASS[key] ?? '';
};

// Player color by id (with fallback cycling)
export const selectPlayerColor = (s: GameState, playerId: number): string => {
  const palette = PLAYER_COLORS;
  if (palette.length === 0) return '#888888';
  const idx = playerId >= 0 ? playerId % palette.length : 0;
  return palette[idx] ?? '#888888';
};