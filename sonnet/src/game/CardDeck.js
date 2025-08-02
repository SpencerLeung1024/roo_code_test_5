// Card deck management system for Monopoly Chance and Community Chest cards
// Handles shuffling, drawing, discarding, and reshuffling mechanics

import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from '../data/CardData.js';

export class CardDeck {
  constructor(cards, type) {
    this.type = type; // 'chance' or 'communityChest'
    this.originalCards = [...cards]; // Keep original set for reshuffling
    this.deck = []; // Current deck (cards to be drawn)
    this.discard = []; // Discard pile
    this.history = []; // Card draw history
    this.statistics = {
      totalDraws: 0,
      cardCounts: {},
      reshuffleCount: 0
    };
    this.initialize();
  }
  
  // Initialize deck with shuffled cards
  initialize() {
    this.deck = this.shuffle([...this.originalCards]);
    this.discard = [];
    this.history = [];
    this.statistics.reshuffleCount = 0;
    
    // Initialize card count statistics
    this.originalCards.forEach(card => {
      this.statistics.cardCounts[card.id] = 0;
    });
    
    console.log(`Initialized ${this.type} deck with ${this.deck.length} cards`);
  }
  
  // Fisher-Yates shuffle algorithm
  shuffle(cards) {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // Draw the top card from the deck
  drawCard() {
    // Check if deck is empty and needs reshuffling
    if (this.deck.length === 0) {
      this.reshuffle();
    }
    
    // If still empty after reshuffle, something is wrong
    if (this.deck.length === 0) {
      console.error(`${this.type} deck is empty and cannot be reshuffled`);
      return null;
    }
    
    const card = this.deck.pop();
    
    // Update statistics
    this.statistics.totalDraws++;
    this.statistics.cardCounts[card.id]++;
    
    // Add to history
    this.history.push({
      card: { ...card },
      timestamp: new Date(),
      deckSize: this.deck.length
    });
    
    console.log(`Drew ${card.title} from ${this.type} deck (${this.deck.length} cards remaining)`);
    
    return card;
  }
  
  // Discard a card (unless it's a "Get Out of Jail Free" card)
  discardCard(card) {
    if (!card.isGetOutOfJail) {
      this.discard.push(card);
      console.log(`Discarded ${card.title} to ${this.type} discard pile`);
    } else {
      console.log(`${card.title} not discarded - kept by player`);
    }
  }
  
  // Reshuffle discard pile back into deck
  reshuffle() {
    if (this.discard.length === 0) {
      console.warn(`Cannot reshuffle ${this.type} deck - no cards in discard pile`);
      return false;
    }
    
    console.log(`Reshuffling ${this.type} deck (${this.discard.length} cards from discard pile)`);
    
    this.deck = this.shuffle([...this.discard]);
    this.discard = [];
    this.statistics.reshuffleCount++;
    
    return true;
  }
  
  // Return a "Get Out of Jail Free" card to the bottom of the deck
  returnGetOutOfJailCard(card) {
    if (card.isGetOutOfJail) {
      this.deck.unshift(card); // Add to bottom of deck
      console.log(`Returned "Get Out of Jail Free" card to bottom of ${this.type} deck`);
    } else {
      console.warn('Attempted to return non-jail card to deck');
    }
  }
  
  // Peek at the top card without drawing it (for testing/debugging)
  peekTopCard() {
    if (this.deck.length === 0) {
      return null;
    }
    return { ...this.deck[this.deck.length - 1] };
  }
  
  // Get deck status information
  getStatus() {
    return {
      type: this.type,
      deckSize: this.deck.length,
      discardSize: this.discard.length,
      totalCards: this.originalCards.length,
      statistics: { ...this.statistics },
      canDraw: this.deck.length > 0 || this.discard.length > 0
    };
  }
  
  // Get recent card history
  getRecentHistory(count = 5) {
    return this.history.slice(-count);
  }
  
  // Reset deck to initial state
  reset() {
    this.initialize();
    console.log(`Reset ${this.type} deck to initial state`);
  }
  
  // Validate deck integrity
  validateDeck() {
    const totalCards = this.deck.length + this.discard.length;
    const expectedCards = this.originalCards.length;
    
    // Account for "Get Out of Jail Free" cards that might be with players
    const jailCards = this.originalCards.filter(card => card.isGetOutOfJail);
    const maxMissingCards = jailCards.length;
    
    const isValid = totalCards >= (expectedCards - maxMissingCards) && 
                   totalCards <= expectedCards;
    
    if (!isValid) {
      console.warn(`Deck validation failed for ${this.type}: ${totalCards}/${expectedCards} cards`);
    }
    
    return {
      isValid,
      totalCards,
      expectedCards,
      deckCards: this.deck.length,
      discardCards: this.discard.length,
      missingCards: expectedCards - totalCards
    };
  }
}

// Factory class for creating and managing both card decks
export class CardDeckManager {
  constructor() {
    this.chanceCardDeck = new CardDeck(CHANCE_CARDS, 'chance');
    this.communityChestDeck = new CardDeck(COMMUNITY_CHEST_CARDS, 'communityChest');
    this.globalHistory = [];
  }
  
  // Draw a card from the specified deck type
  drawCard(deckType) {
    let deck;
    
    switch (deckType) {
      case 'chance':
        deck = this.chanceCardDeck;
        break;
      case 'communityChest':
        deck = this.communityChestDeck;
        break;
      default:
        console.error(`Invalid deck type: ${deckType}`);
        return null;
    }
    
    const card = deck.drawCard();
    
    if (card) {
      // Add to global history
      this.globalHistory.push({
        card: { ...card },
        deckType,
        timestamp: new Date()
      });
      
      // Keep global history manageable
      if (this.globalHistory.length > 100) {
        this.globalHistory = this.globalHistory.slice(-50);
      }
    }
    
    return card;
  }
  
  // Discard a card to the appropriate deck
  discardCard(card, deckType) {
    let deck;
    
    switch (deckType) {
      case 'chance':
        deck = this.chanceCardDeck;
        break;
      case 'communityChest':
        deck = this.communityChestDeck;
        break;
      default:
        console.error(`Invalid deck type for discard: ${deckType}`);
        return false;
    }
    
    deck.discardCard(card);
    return true;
  }
  
  // Return "Get Out of Jail Free" card to appropriate deck
  returnJailCard(card) {
    // Randomly choose which deck to return the card to
    // In real Monopoly, it goes back to the original deck, but we'll randomize for fairness
    const deckType = Math.random() < 0.5 ? 'chance' : 'communityChest';
    const deck = deckType === 'chance' ? this.chanceCardDeck : this.communityChestDeck;
    
    deck.returnGetOutOfJailCard(card);
    return deckType;
  }
  
  // Get status of both decks
  getAllDecksStatus() {
    return {
      chance: this.chanceCardDeck.getStatus(),
      communityChest: this.communityChestDeck.getStatus(),
      globalHistory: this.globalHistory.slice(-10) // Last 10 cards drawn
    };
  }
  
  // Reset both decks
  resetAllDecks() {
    this.chanceCardDeck.reset();
    this.communityChestDeck.reset();
    this.globalHistory = [];
    console.log('Reset all card decks');
  }
  
  // Validate both decks
  validateAllDecks() {
    const chanceValidation = this.chanceCardDeck.validateDeck();
    const communityValidation = this.communityChestDeck.validateDeck();
    
    return {
      chance: chanceValidation,
      communityChest: communityValidation,
      allValid: chanceValidation.isValid && communityValidation.isValid
    };
  }
  
  // Get statistics for all decks
  getAllStatistics() {
    return {
      chance: this.chanceCardDeck.statistics,
      communityChest: this.communityChestDeck.statistics,
      global: {
        totalDraws: this.chanceCardDeck.statistics.totalDraws + this.communityChestDeck.statistics.totalDraws,
        totalReshuffles: this.chanceCardDeck.statistics.reshuffleCount + this.communityChestDeck.statistics.reshuffleCount
      }
    };
  }
}

// Create and export a singleton instance
export const cardDeckManager = new CardDeckManager();

export default CardDeckManager;