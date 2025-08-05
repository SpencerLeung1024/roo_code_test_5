import React from 'react';
import { BOARD, PROPERTY_DETAILS } from '../utils/constants';

const groupColors = {
  brown: '#A52A2A',
  lightblue: '#ADD8E6',
  pink: '#FFC0CB',
  orange: '#FFA500',
  red: '#FF0000',
  yellow: '#FFFF00',
  green: '#008000',
  darkblue: '#00008B',
  railroad: '#000000',
  utility: '#FFFFFF',
};

const playerColors = ['red', 'blue', 'green', 'yellow']; // For up to 4 players

const GameBoard = ({ gameState }) => {
  const { players, ownership } = gameState;

  const renderSquare = (square) => {
    const pos = square.position;
    const details = PROPERTY_DETAILS[square.name] || {};
    const bgColor = groupColors[square.group || square.type] || '#FFFFFF';
    const owner = ownership[pos] !== null ? `Owner: P${ownership[pos] + 1}` : '';
    const squarePlayers = players.filter(p => p.position === pos).map(p => p.id);

    return (
      <div
        key={pos}
        style={{
          width: '100px',
          height: '100px',
          border: '1px solid black',
          backgroundColor: bgColor,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '5px',
          boxSizing: 'border-box',
        }}
      >
        <div>{square.name}</div>
        {details.price && <div>${details.price}</div>}
        <div>{owner}</div>
        <div style={{ display: 'flex' }}>
          {squarePlayers.map(id => (
            <div
              key={id}
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: playerColors[id],
                borderRadius: '50%',
                margin: '2px',
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  // Simple 4-sided board layout using grid
  const boardStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(11, 100px)', // Approximate Monopoly layout: 11 per side including corners
    gridTemplateRows: 'repeat(11, 100px)',
    position: 'relative',
  };

  // For simplicity, render as a linear list or basic grid. Actual Monopoly layout is more complex, but this approximates.
  return (
    <div style={boardStyle}>
      {BOARD.map((square, index) => {
        // Position mapping for grid (simplified)
        let gridRow, gridColumn;
        if (index < 10) { // Bottom
          gridRow = 11;
          gridColumn = 11 - index;
        } else if (index < 20) { // Left
          gridRow = 11 - (index - 9);
          gridColumn = 1;
        } else if (index < 30) { // Top
          gridRow = 1;
          gridColumn = index - 19;
        } else { // Right
          gridRow = (index - 29);
          gridColumn = 11;
        }
        return (
          <div key={index} style={{ gridRow, gridColumn }}>
            {renderSquare(square)}
          </div>
        );
      })}
    </div>
  );
};

export default GameBoard;