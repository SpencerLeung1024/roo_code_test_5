import React, { useState } from 'react';

const CardDeck = ({ deck, onDraw }) => {
  const [drawnCard, setDrawnCard] = useState(null);

  const handleDraw = () => {
    const card = onDraw(); // Assuming onDraw returns the card
    setDrawnCard(card);
  };

  return (
    <div style={{ margin: '20px' }}>
      <h3>Card Deck</h3>
      <button onClick={handleDraw}>Draw Card</button>
      {drawnCard && (
        <div>
          <p>{drawnCard.description}</p>
        </div>
      )}
    </div>
  );
};

export default CardDeck;