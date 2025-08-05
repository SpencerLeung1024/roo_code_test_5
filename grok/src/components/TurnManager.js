import React, { useState } from 'react';
import { rollDice, movePlayer, nextTurn, attemptJailEscape } from '../utils/gameLogic';

const TurnManager = ({ gameState, setGameState }) => {
  const currentPlayer = gameState.players[gameState.currentTurn];
  const [diceRoll, setDiceRoll] = useState(null);

  const handleRoll = () => {
    const roll = rollDice();
    setDiceRoll(roll);

    let newState = { ...gameState };
    let player = newState.players[newState.currentTurn];

    if (player.inJail) {
      attemptJailEscape(player, roll);
      if (player.inJail) {
        // Still in jail, end turn or allow other actions
        nextTurn(newState);
        setGameState(newState);
        return;
      }
    }

    if (roll.die1 === roll.die2) {
      player.doublesCount++;
      if (player.doublesCount === 3) {
        // Go to jail
        player.position = 10;
        player.inJail = true;
        player.doublesCount = 0;
        nextTurn(newState);
        setGameState(newState);
        return;
      }
    } else {
      player.doublesCount = 0;
    }

    movePlayer(player, roll, newState);
    setGameState(newState);
  };

  const handleEndTurn = () => {
    let newState = { ...gameState };
    nextTurn(newState);
    setGameState(newState);
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>{currentPlayer.name}'s Turn</h2>
      {currentPlayer.inJail && <p>You are in Jail. Roll doubles to escape or pay $50 after 3 turns.</p>}
      <button onClick={handleRoll} disabled={diceRoll && gameState.players[gameState.currentTurn].doublesCount === 0}>
        Roll Dice
      </button>
      {diceRoll && (
        <p>Dice: {diceRoll.die1} + {diceRoll.die2} = {diceRoll.total}</p>
      )}
      <button onClick={handleEndTurn} disabled={!!diceRoll && gameState.players[gameState.currentTurn].doublesCount > 0}>
        End Turn
      </button>
    </div>
  );
};

export default TurnManager;