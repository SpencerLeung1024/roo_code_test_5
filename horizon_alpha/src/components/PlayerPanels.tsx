import React from 'react';
import { useGameStore } from '../state/store';
import { selectPlayers, selectPlayerColor } from '../state/selectors';

export const PlayerPanels: React.FC = () => {
  const { state } = useGameStore();
  const players = selectPlayers(state);

  return (
    <div className="players">
      {players.map(p => {
        const color = selectPlayerColor(state, p.id);
        return (
          <div key={p.id} className="player">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span
                aria-hidden
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: color,
                  border: `2px solid ${color}`,
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.08)'
                }}
              />
              {p.name ?? `Player ${p.id + 1}`}
            </span>
            <strong>${p.cash}</strong>
          </div>
        );
      })}
    </div>
  );
};