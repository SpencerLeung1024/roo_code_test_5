import { useMemo } from 'react';
import type { GameState, Tile } from '../../types';
import { formatMoney } from '../../utils/format';
import css from './Sidebar.module.css';

type Props = {
  state: GameState;
};

function getGroupColor(groupKey?: string) {
  const map: Record<string, string> = {
    BROWN: '#9b6a43',
    LIGHT_BLUE: '#87cefa',
    PINK: '#ff69b4',
    ORANGE: '#ffa500',
    RED: '#ff4d4d',
    YELLOW: '#ffd700',
    GREEN: '#2ecc71',
    DARK_BLUE: '#1e3799',
  };
  return groupKey ? (map[groupKey] ?? '#ccc') : '#ccc';
}

export default function Sidebar({ state }: Props) {
  const currentPlayer = state.players[state.currentPlayerIndex];

  const ownedByPlayer = useMemo(() => {
    const list: Array<{ tile: Tile; houses: number; mortgaged: boolean }> = [];
    for (const [tileIdStr, own] of Object.entries(state.ownership)) {
      const tileId = Number(tileIdStr);
      if (!own) continue;
      if (own.ownerId === currentPlayer.id) {
        const tile = state.tiles[tileId];
        list.push({ tile, houses: own.houses, mortgaged: own.mortgaged });
      }
    }
    return list.sort((a, b) => a.tile.id - b.tile.id);
  }, [state.ownership, state.tiles, currentPlayer.id]);

  return (
    <div className={css.sidebar}>
      <div className={css.panel}>
        <div className={css.header}>Current Player</div>
        <div className={css.playerItem}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className={css.badge} style={{ background: '#3498db' }} />
            <strong>{currentPlayer.name}</strong>
          </div>
          <div>Cash: {formatMoney(currentPlayer.cash)}</div>
        </div>
        {currentPlayer.inJail && <div>In Jail (turns: {currentPlayer.jailTurns})</div>}
        {currentPlayer.pendingDebt > 0 && <div>Debt: {formatMoney(currentPlayer.pendingDebt)}</div>}
      </div>

      <div className={css.panel}>
        <div className={css.header}>Owned Properties</div>
        <div className={css.propList}>
          {ownedByPlayer.length === 0 && <div>None</div>}
          {ownedByPlayer.map(({ tile, houses, mortgaged }) => (
            <div key={tile.id} className={css.propRow}>
              {'groupKey' in tile && (
                <span
                  className={css.badge}
                  style={{ background: getGroupColor((tile as any).groupKey) }}
                />
              )}
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tile.name}
              </span>
              <span>{houses === 5 ? 'Hotel' : houses > 0 ? `${houses}h` : ''}</span>
              {mortgaged && <span title="Mortgaged">M</span>}
            </div>
          ))}
        </div>
      </div>

      <div className={css.panel}>
        <div className={css.header}>Players</div>
        {state.players.map((p, idx) => {
          const isCurrent = idx === state.currentPlayerIndex;
          return (
            <div key={p.id} className={css.playerItem}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className={css.badge} style={{ background: '#'+((idx*1234567)&0xffffff).toString(16).padStart(6,'0') }} />
                <span style={{ fontWeight: isCurrent ? 700 : 400 }}>
                  {isCurrent ? '➡ ' : ''}{p.name}
                </span>
              </div>
              <div style={{ fontSize: 12 }}>
                Pos {p.position} · {formatMoney(p.cash)} {p.inJail ? ' · Jail' : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}