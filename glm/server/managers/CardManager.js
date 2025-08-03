const CardConfig = require('../config/cardConfig');

class CardManager {
    constructor(gameState, eventHandler) {
        this.gameState = gameState;
        this.eventHandler = eventHandler;
        this.chanceCards = [];
        this.communityChestCards = [];
        this.chanceDeck = [];
        this.communityChestDeck = [];
        this.discardPiles = {
            chance: [],
            communityChest: []
        };
        this.cardHistory = [];
        this.maxHistoryLength = 100;
        
        this.initializeDecks();
    }
    
    // Initialize the card decks
    initializeDecks() {
        // Load card configurations
        this.chanceCards = CardConfig.getChanceCards();
        this.communityChestCards = CardConfig.getCommunityChestCards();
        
        // Create shuffled decks
        this.shuffleDeck('chance');
        this.shuffleDeck('communityChest');
        
        console.log(`Card decks initialized: ${this.chanceDeck.length} Chance cards, ${this.communityChestDeck.length} Community Chest cards`);
    }
    
    // Shuffle a deck
    shuffleDeck(deckType) {
        let deck = deckType === 'chance' ? this.chanceCards : this.communityChestCards;
        
        // Fisher-Yates shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        
        // Store the shuffled deck
        if (deckType === 'chance') {
            this.chanceDeck = [...deck];
        } else {
            this.communityChestDeck = [...deck];
        }
        
        console.log(`${deckType} deck shuffled`);
    }
    
    // Draw a card from a deck
    drawCard(deckType, player) {
        if (!player) {
            throw new Error('Invalid player');
        }
        
        let deck = deckType === 'chance' ? this.chanceDeck : this.communityChestDeck;
        
        // If deck is empty, reshuffle discard pile
        if (deck.length === 0) {
            this.reshuffleDeck(deckType);
            deck = deckType === 'chance' ? this.chanceDeck : this.communityChestDeck;
        }
        
        // Draw the top card
        const card = deck.shift();
        
        // Record the draw
        const drawRecord = {
            playerId: player.id,
            playerName: player.name,
            deckType: deckType,
            cardId: card.id,
            cardText: card.text,
            timestamp: new Date()
        };
        
        this.addToHistory(drawRecord);
        
        // Emit draw event
        this.eventHandler.emit('card:drawn', {
            playerId: player.id,
            deckType: deckType,
            cardId: card.id,
            cardText: card.text
        });
        
        console.log(`${player.name} drew ${deckType} card: ${card.text}`);
        
        return card;
    }
    
    // Execute a card's action
    executeCard(card, player, game) {
        if (!card || !player || !game) {
            throw new Error('Invalid card, player, or game');
        }
        
        const actionHandlers = CardConfig.getCardActionHandlers();
        const handler = actionHandlers[card.action];
        
        if (!handler) {
            console.error(`No handler found for card action: ${card.action}`);
            return { success: false, message: 'Card action not implemented' };
        }
        
        try {
            const result = handler(card, player, game);
            
            // Record the execution
            const executionRecord = {
                playerId: player.id,
                playerName: player.name,
                cardId: card.id,
                cardAction: card.action,
                result: result,
                timestamp: new Date()
            };
            
            this.addToHistory(executionRecord);
            
            // Handle Get Out of Jail Free cards (they go back to the deck)
            if (card.action === 'get_out_of_jail_free') {
                // Don't add to discard pile - keep it with the player
            } else {
                // Add to discard pile
                this.discardPiles[card.type].push(card);
            }
            
            return result;
        } catch (error) {
            console.error(`Error executing card action ${card.action}:`, error);
            return { success: false, message: 'Error executing card action' };
        }
    }
    
    // Reshuffle a deck from the discard pile
    reshuffleDeck(deckType) {
        const discardPile = this.discardPiles[deckType];
        
        if (discardPile.length === 0) {
            console.warn(`No cards to reshuffle for ${deckType} deck`);
            return;
        }
        
        // Fisher-Yates shuffle the discard pile
        for (let i = discardPile.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [discardPile[i], discardPile[j]] = [discardPile[j], discardPile[i]];
        }
        
        // Move shuffled cards back to the deck
        if (deckType === 'chance') {
            this.chanceDeck = [...discardPile];
            this.discardPiles.chance = [];
        } else {
            this.communityChestDeck = [...discardPile];
            this.discardPiles.communityChest = [];
        }
        
        console.log(`${deckType} deck reshuffled with ${discardPile.length} cards`);
    }
    
    // Handle Chance card draw
    drawChanceCard(player, game) {
        const card = this.drawCard('chance', player);
        const result = this.executeCard(card, player, game);
        
        return {
            card,
            result,
            deckType: 'chance'
        };
    }
    
    // Handle Community Chest card draw
    drawCommunityChestCard(player, game) {
        const card = this.drawCard('communityChest', player);
        const result = this.executeCard(card, player, game);
        
        return {
            card,
            result,
            deckType: 'communityChest'
        };
    }
    
    // Get card by ID
    getCardById(cardId) {
        const chanceCard = this.chanceCards.find(c => c.id === cardId);
        if (chanceCard) return chanceCard;
        
        const communityChestCard = this.communityChestCards.find(c => c.id === cardId);
        return communityChestCard;
    }
    
    // Get all cards of a type
    getCardsByType(type) {
        if (type === 'chance') {
            return [...this.chanceCards];
        } else if (type === 'communityChest') {
            return [...this.communityChestCards];
        }
        return [];
    }
    
    // Get deck status
    getDeckStatus() {
        return {
            chance: {
                totalCards: this.chanceCards.length,
                remainingInDeck: this.chanceDeck.length,
                inDiscardPile: this.discardPiles.chance.length,
                inPlayerHands: this.chanceCards.length - this.chanceDeck.length - this.discardPiles.chance.length
            },
            communityChest: {
                totalCards: this.communityChestCards.length,
                remainingInDeck: this.communityChestDeck.length,
                inDiscardPile: this.discardPiles.communityChest.length,
                inPlayerHands: this.communityChestCards.length - this.communityChestDeck.length - this.discardPiles.communityChest.length
            }
        };
    }
    
    // Get card statistics
    getCardStatistics() {
        const stats = {
            totalDraws: this.cardHistory.length,
            chanceDraws: this.cardHistory.filter(record => record.deckType === 'chance').length,
            communityChestDraws: this.cardHistory.filter(record => record.deckType === 'communityChest').length,
            mostDrawnCards: this.getMostDrawnCards(),
            actionFrequency: this.getActionFrequency()
        };
        
        return stats;
    }
    
    // Get most drawn cards
    getMostDrawnCards() {
        const cardCounts = {};
        
        this.cardHistory.forEach(record => {
            if (!cardCounts[record.cardId]) {
                cardCounts[record.cardId] = {
                    cardId: record.cardId,
                    cardText: record.cardText,
                    count: 0,
                    deckType: record.deckType
                };
            }
            cardCounts[record.cardId].count++;
        });
        
        return Object.values(cardCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10 most drawn cards
    }
    
    // Get action frequency
    getActionFrequency() {
        const actionCounts = {};
        
        this.cardHistory.forEach(record => {
            const card = this.getCardById(record.cardId);
            if (card) {
                if (!actionCounts[card.action]) {
                    actionCounts[card.action] = 0;
                }
                actionCounts[card.action]++;
            }
        });
        
        return actionCounts;
    }
    
    // Get player card history
    getPlayerCardHistory(playerId, limit = 10) {
        return this.cardHistory
            .filter(record => record.playerId === playerId)
            .slice(-limit);
    }
    
    // History management
    addToHistory(record) {
        this.cardHistory.push(record);
        
        // Keep history at maximum length
        if (this.cardHistory.length > this.maxHistoryLength) {
            this.cardHistory = this.cardHistory.slice(-this.maxHistoryLength);
        }
    }
    
    getFullHistory() {
        return [...this.cardHistory];
    }
    
    clearHistory() {
        this.cardHistory = [];
        console.log('Card history cleared');
    }
    
    // Reset all decks
    resetDecks() {
        this.chanceDeck = [];
        this.communityChestDeck = [];
        this.discardPiles = {
            chance: [],
            communityChest: []
        };
        
        this.initializeDecks();
        console.log('All card decks reset');
    }
    
    // Validate card action
    validateCardAction(card, player, game) {
        if (!card || !player || !game) {
            return { valid: false, message: 'Invalid card, player, or game' };
        }
        
        // Check if player can afford payment cards
        if (card.action === 'pay_money') {
            if (!player.canAfford(card.value)) {
                return { valid: false, message: 'Player cannot afford to pay this amount' };
            }
        }
        
        // Check if player can afford per-house payments
        if (card.action === 'pay_per_house') {
            let totalCost = 0;
            player.properties.forEach(propertyId => {
                const property = game.getPropertyById(propertyId);
                if (property) {
                    if (property.buildings === 5) {
                        totalCost += card.value.hotel;
                    } else if (property.buildings > 0) {
                        totalCost += card.value.house;
                    }
                }
            });
            
            if (!player.canAfford(totalCost)) {
                return { valid: false, message: 'Player cannot afford to pay for repairs' };
            }
        }
        
        return { valid: true, message: 'Card action is valid' };
    }
    
    // Get card description for UI
    getCardDescription(card) {
        if (!card) return null;
        
        return {
            id: card.id,
            type: card.type,
            text: card.text,
            action: card.action,
            description: card.description,
            isMoneyCard: ['receive_money', 'pay_money'].includes(card.action),
            isMovementCard: ['move_to', 'move_back', 'move_to_nearest_utility', 'move_to_nearest_railroad', 'go_to_jail'].includes(card.action),
            isSpecialCard: ['get_out_of_jail_free', 'pay_per_house', 'collect_from_players'].includes(card.action)
        };
    }
    
    // State methods
    getState() {
        return {
            deckStatus: this.getDeckStatus(),
            totalDraws: this.cardHistory.length,
            recentDraws: this.cardHistory.slice(-5)
        };
    }
    
    // Destroy the card manager
    destroy() {
        this.chanceCards = [];
        this.communityChestCards = [];
        this.chanceDeck = [];
        this.communityChestDeck = [];
        this.discardPiles = { chance: [], communityChest: [] };
        this.cardHistory = [];
        
        console.log('Card manager destroyed');
    }
}

module.exports = CardManager;