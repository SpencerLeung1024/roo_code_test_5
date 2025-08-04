/**
 * CardDeck class for managing Chance and Community Chest decks
 */
import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from '../config/cards.js';

export class CardDeck {
    constructor(type) {
        this.type = type; // 'chance' or 'community-chest'
        this.cards = [];
        this.discardPile = [];
        this.initializeDeck();
    }

    /**
     * Initialize the deck with appropriate cards
     */
    initializeDeck() {
        if (this.type === 'chance') {
            this.cards = [...CHANCE_CARDS];
        } else if (this.type === 'community-chest') {
            this.cards = [...COMMUNITY_CHEST_CARDS];
        }
        this.shuffle();
    }

    /**
     * Shuffle the deck using Fisher-Yates algorithm
     */
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    /**
     * Draw a card from the deck
     * @returns {Card|null} The drawn card or null if deck is empty
     */
    drawCard() {
        if (this.cards.length === 0) {
            this.resetDeck();
        }

        if (this.cards.length === 0) {
            return null;
        }

        const card = this.cards.pop();
        this.discardPile.push(card);
        return card;
    }

    /**
     * Return a card to the bottom of the deck
     * @param {Card} card - The card to return
     */
    returnCard(card) {
        this.cards.unshift(card);
        
        // Remove from discard pile if it exists there
        const index = this.discardPile.findIndex(c => c.id === card.id);
        if (index !== -1) {
            this.discardPile.splice(index, 1);
        }
    }

    /**
     * Reset the deck by shuffling discard pile back into deck
     */
    resetDeck() {
        if (this.discardPile.length === 0) {
            return;
        }

        this.cards = [...this.discardPile];
        this.discardPile = [];
        this.shuffle();
    }

    /**
     * Get the number of cards remaining in the deck
     * @returns {number} Number of cards
     */
    getRemainingCount() {
        return this.cards.length;
    }

    /**
     * Get the number of cards in discard pile
     * @returns {number} Number of discarded cards
     */
    getDiscardedCount() {
        return this.discardPile.length;
    }

    /**
     * Check if deck is empty
     * @returns {boolean} True if deck is empty
     */
    isEmpty() {
        return this.cards.length === 0;
    }

    /**
     * Peek at the top card without drawing it
     * @returns {Card|null} The top card or null if deck is empty
     */
    peek() {
        if (this.cards.length === 0) {
            return null;
        }
        return this.cards[this.cards.length - 1];
    }

    /**
     * Get deck statistics
     * @returns {Object} Deck statistics
     */
    getStats() {
        return {
            type: this.type,
            remaining: this.getRemainingCount(),
            discarded: this.getDiscardedCount(),
            total: this.getRemainingCount() + this.getDiscardedCount()
        };
    }

    /**
     * Get all cards in the deck (for debugging/testing)
     * @returns {Array<Card>} All cards in deck
     */
    getAllCards() {
        return [...this.cards];
    }

    /**
     * Get all cards in discard pile (for debugging/testing)
     * @returns {Array<Card>} All cards in discard pile
     */
    getDiscardedCards() {
        return [...this.discardPile];
    }
}