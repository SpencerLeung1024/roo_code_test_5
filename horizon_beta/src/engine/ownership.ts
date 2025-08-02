import { TileType, type GameState, type OwnableState, type Tile } from '../types';

export function isOwnable(tile: Tile): boolean {
  return (
    tile.type === TileType.Property ||
    tile.type === TileType.Railroad ||
    tile.type === TileType.Utility
  );
}

export function getOwnableState(state: GameState, tileId: number): OwnableState | undefined {
  return state.ownership[tileId];
}

export function ensureOwnableState(state: GameState, tileId: number): OwnableState {
  let s = state.ownership[tileId];
  if (!s) {
    s = { ownerId: null, mortgaged: false, houses: 0 };
    state.ownership[tileId] = s;
  }
  return s;
}

export function assignOwnership(state: GameState, tileId: number, playerId: string | null): void {
  const st = ensureOwnableState(state, tileId);
  st.ownerId = playerId;
}

export function isMortgaged(state: GameState, tileId: number): boolean {
  const st = getOwnableState(state, tileId);
  return !!st?.mortgaged;
}

export function countOwnedInGroup(state: GameState, ownerId: string, groupKey: string): number {
  return state.tiles.reduce((acc, t) => {
    if (t.type === TileType.Property && t.groupKey === groupKey) {
      const st = state.ownership[t.id];
      if (st?.ownerId === ownerId) acc += 1;
    }
    return acc;
  }, 0);
}

export function totalInGroup(state: GameState, groupKey: string): number {
  return state.tiles.filter(t => t.type === TileType.Property && t.groupKey === groupKey).length;
}

export function isMonopolyGroupOwned(state: GameState, ownerId: string, groupKey: string): boolean {
  const total = totalInGroup(state, groupKey);
  if (total === 0) return false;
  return countOwnedInGroup(state, ownerId, groupKey) === total;
}

export function getOwnerId(state: GameState, tileId: number): string | null {
  const s = state.ownership[tileId];
  return s?.ownerId ?? null;
}