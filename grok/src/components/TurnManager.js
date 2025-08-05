import React, { useState } from 'react';
import { rollDice, movePlayer, nextTurn, attemptJailEscape, buildHouse, sellHouse, mortgageProperty, unmortgageProperty, performTrade, runAuction, useGetOutOfJailCard } from '../utils/gameLogic';
import Modal from './Modal';

const TurnManager = ({ gameState, setGameState }) => {
  const currentPlayer = gameState.players[gameState.currentTurn];
  const [diceRoll, setDiceRoll] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [tradePartner, setTradePartner] = useState(null);
  const [p1Gives, setP1Gives] = useState([]);
  const [p2Gives, setP2Gives] = useState([]);
  const [p1Money, setP1Money] = useState(0);
  const [p2Money, setP2Money] = useState(0);

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

  const handleBuildHouse = () => {
    if (selectedProperty !== null) {
      let newState = { ...gameState };
      buildHouse(newState, currentPlayer, selectedProperty);
      setGameState(newState);
      console.log(`Built house on position ${selectedProperty}`);
    }
  };

  const handleMortgage = () => {
    if (selectedProperty !== null) {
      let newState = { ...gameState };
      mortgageProperty(newState, currentPlayer, selectedProperty);
      setGameState(newState);
      console.log(`Mortgaged position ${selectedProperty}`);
    }
  };

  const handleUnmortgage = () => {
    if (selectedProperty !== null) {
      let newState = { ...gameState };
      unmortgageProperty(newState, currentPlayer, selectedProperty);
      setGameState(newState);
      console.log(`Unmortgaged position ${selectedProperty}`);
    }
  };

  const handleOpenTrade = () => {
    setShowTradeModal(true);
  };

  const handlePerformTrade = () => {
    if (tradePartner !== null) {
      let newState = { ...gameState };
      performTrade(newState, currentPlayer.id, tradePartner, p1Gives, p2Gives, p1Money, p2Money);
      setGameState(newState);
      setShowTradeModal(false);
      console.log(`Trade performed with player ${tradePartner}`);
    }
  };

  const handleOpenAuction = () => {
    setShowAuctionModal(true);
  };

  const handleRunAuction = () => {
    if (selectedProperty !== null) {
      let newState = { ...gameState };
      const result = runAuction(newState, selectedProperty);
      setGameState(newState);
      setShowAuctionModal(false);
      console.log(`Auction result: ${JSON.stringify(result)}`);
    }
  };

  const handleUseJailCard = () => {
    let newState = { ...gameState };
    useGetOutOfJailCard(currentPlayer);
    setGameState(newState);
    console.log('Used Get Out of Jail card');
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>{currentPlayer.name}'s Turn</h2>
      {currentPlayer.inJail && (
        <>
          <p>You are in Jail. Roll doubles to escape or pay $50 after 3 turns.</p>
          {currentPlayer.getOutOfJailCards > 0 && <button onClick={handleUseJailCard}>Use Get Out of Jail Card</button>}
        </>
      )}
      <button onClick={handleRoll} disabled={diceRoll && currentPlayer.doublesCount === 0}>
        Roll Dice
      </button>
      {diceRoll && (
        <p>Dice: {diceRoll.die1} + {diceRoll.die2} = {diceRoll.total}</p>
      )}
      <button onClick={handleEndTurn} disabled={!!diceRoll && currentPlayer.doublesCount > 0}>
        End Turn
      </button>

      <div>
        <h3>Actions</h3>
        <select onChange={(e) => setSelectedProperty(parseInt(e.target.value))}>
          <option value="">Select Property</option>
          {currentPlayer.properties.map(pos => (
            <option key={pos} value={pos}>{gameState.BOARD[pos].name}</option>
          ))}
        </select>
        <button onClick={handleBuildHouse} disabled={!selectedProperty}>Build House</button>
        <button onClick={handleMortgage} disabled={!selectedProperty}>Mortgage</button>
        <button onClick={handleUnmortgage} disabled={!selectedProperty}>Unmortgage</button>
        <button onClick={handleOpenTrade}>Trade</button>
        <button onClick={handleOpenAuction}>Auction Property</button>
      </div>

      <Modal isOpen={showTradeModal} onClose={() => setShowTradeModal(false)}>
        <h3>Trade</h3>
        <select onChange={(e) => setTradePartner(parseInt(e.target.value))}>
          <option value="">Select Partner</option>
          {gameState.players.filter(p => p.id !== currentPlayer.id && !p.bankrupt).map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {/* Simplified: assume inputs for p1Gives, p2Gives as comma-separated positions, money */}
        <input type="text" placeholder="Your gives (positions)" onChange={(e) => setP1Gives(e.target.value.split(',').map(Number))} />
        <input type="text" placeholder="Their gives (positions)" onChange={(e) => setP2Gives(e.target.value.split(',').map(Number))} />
        <input type="number" placeholder="Your money" onChange={(e) => setP1Money(parseInt(e.target.value))} />
        <input type="number" placeholder="Their money" onChange={(e) => setP2Money(parseInt(e.target.value))} />
        <button onClick={handlePerformTrade}>Confirm Trade</button>
      </Modal>

      <Modal isOpen={showAuctionModal} onClose={() => setShowAuctionModal(false)}>
        <h3>Auction Property</h3>
        <p>Auctioning {selectedProperty ? gameState.BOARD[selectedProperty].name : ''}</p>
        <button onClick={handleRunAuction}>Run Auction</button>
      </Modal>
    </div>
  );
};

export default TurnManager;