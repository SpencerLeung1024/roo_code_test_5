import React, { useState } from 'react';
import { BOARD_SPACES } from '../../data/boardData';
import PropertySpace from './PropertySpace';
import CardSpace from './CardSpace';
import CornerSpace from './CornerSpace';
import TaxSpace from './TaxSpace';
import RailroadSpace from './RailroadSpace';
import UtilitySpace from './UtilitySpace';
import PropertyCard from '../cards/PropertyCard';
import './GameBoard.css';

const GameBoard = () => {
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showPropertyCard, setShowPropertyCard] = useState(false);

  const handleSpaceClick = (space) => {
    setSelectedSpace(space);
    if (space.type === 'property' || space.type === 'railroad' || space.type === 'utility') {
      setShowPropertyCard(true);
    }
  };

  const closePropertyCard = () => {
    setShowPropertyCard(false);
    setSelectedSpace(null);
  };

  // Split board data into rows and columns
  const topRow = BOARD_SPACES.slice(20, 31).reverse();
  const rightCol = BOARD_SPACES.slice(10, 20);
  const bottomRow = BOARD_SPACES.slice(0, 11);
  const leftCol = BOARD_SPACES.slice(30, 40).reverse();

  const renderSpace = (space) => {
    switch (space.type) {
      case 'property':
        return <PropertySpace key={space.id} space={space} onClick={handleSpaceClick} />;
      case 'chance':
      case 'community':
        return <CardSpace key={space.id} space={space} onClick={handleSpaceClick} />;
      case 'corner':
        return <CornerSpace key={space.id} space={space} onClick={handleSpaceClick} />;
      case 'tax':
        return <TaxSpace key={space.id} space={space} onClick={handleSpaceClick} />;
      case 'railroad':
        return <RailroadSpace key={space.id} space={space} onClick={handleSpaceClick} />;
      case 'utility':
        return <UtilitySpace key={space.id} space={space} onClick={handleSpaceClick} />;
      default:
        return <div key={space.id} className="empty-space" />;
    }
  };

  return (
    <div className="game-container">
      <div className="game-board">
        {/* Top Row */}
        <div className="board-row top-row">
          {topRow.map(renderSpace)}
        </div>

        {/* Middle Section */}
        <div className="board-middle">
          {/* Left Column */}
          <div className="board-col left-col">
            {leftCol.map(renderSpace)}
          </div>

          {/* Center */}
          <div className="board-center">
            <h1>MONOPOLY</h1>
            <div className="game-info">
              <h2>Welcome to Monopoly!</h2>
              <p>Click on properties to view details</p>
              <div className="player-info">
                <h3>Player 1</h3>
                <p>Money: $1500</p>
                <p>Position: GO</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="board-col right-col">
            {rightCol.map(renderSpace)}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="board-row bottom-row">
          {bottomRow.map(renderSpace)}
        </div>
      </div>

      {showPropertyCard && selectedSpace && (
        <PropertyCard 
          space={selectedSpace} 
          onClose={closePropertyCard} 
        />
      )}
    </div>
  );
};

export default GameBoard;