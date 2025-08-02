import { TileType, type GameState, type Tile } from '../types';
import { getOwnableState, isMonopolyGroupOwned } from './ownership';

/**
 * Compute rent for landing on an ownable tile.
 * - Properties: base rent by house tier (0..5). If 0 houses and owner has full group, double base rent.
 * - Railroads: 25 * (2^(count-1)) simplified to [25, 50, 100, 200].
 * - Utilities: if one owned 4x roll, if both owned 10x roll (requires rollTotal).
 * - Mortgaged tiles rent = 0.
 */
export function computeRent(
  tile: Tile,
  ownerId: string,
  rollTotal: number | undefined,
  state: GameState
): number {
  const st = getOwnableState(state, tile.id);
  if (!st || st.mortgaged) return 0;

  switch (tile.type) {
    case TileType.Property: {
      const houses = Math.max(0, Math.min(5, st.houses));
      const baseRent = tile.baseRent ?? [];
      let rent = baseRent[houses] ?? 0;
      if (houses === 0 && tile.groupKey) {
        if (isMonopolyGroupOwned(state, ownerId, tile.groupKey)) {
          rent *= 2;
        }
      }
      return rent;
    }
    case TileType.Railroad: {
      // Count railroads owned by same owner
      let count = 0;
      for (const t of state.tiles) {
        if (t.type === TileType.Railroad) {
          const s = state.ownership[t.id];
          if (s?.ownerId === ownerId) count += 1;
        }
      }
      const table = [0, 25, 50, 100, 200];
      return table[Math.max(0, Math.min(4, count))];
    }
    case TileType.Utility: {
      let count = 0;
      for (const t of state.tiles) {
        if (t.type === TileType.Utility) {
          const s = state.ownership[t.id];
          if (s?.ownerId === ownerId) count += 1;
        }
      }
      const mult = count >= 2 ? 10 : 4;
      if (rollTotal == null) return 0; // cannot compute without the roll
      return mult * rollTotal;
    }
    default:
      return 0;
  }
}