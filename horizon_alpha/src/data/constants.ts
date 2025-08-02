/**
 * Core enums shared across the app.
 * Gameplay logic intentionally not implemented in this subtask.
 */
export enum TileKind {
  Go = 'GO',
  Property = 'PROPERTY',
  Railroad = 'RAILROAD',
  Utility = 'UTILITY',
  Chance = 'CHANCE',
  CommunityChest = 'COMMUNITY_CHEST',
  Tax = 'TAX',
  Jail = 'JAIL',
  GoToJail = 'GO_TO_JAIL',
  FreeParking = 'FREE_PARKING'
}

export enum CardKind {
  Chance = 'CHANCE',
  CommunityChest = 'COMMUNITY_CHEST'
}

export enum JailStatus {
  None = 'NONE',
  InJail = 'IN_JAIL'
}

/**
 * Turn phases for core skeleton.
 * Only Idle, Rolled, Moved, Resolve, End are used in this subtask.
 */
export enum TurnPhase {
  Idle = 'IDLE',
  Rolled = 'ROLLED',
  Moved = 'MOVED',
  Resolve = 'RESOLVE',
  End = 'END',
  InJailStart = 'IN_JAIL_START',
  InJailRolled = 'IN_JAIL_ROLLED'
}

/**
 * UI color classes for property sets.
 * These are CSS class suffixes used by selectors/Board.
 */
export const SET_COLOR_CLASS: Record<string, string> = {
  brown: 'set-brown',
  lightblue: 'set-lightblue',
  pink: 'set-pink',
  orange: 'set-orange',
  red: 'set-red',
  yellow: 'set-yellow',
  green: 'set-green',
  darkblue: 'set-darkblue'
};

/**
 * Player color palette for ownership and tokens.
 * Index corresponds to player id (0-based).
 */
export const PLAYER_COLORS: readonly string[] = [
  '#4cc9f0', // P1
  '#f72585', // P2
  '#f77f00', // P3
  '#2a9d8f', // P4
  '#e9c46a', // P5 fallback
  '#a8dadc'  // P6 fallback
];