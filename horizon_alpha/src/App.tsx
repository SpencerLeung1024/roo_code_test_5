import React from 'react';
import { Controls } from './components/Controls';
import { Log } from './components/Log';
import { PlayerPanels } from './components/PlayerPanels';
import { Board } from './components/Board';
import { useGameStore } from './state/store';
import { selectPlayers, selectCurrentPlayer, selectPhase, selectTurnInfo } from './state/selectors';
import { TurnPhase } from './data/constants';

const App: React.FC = () => {
  const { state } = useGameStore();
  const players = selectPlayers(state);
  const current = selectCurrentPlayer(state);
  const phase: TurnPhase = selectPhase(state);
  const turn = selectTurnInfo(state);

  return (
    <div className="app-shell">
      <header className="app-header compact">
        <div className="header-left">
          <h1 className="app-title">Unus Venditor</h1>
          <span className="badge small">Scaffold OK</span>
        </div>
        <div className="header-status" title="Game status">
          <span>Players: {players.length}</span>
          {current ? <span> • Current: {current.name}</span> : null}
          <span> • Phase: {phase}</span>
          {turn.dice ? (
            <span>
              {' '}• Dice: {turn.dice[0]} + {turn.dice[1]}
              {turn.dice[0] === turn.dice[1] ? ' (double)' : ''}
            </span>
          ) : null}
        </div>
      </header>

      <main className="app-main two-col">
        <section className="board-area panel">
          <Board />
        </section>
        <aside className="side-area">
          <section className="panel">
            <Controls />
          </section>
          <section className="panel">
            <PlayerPanels />
          </section>
          <section className="panel">
            <Log />
          </section>
        </aside>
      </main>

      <footer className="app-footer">
        <small>Prototype build</small>
      </footer>
    </div>
  );
};

export default App;