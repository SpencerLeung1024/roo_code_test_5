import React, { useMemo } from 'react';
import { useGameStore } from '../state/store';
import { selectTiles, selectPlayersOnTile, selectColorForSet, selectPlayerColor } from '../state/selectors';
import type { BoardTile, PropertyTile } from '../data/board';
import { TileKind } from '../data/constants';

// Map board index (0..39) to 11x11 grid coords and rotation (deg)
type GridPos = { col: number; row: number; rot: number };

/* Keep the same movement/rotation logic (do not change gameplay).
   We still compute col/row/rot for any other logic, but the actual placement
   will now come from CSS grid-area classes (t0..t39). */
const INDEX_TO_GRID: readonly GridPos[] = (() => {
  const positions: GridPos[] = Array(40).fill(null as any);

  // Bottom row: indices 0..10 left->right on row 11, col 11..1 (0 at col11)
  for (let i = 0; i <= 10; i++) {
    positions[i] = { col: 11 - i, row: 11, rot: 0 };
  }
  // Left column: 11..20 bottom->top on col 1, row 10..1
  for (let i = 11; i <= 20; i++) {
    positions[i] = { col: 1, row: 21 - i, rot: 90 };
  }
  // Top row: 21..30 left->right on row 1, col 2..11
  for (let i = 21; i <= 30; i++) {
    positions[i] = { col: i - 19, row: 1, rot: 180 };
  }
  // Right column: 31..39 top->bottom on col 11, row 2..10
  for (let i = 31; i <= 39; i++) {
    positions[i] = { col: 11, row: i - 29, rot: 270 };
  }

  return positions;
})();

/* Map index to CSS grid-area class name "tN" */
function tileAreaClass(index: number): string {
  return `t${index}`;
}

const TileBox: React.FC<{
  tile: BoardTile;
  col: number;
  row: number;
  rot: number;
  players: readonly { id: number; name: string }[];
  ownerColor?: string;
  infoLine?: string;
}> = ({ tile, col, row, rot, players, ownerColor, infoLine }) => {
  const isProperty = tile.kind === TileKind.Property;
  const colorClass = isProperty ? selectColorForSet((tile as PropertyTile).color) : '';
  const style: React.CSSProperties = {
    gridColumn: col,
    gridRow: row,
    transform: `rotate(${rot}deg)`
  };

  const ownerStyle: React.CSSProperties = ownerColor
    ? { borderLeftColor: ownerColor, color: ownerColor }
    : {};

  return (
    <div className={`board-tile ${tile.kind.toLowerCase()} ${tileAreaClass(tile.index)} ${rot ? 'rot' : ''}`} style={style} title={tile.name}>
      {/* Inner content counter-rotated to remain readable */}
      <div className="tile-inner" style={{ transform: `rotate(${-rot}deg)` }}>
        {isProperty && <div className={`color-band ${colorClass}`} />}
        <div className={`tile-label ${ownerColor ? 'owner-colored' : ''}`} style={ownerStyle}>
          <div className="tile-name">{tile.name}</div>
          <div className="tile-sub">
            {infoLine ?? tile.kind}
          </div>
        </div>
        <div className="tile-players">
          {players.map(p => {
            const pc = selectPlayerColor((useGameStore().state), p.id);
            return (
              <span
                key={p.id}
                className="token"
                style={{ background: pc, borderColor: pc }}
                title={`P${p.id + 1} ${p.name}`}
              >
                {p.id + 1}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const Board: React.FC = () => {
  const { state } = useGameStore();
  const tiles = selectTiles(state);

  const renderTiles = useMemo(() => {
    return tiles.map((t, i) => {
      const gp = INDEX_TO_GRID[i];
      if (!gp) return null;
      const players = selectPlayersOnTile(state, i);

      // Owner colorization and concise info line
      let ownerColor: string | undefined;
      let infoLine: string | undefined;

      if ('ownerId' in (t as any) && typeof (t as any).ownerId === 'number') {
        const ownerId = (t as any).ownerId as number;
        if (!Number.isNaN(ownerId)) {
          ownerColor = selectPlayerColor(state, ownerId);
          infoLine = 'Owned';
        }
      } else {
        // show price when available (Property/Utility/Railroad often have price)
        const anyTile = t as any;
        if (typeof anyTile.price === 'number') {
          infoLine = `$${anyTile.price}`;
        } else {
          infoLine = t.kind;
        }
      }

      return (
        <TileBox
          key={i}
          tile={t as BoardTile}
          col={gp.col}
          row={gp.row}
          rot={gp.rot}
          players={players as any}
          ownerColor={ownerColor}
          infoLine={infoLine}
        />
      );
    });
  }, [tiles, state]);

  return (
    <div className="board11">
      {/* perimeter tiles */}
      {renderTiles}
      {/* center area */}
      <div className="board-center">
        <div className="center-placeholder">Ludus Centrum</div>
      </div>
    </div>
  );
};