import { useState } from 'react';
import './App.css';
import { useGameEngine } from './hooks/useGameEngine';
import Board from './components/Board/Board';
import Sidebar from './components/Sidebar/Sidebar';
import TurnControls from './components/Controls/TurnControls';
import LogPanel from './components/Log/LogPanel';
import BuyPropertyModal from './components/Modals/BuyPropertyModal';
import RentPaymentModal from './components/Modals/RentPaymentModal';
import CardModal from './components/Modals/CardModal';
import JailModal from './components/Modals/JailModal';

function App() {
  const { state, actions, lastAutosaveTs } = useGameEngine();
  const [playersInput, setPlayersInput] = useState('Alice,Bob');

  const start = () => {
    const names = playersInput.split(',').map(s => s.trim()).filter(Boolean);
    actions.newGame(names);
  };

  const inJail = !!state && state.players[state.currentPlayerIndex]?.inJail;

  return (
    <div style={{ padding: 16, fontFamily: 'Inter, system-ui, Arial, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Monopoly Vertical Slice</h1>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        {!state && (
          <>
            <label>
              Players:{' '}
              <input
                value={playersInput}
                onChange={(e) => setPlayersInput(e.target.value)}
                style={{ width: 300 }}
                aria-label="players-input"
              />
            </label>
            <button onClick={start}>Start New Game</button>
          </>
        )}
        <button onClick={() => actions.quickStart?.()}>Quick Start</button>
        <button onClick={() => actions.resetGame?.()}>Reset Save</button>
        {lastAutosaveTs && (
          <span style={{ marginLeft: 8, color: '#267d39', fontSize: 12 }} aria-live="polite">
            Autosaved
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'auto 340px', gap: 24, alignItems: 'start' }}>
        <div>
          {state ? (
            <Board state={state} />
          ) : (
            <div style={{ width: 640, height: 640, display: 'grid', placeItems: 'center', border: '1px dashed #ccc' }}>
              <div>Start a new game to see the board</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TurnControls state={state} actions={actions} />
          {state && <Sidebar state={state} />}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {state && <LogPanel state={state} />}
      </div>

      {/* Modals */}
      {state && (
        <>
          <BuyPropertyModal
            state={state}
            onBuy={() => {
              actions.buyCurrentProperty();
              // Advance engine after choice
              actions.resolve();
            }}
            onClose={() => {
              // Decline -> continue resolution
              actions.resolve();
            }}
          />
          <RentPaymentModal
            state={state}
            onClose={() => {
              // Acknowledge -> continue flow
              actions.resolve();
            }}
          />
          <CardModal
            state={state}
            onClose={() => {
              // Acknowledge -> continue flow
              actions.resolve();
            }}
          />
          {inJail && (
            <JailModal
              state={state}
              onPay={() => actions.attemptLeaveJailPay()}
              onRoll={() => actions.attemptLeaveJailRoll()}
              onClose={() => {
                // Jail modal closes automatically via state; try to resolve if any prompt remains
                actions.resolve();
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
