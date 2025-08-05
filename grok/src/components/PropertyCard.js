import React from 'react';
import { PROPERTY_DETAILS } from '../utils/constants';

const PropertyCard = ({ position, gameState, onBuy }) => {
  const square = gameState.board[position];
  const details = PROPERTY_DETAILS[square.name];
  const ownerId = gameState.ownership[position];
  const isOwned = ownerId !== null;

  return (
    <div style={{
      border: '1px solid black',
      padding: '10px',
      margin: '10px',
      backgroundColor: details.color || '#FFF',
      color: details.color ? '#000' : '#000', // Adjust for visibility
    }}>
      <h3>{square.name}</h3>
      <p>Price: ${details.price}</p>
      <p>Rent: ${details.rent[0]} (base)</p>
      {/* List all rent levels if needed */}
      <p>House Cost: ${details.houseCost}</p>
      {isOwned ? (
        <p>Owned by Player {ownerId + 1}</p>
      ) : (
        <button onClick={() => onBuy(position)}>Buy</button>
      )}
    </div>
  );
};

export default PropertyCard;