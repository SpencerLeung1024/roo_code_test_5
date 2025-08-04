import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import Board from '@frontend/components/Board';
import JailControls from '@frontend/components/JailControls';
import { GameState, Player } from '@backend/types';

const App = () => {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
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
declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    }
  }
}