import { useState } from 'react';
import './App.css';
import { initializeGame } from './utils/gameLogic';
import { BOARD } from './utils/constants';
import GameBoard from './components/GameBoard';
import PlayerHUD from './components/PlayerHUD';
import TurnManager from './components/TurnManager';
import PropertyCard from './components/PropertyCard';
import CardDeck from './components/CardDeck';
import Modal from './components/Modal';

function App() {
  const initialState = initializeGame(4);
  const [gameState, setGameState] = useState({
    ...initialState,
    board: BOARD,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const handleBuy = (position) => {
    const newState = { ...gameState };
    const player = newState.players[newState.currentTurn];
    buyProperty(newState, player, position);
    setGameState(newState);
    setModalOpen(false);
  };

  const handleDrawCard = (deckType) => {
    const newState = { ...gameState };
    const player = newState.players[newState.currentTurn];
    const deck = deckType === 'chance' ? newState.chanceDeck : newState.communityDeck;
    const card = drawCard(deck, player, newState.players);
    return card;
  };

  // Function to show modal based on landing result
  const showLandingResult = (result) => {
    if (result.type === 'can_buy') {
      setModalContent(
        <div>
          <h2>Buy Property?</h2>
          <PropertyCard position={result.position} gameState={gameState} onBuy={() => handleBuy(result.position)} />
        </div>
      );
      setModalOpen(true);
    } else if (result.type === 'drew_card') {
      setModalContent(
        <div>
          <h2>Drew Card</h2>
          <p>{result.card.description}</p>
        </div>
      );
      setModalOpen(true);
    } else if (result.type === 'paid_rent') {
      setModalContent(
        <div>
          <h2>Paid Rent</h2>
          <p>Paid ${result.amount} to Player {result.to + 1}</p>
        </div>
      );
      setModalOpen(true);
    } // Add more as needed
  };

  // Modify setGameState to check for results
  const updateGameState = (newState) => {
    setGameState(newState);
    // Assuming movePlayer now returns result, but since it's in TurnManager, we might need to adjust
    // For now, assume TurnManager calls showLandingResult if needed
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Monopoly</h1>
      </header>
      <div style={{ display: 'flex' }}>
        <GameBoard gameState={gameState} />
        <PlayerHUD gameState={gameState} />
      </div>
      <TurnManager gameState={gameState} setGameState={updateGameState} />
      {/* CardDecks if needed, but since drawing is handled in logic, perhaps not directly */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {modalContent}
      </Modal>
    </div>
  );
}

export default App;
