import React from 'react';
import { BOARD, PROPERTY_DETAILS } from '../utils/constants';

const PlayerHUD = ({ gameState }) => {
  const { players, currentTurn } = gameState;
  const currentPlayer = players[currentTurn];

  return (
    <div style={{ margin: '20px' }}>
      <h2>Players</h2>
      {players.map((player) => (
        <div
          key={player.id}
          style={{
            border: `2px solid ${player.id === currentTurn ? 'gold' : 'gray'}`,
            padding: '10px',
            margin: '10px 0',
          }}
        >
          <h3>{player.name} {player.bankrupt ? '(Bankrupt)' : ''}</h3>
          <p>Money: ${player.money}</p>
          <p>Position: {BOARD[player.position].name}</p>
          <p>In Jail: {player.inJail ? `Yes (Turns: ${player.jailTurns})` : 'No'}</p>
          <p>Get Out of Jail Cards: {player.getOutOfJailCards}</p>
          <h4>Properties:</h4>
          <ul>
            {player.properties.map((pos) => {
              const square = BOARD[pos];
              const details = PROPERTY_DETAILS[square.name];
              return (
                <li key={pos}>
                  {square.name} (${details.price})
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <h3>Current Turn: {currentPlayer.name}</h3>
    </div>
  );
};

export default PlayerHUD;