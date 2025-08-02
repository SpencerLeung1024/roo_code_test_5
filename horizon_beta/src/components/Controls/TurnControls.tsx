import { useMemo, useState } from 'react';
import type { GameState } from '../../types';
import styles from './TurnControls.module.css';

type Props = {
  state: GameState | null;
  actions: {
    newGame: (players: string[], seed?: number) => void;
    roll: () => void;
    resolve: () => void;
    endTurn: () => void;
    buyCurrentProperty: () => void;
    attemptLeaveJailPay: () => void;
    attemptLeaveJailRoll: () => void;
  };
};

export default function TurnControls({ state, actions }: Props) {
  const [names, setNames] = useState('Alice,Bob');

  const phase = state?.turn.phase;
  const prompt = state?.turn.ui.prompt ?? null;
  const inJail = !!state?.players[state.currentPlayerIndex]?.inJail;

  const canRoll = useMemo(() => {
    return !!state && (phase === 'PRE_ROLL' || (inJail && phase === 'IN_JAIL'));
  }, [state, phase, inJail]);

  const canResolve = useMemo(() => {
    return !!state && (phase === 'RESOLVE_TILE' || prompt === 'PAY_RENT' || prompt === 'DRAW_CARD' || prompt === 'BUY_PROPERTY');
  }, [state, phase, prompt]);

  const canEndTurn = useMemo(() => {
    return !!state && phase === 'END_TURN';
  }, [state, phase]);

  const onNewGame = () => {
    const players = names.split(',').map(s => s.trim()).filter(Boolean);
    if (players.length >= 2) {
      actions.newGame(players);
    } else {
      alert('Enter at least two players, comma separated.');
    }
  };

  return (
    <div className={styles.wrap}>
      {!state && (
        <div className={styles.row}>
          <input
            value={names}
            onChange={e => setNames(e.target.value)}
            placeholder="Players: Alice,Bob"
          />
          <button className={styles.btn} onClick={onNewGame}>New Game</button>
        </div>
      )}

      {state && (
        <>
          <div className={styles.row}>
            <button className={styles.btn} onClick={() => actions.roll()} disabled={!canRoll}>Roll</button>
            <button className={styles.btn} onClick={() => actions.resolve()} disabled={!canResolve}>Resolve</button>
            <button className={styles.btn} onClick={() => actions.endTurn()} disabled={!canEndTurn}>End Turn</button>
            <button className={styles.btn} onClick={() => actions.buyCurrentProperty()} disabled={prompt !== 'BUY_PROPERTY'}>Buy Property</button>
          </div>

          {inJail && (
            <div className={styles.row}>
              <button className={styles.btn} onClick={() => actions.attemptLeaveJailPay()}>Pay Fine</button>
              <button className={styles.btn} onClick={() => actions.attemptLeaveJailRoll()}>Try Roll Doubles</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}