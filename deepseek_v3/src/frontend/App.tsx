import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Board from './components/Board';
import JailControls from './components/JailControls';
import { GameState, Player } from '../types';

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('game-state', (state: GameState) => {
      setGameState(state);
      const player = state.players.find(p => p.id === state.currentPlayer);
      if (player) setCurrentPlayer(player);
    });

    newSocket.on('jail-action-result', (result: {
      playerId: string;
      action: string;
      success: boolean;
      newState: GameState
    }) => {
      setGameState(result.newState);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="app">
      <h1>Monopoly</h1>
      {currentPlayer?.inJail && (
        <JailControls
          player={currentPlayer}
          onJailAction={(action: 'pay_bail' | 'use_card' | 'roll_doubles') => {
            if (socket && currentPlayer) {
              socket.emit('handle-jail-action', {
                playerId: currentPlayer.id,
                action
              });
            }
          }}
        />
      )}
      <Board
        properties={gameState?.properties || []}
        currentPlayerPosition={currentPlayer?.position || 0}
      />
    </div>
  );
};

export default App;