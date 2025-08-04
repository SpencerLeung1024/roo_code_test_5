import { gameState, updateState } from './game-state.js';

// Original card decks (reshuffled when empty)
export const CHANCE_CARDS = [
  {
    text: "Advance to GO (Collect $200)",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, position: 0, balance: p.balance + 200 } 
            : p
        )
      });
    }
  },
  {
    text: "Go to Jail. Go directly to jail, do not pass GO, do not collect $200",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, position: 10, inJail: true, jailTurns: 0 } 
            : p
        )
      });
    }
  },
  {
    text: "Bank pays you dividend of $50",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, balance: p.balance + 50 } 
            : p
        )
      });
    }
  },
  {
    text: "Make general repairs on all your property. For each house pay $25. For each hotel $100",
    effect: (playerId) => {
      const player = gameState.players.find(p => p.id === playerId);
      if (!player) return;
      
      let totalHouses = 0;
      let totalHotels = 0;
      
      player.properties.forEach(spaceIndex => {
        const space = gameState.boardSpaces[spaceIndex];
        if (space.houses) {
          totalHouses += space.houses;
          if (space.houses === 5) {
            totalHotels++;
            totalHouses -= 5;
          }
        }
      });
      
      const cost = totalHouses * 25 + totalHotels * 100;
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, balance: p.balance - cost } 
            : p
        )
      });
    }
  },
  {
    text: "Advance to Illinois Ave",
    effect: (playerId) => {
      const player = gameState.players.find(p => p.id === playerId);
      if (!player) return;
      
      const targetPosition = 24;
      const spacesToMove = (targetPosition - player.position + 40) % 40;
      
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, position: targetPosition } 
            : p
        )
      });
    }
  },
  {
    text: "Advance to St. Charles Place",
    effect: (playerId) => {
      const player = gameState.players.find(p => p.id === playerId);
      if (!player) return;
      
      const targetPosition = 11;
      const spacesToMove = (targetPosition - player.position + 40) % 40;
      
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, position: targetPosition } 
            : p
        )
      });
    }
  },
  {
    text: "Take a trip to Reading Railroad",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, position: 5 } 
            : p
        )
      });
    }
  },
  {
    text: "Take a walk on the Boardwalk",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, position: 39 } 
            : p
        )
      });
    }
  },
  {
    text: "Pay poor tax of $15",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, balance: p.balance - 15 } 
            : p
        )
      });
    }
  },
  {
    text: "Your building loan matures. Collect $150",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, balance: p.balance + 150 } 
            : p
        )
      });
    }
  },
  {
    text: "You have been elected Chairman of the Board. Pay each player $50",
    effect: (playerId) => {
      const playerCount = gameState.players.length;
      const totalPayment = (playerCount - 1) * 50;
      
      updateState({
        players: gameState.players.map(p => {
          if (p.id === playerId) return { ...p, balance: p.balance - totalPayment };
          return { ...p, balance: p.balance + 50 };
        })
      });
    }
  },
  {
    text: "Advance token to nearest Utility. If unowned, you may buy it from the Bank. If owned, throw dice and pay owner a total ten times the amount thrown",
    effect: (playerId) => {
      const player = gameState.players.find(p => p.id === playerId);
      if (!player) return;
      
      // Find nearest utility (spaces 12 and 28)
      const utilities = [12, 28];
      let nearestUtility = utilities[0];
      
      for (const space of utilities) {
        const distance = (space - player.position + 40) % 40;
        if (distance < (nearestUtility - player.position + 40) % 40) {
          nearestUtility = space;
        }
      }
      
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, position: nearestUtility } 
            : p
        )
      });
    }
  },
  {
    text: "Advance token to nearest Railroad. If unowned, you may buy it from the Bank. If owned, pay owner twice the rental to which they are otherwise entitled",
    effect: (playerId) => {
      const player = gameState.players.find(p => p.id === playerId);
      if (!player) return;
      
      // Find nearest railroad (spaces 5, 15, 25, 35)
      const railroads = [5, 15, 25, 35];
      let nearestRailroad = railroads[0];
      
      for (const space of railroads) {
        const distance = (space - player.position + 40) % 40;
        if (distance < (nearestRailroad - player.position + 40) % 40) {
          nearestRailroad = space;
        }
      }
      
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, position: nearestRailroad } 
            : p
        )
      });
    }
  },
  {
    text: "Get Out of Jail Free. This card may be kept until needed or sold",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, jailFreeCard: true } 
            : p
        )
      });
    }
  },
  {
    text: "Speeding fine $15",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, balance: p.balance - 15 } 
            : p
        )
      });
    }
  },
  {
    text: "Loan matures. Collect $150",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, balance: p.balance + 150 } 
            : p
        )
      });
    }
  }
];

export const COMMUNITY_CHEST_CARDS = [
  {
    text: "Doctor's fee. Pay $50",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, balance: p.balance - 50 } 
            : p
        )
      });
    }
  },
  {
    text: "From sale of stock you get $45",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, balance: p.balance + 45 } 
            : p
        )
      });
    }
  },
  {
    text: "Go to Jail. Go directly to jail, do not pass GO, do not collect $200",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, position: 10, inJail: true, jailTurns: 0 } 
            : p
        )
      });
    }
  },
  {
    text: "Grand Opera Night. Collect $50 from every player for opening night seats",
    effect: (playerId) => {
      const playerCount = gameState.players.length;
      const totalCollection = (playerCount - 1) * 50;
      
      updateState({
        players: gameState.players.map(p => {
          if (p.id === playerId) return { ...p, balance: p.balance + totalCollection };
          return { ...p, balance: p.balance - 50 };
        })
      });
    }
  },
  {
    text: "Holiday Fund matures. Receive $100",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, balance: p.balance + 100 } 
            : p
        )
      });
    }
  },
  {
    text: "Income tax refund. Collect $20",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, balance: p.balance + 20 } 
            : p
        )
      });
    }
  },
  {
    text: "It is your birthday. Collect $10 from each player",
    effect: (playerId) => {
      const playerCount = gameState.players.length;
      const totalCollection = (playerCount - 1) * 10;
      
      updateState({
        players: gameState.players.map(p => {
          if (p.id === playerId) return { ...p, balance: p.balance + totalCollection };
          return { ...p, balance: p.balance - 10 };
        })
      });
    }
  },
  {
    text: "Life insurance matures. Collect $100",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, balance: p.balance + 100 } 
            : p
        )
      });
    }
  },
  {
    text: "Pay hospital fees of $100",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, balance: p.balance - 100 } 
            : p
        )
      });
    }
  },
  {
    text: "Pay school fees of $50",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, balance: p.balance - 50 } 
            : p
        )
      });
    }
  },
  {
    text: "Receive $25 consultancy fee",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, balance: p.balance + 25 } 
            : p
        )
      });
    }
  },
  {
    text: "You are assessed for street repairs. $40 per house. $115 per hotel",
    effect: (playerId) => {
      const player = gameState.players.find(p => p.id === playerId);
      if (!player) return;
      
      let totalHouses = 0;
      let totalHotels = 0;
      
      player.properties.forEach(spaceIndex => {
        const space = gameState.boardSpaces[spaceIndex];
        if (space.houses) {
          totalHouses += space.houses;
          if (space.houses === 5) {
            totalHotels++;
            totalHouses -= 5;
          }
        }
      });
      
      const cost = totalHouses * 40 + totalHotels * 115;
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, balance: p.balance - cost } 
            : p
        )
      });
    }
  },
  {
    text: "You have won second prize in a beauty contest. Collect $10",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, balance: p.balance + 10 } 
            : p
        )
      });
    }
  },
  {
    text: "You inherit $100",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, balance: p.balance + 100 } 
            : p
        )
      });
    }
  },
  {
    text: "Get Out of Jail Free. This card may be kept until needed or sold",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, jailFreeCard: true } 
            : p
        )
      });
    }
  },
  {
    text: "Bank error in your favor. Collect $200",
    effect: (playerId) => {
      updateState({
        players: gameState.players.map(p => 
          p.id === playerId 
            ? { ...p, balance: p.balance + 200 } 
            : p
        )
      });
    }
  }
];

// Current deck state (mutable)
let chanceDeck = [...CHANCE_CARDS];
let communityDeck = [...COMMUNITY_CHEST_CARDS];

/**
 * Draws a card from the specified deck
 * @param {'chance'|'community'} deckType - Type of deck to draw from
 * @returns {{card: object, remainingCount: number}}
 */
export function drawCard(deckType) {
  let deck;
  let originalDeck;
  
  if (deckType === 'chance') {
    deck = chanceDeck;
    originalDeck = CHANCE_CARDS;
  } else if (deckType === 'community') {
    deck = communityDeck;
    originalDeck = COMMUNITY_CHEST_CARDS;
  } else {
    throw new Error('Invalid deck type');
  }

  // Reshuffle if empty
  if (deck.length === 0) {
    console.log(`[CARD] Reshuffling ${deckType} deck`);
    deck = [...originalDeck];
    if (deckType === 'chance') {
      chanceDeck = deck;
    } else {
      communityDeck = deck;
    }
  }

  // Randomly select and remove card
  const randomIndex = Math.floor(Math.random() * deck.length);
  const [card] = deck.splice(randomIndex, 1);
  console.log(`[CARD] Drew "${card.text}". ${deck.length} cards remaining in ${deckType} deck.`);
  
  // Update deck reference
  if (deckType === 'chance') {
    chanceDeck = deck;
  } else {
    communityDeck = deck;
  }

  return {
    card,
    remainingCount: deck.length
  };
}