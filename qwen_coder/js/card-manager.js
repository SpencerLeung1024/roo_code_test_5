// Card Manager for Monopoly Game
// Handles Chance and Community Chest card drawing and execution

class CardManager {
    constructor() {
        // Initialize card decks
        this.chanceDeck = [...chanceCards];
        this.communityChestDeck = [...communityChestCards];
        
        // Shuffle the decks
        this.shuffleDeck(this.chanceDeck);
        this.shuffleDeck(this.communityChestDeck);
        
        // Initialize used cards arrays
        this.usedChanceCards = [];
        this.usedCommunityChestCards = [];
    }
    
    // Shuffle a deck of cards using Fisher-Yates algorithm
    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }
    
    // Draw a Chance card
    drawChanceCard() {
        if (this.chanceDeck.length === 0) {
            // Reshuffle used cards if deck is empty
            this.chanceDeck = this.usedChanceCards;
            this.usedChanceCards = [];
            this.shuffleDeck(this.chanceDeck);
        }
        
        // Draw the top card
        const card = this.chanceDeck.shift();
        
        // Add to used cards
        this.usedChanceCards.push(card);
        
        return card;
    }
    
    // Draw a Community Chest card
    drawCommunityChestCard() {
        if (this.communityChestDeck.length === 0) {
            // Reshuffle used cards if deck is empty
            this.communityChestDeck = this.usedCommunityChestCards;
            this.usedCommunityChestCards = [];
            this.shuffleDeck(this.communityChestDeck);
        }
        
        // Draw the top card
        const card = this.communityChestDeck.shift();
        
        // Add to used cards
        this.usedCommunityChestCards.push(card);
        
        return card;
    }
    
    // Execute a card action
    executeCard(card, player, playerManager, boardManager, diceRoll = 0) {
        if (card && typeof card.action === 'function') {
            return card.action(player, playerManager, boardManager, diceRoll);
        }
        return "No action defined for this card.";
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardManager;
} else {
    // In browser environment, attach to window
    window.CardManager = CardManager;
}