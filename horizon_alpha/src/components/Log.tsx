import React from 'react';
import { useGameStore } from '../state/store';
import { selectLastLogs } from '../state/selectors';

export const Log: React.FC = () => {
  const { state } = useGameStore();
  const items = selectLastLogs(state, 20);

  return (
    <ol className="log-list">
      {items.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ol>
  );
};