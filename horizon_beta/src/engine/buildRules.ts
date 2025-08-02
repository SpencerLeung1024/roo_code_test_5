import type { GameState, Tile } from '../types';
import { TileType } from '../types';

/**
 * Stubs for build/sell/mortgage rules. These return booleans for validations only.
 * Full logic can be implemented later.
 */

export function canBuildHouse(state: GameState, playerId: string, tile: Tile): boolean {
  if (tile.type !== TileType.Property) return false;
  const own = state.ownership[tile.id];
  if (!own || own.ownerId !== playerId) return false;
  if (own.mortgaged) return false;
  if (own.houses >= 5) return false; // hotel max
  // Simplified: require monopoly group
  if (!tile.groupKey) return false;
  const groupTiles = state.tiles.filter(t => t.type === TileType.Property && t.groupKey === tile.groupKey);
  const ownsAll = groupTiles.every(t => state.ownership[t.id]?.ownerId === playerId);
  return ownsAll;
}

export function canSellHouse(state: GameState, playerId: string, tile: Tile): boolean {
  if (tile.type !== TileType.Property) return false;
  const own = state.ownership[tile.id];
  if (!own || own.ownerId !== playerId) return false;
  return own.houses > 0;
}

export function canMortgage(state: GameState, playerId: string, tile: Tile): boolean {
  if (tile.type !== TileType.Property && tile.type !== TileType.Railroad && tile.type !== TileType.Utility) return false;
  const own = state.ownership[tile.id];
  if (!own || own.ownerId !== playerId) return false;
  if (own.mortgaged) return false;
  // Simplified: cannot mortgage with any houses/hotels
  return (own.houses ?? 0) === 0;
}

export function canUnmortgage(state: GameState, playerId: string, tile: Tile): boolean {
  if (tile.type !== TileType.Property && tile.type !== TileType.Railroad && tile.type !== TileType.Utility) return false;
  const own = state.ownership[tile.id];
  if (!own || own.ownerId !== playerId) return false;
  return own.mortgaged === true;
}