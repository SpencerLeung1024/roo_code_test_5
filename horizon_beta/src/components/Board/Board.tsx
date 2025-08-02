import { useMemo } from 'react';
import type { GameState } from '../../types';
import Tile from './Tile';
import css from './Board.module.css';

type Props = {
  state: GameState;
};

export default function Board({ state }: Props) {
  const { tiles, ownership, players, currentPlayerIndex } = state;

  // Build a 11x11 grid; place 40 tiles around the edge, center is empty.
  const grid = useMemo(() => {
    const N = 11;
    const cells: Array<{ row: number; col: number; tileIndex: number | null }> = [];

    // Map board indices (0..39) clockwise starting at GO at (row 10, col 10)
    const map: Array<{ r: number; c: number }> = [];

    // Bottom row (right -> left): indices 0..10
    for (let c = 10; c >= 0; c--) map.push({ r: 10, c });

    // Left column (bottom -> top), excluding corners: indices 11..19
    for (let r = 9; r >= 1; r--) map.push({ r, c: 0 });

    // Top row (left -> right): indices 20..30
    for (let c = 0; c <= 10; c++) map.push({ r: 0, c });

    // Right column (top -> bottom), excluding corners: indices 31..39
    for (let r = 1; r <= 9; r++) map.push({ r, c: 10 });

    const byCoord: Record<string, number> = {};
    map.forEach((pos, idx) => {
      byCoord[`${pos.r},${pos.c}`] = idx;
    });

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const key = `${r},${c}`;
        const ti = byCoord[key] ?? null;
        cells.push({ row: r, col: c, tileIndex: ti });
      }
    }
    return { N, cells };
  }, []);

  const currentPlayerId = players[currentPlayerIndex]?.id ?? null;

  return (
    <div className={css.board}>
      {grid.cells.map((cell, i) => {
        const isCenter = cell.row > 0 && cell.row < 10 && cell.col > 0 && cell.col < 10;
        if (isCenter) {
          return <div key={i} />;
        }
        if (cell.tileIndex == null) {
          return <div key={i} />;
        }
        const tile = tiles[cell.tileIndex];
        return (
          <div key={i} className={css.tileCell}>
            <Tile
              tile={tile}
              ownership={ownership}
              players={players}
              tileIndex={cell.tileIndex}
              currentPlayerId={currentPlayerId}
            />
          </div>
        );
      })}
      <div className={css.center}>Monopoly-like Board</div>
    </div>
  );
}