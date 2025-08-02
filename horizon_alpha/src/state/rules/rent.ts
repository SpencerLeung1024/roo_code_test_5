import { TileKind } from "../../data/constants";
import type { BoardTile } from "../../data/board";

/**
 * Compute base rent for a tile.
 * For this subtask:
 * - Property: rentTable[0]
 * - Railroad: flat 25
 * - Utility: flat 10
 * Ignore color sets and dice multipliers for now. Pure function.
 */
export function computeBaseRent(
  tile: BoardTile & { rentTable?: number[] },
  _ownerProps: readonly number[]
): number {
  switch (tile.kind) {
    case TileKind.Property: {
      const base = Array.isArray(tile.rentTable) && tile.rentTable.length > 0 ? tile.rentTable[0]! : 10;
      return typeof base === 'number' ? base : 10;
    }
    case TileKind.Railroad:
      return 25;
    case TileKind.Utility:
      return 10;
    default:
      return 0;
  }
}