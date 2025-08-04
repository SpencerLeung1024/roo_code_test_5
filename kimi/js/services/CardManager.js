/**
 * CardManager - Manages the complete card system integration
 */
import { CardDeck } from '../models/CardDeck.js';
import { CardEffectService } from './CardEffectService.js';
import { CardUI } from '../ui/CardUI.js';
import { constants } from '../config/constants.js';
import { EventEmitter } from '../utils/EventEmitter.js';

export class CardManager extends EventEmitter {
    constructor(gameEngine) {
        super();
        this.gameEngine = gameEngine;
        this.chanceDeck = new CardDeck('chance');
        this.communityChestDeck = new CardDeck('community-chest');
        this.cardEffectService = new CardEffectService(gameEngine);
        this.cardUI = new CardUI();
        
        this.isProcessing = false;
        this.setupEventListeners();
    }

    /**
     * Initialize the card manager
     */
    init() {
        this.cardUI.init();
        this.cardUI.addStyles();
        console.log('CardManager initialized');
    }

    /**
     * Setup event listeners for game integration
     */
    setupEventListeners() {
        // Listen for player landing on Chance/Community Chest squares
        this.gameEngine.on('player:landed', this.handlePlayerLanded.bind(this));
        
        // Listen for card effect events
        this.cardEffectService.on('card:executed', this.handleCardExecuted.bind(this));
        this.cardEffectService.on('player:money-changed', this.handleMoneyChanged.bind(this));
        this.cardEffectService.on('player:moved', this.handlePlayerMoved.bind(this));
    }

    /**
     * Handle player landing on a square
     * @param {Object} data - Landing data
     */
    async handlePlayerLanded(data) {
        const { player, square } = data;
        
        if (this.isProcessing) return;
        
        if (square.type === 'chance' || square.type === 'community-chest') {
            this.isProcessing = true;
            await this.drawCard(square.type, player);
            this.isProcessing = false;
        }
    }

    /**
     * Draw a card from the specified deck
     * @param {string} deckType - 'chance' or 'community-chest'
     * @param {Player} player - The player drawing the card
     */
    async drawCard(deckType, player) {
        try {
            const deck = deckType === 'chance' ? this.chanceDeck : this.communityChestDeck;
            const card = deck.drawCard();
            
            if (!card) {
                console.error('No cards available in deck');
                return;
            }

            console.log(`${player.name} drew ${deckType} card: ${card.title}`);
            
            // Emit card drawn event
            this.emit('card:drawn', { 
                card, 
                player, 
                deckType, 
                remaining: deck.getRemainingCount() 
            });

            // Show card to player
            await this.showCardToPlayer(card, player);
            
        } catch (error) {
            console.error('Error drawing card:', error);
            this.emit('card:error', { error, player, deckType });
        }
    }

    /**
     * Show card to player and execute effect
     * @param {Card} card - The card to show
     * @param {Player} player - The player
     */
    async showCardToPlayer(card, player) {
        return new Promise((resolve) => {
            this.cardUI.showCard(card, async () => {
                try {
                    // Execute card effect
                    const result = await this.cardEffectService.executeCardEffect(card, player);
                    
                    // Show result in UI
                    this.cardUI.showEffectResult(result);
                    
                    // Handle special cards
                    if (card.effect === 'get-out-of-jail') {
                        // Keep Get Out of Jail Free cards
                        this.handleGetOutOfJailCard(card, player);
                    }
                    
                    // Return card to bottom of deck
                    this.returnCardToDeck(card);
                    
                    resolve(result);
                    
                } catch (error) {
                    console.error('Error executing card effect:', error);
                    resolve({ success: false, error: error.message });
                }
            });
        });
    }

    /**
     * Handle Get Out of Jail Free card
     * @param {Card} card - The card
     * @param {Player} player - The player
     */
    handleGetOutOfJailCard(card, player) {
        // These cards are kept by the player
        console.log(`${player.name} received Get Out of Jail Free card`);
        
        // Add card to player's inventory
        player.getOutOfJailFreeCards++;
        
        // Show notification
        this.showCardNotification(
            'Get Out of Jail Free',
            `${player.name} received a Get Out of Jail Free card!`
        );
        
        // Remove from deck permanently
        const deck = card.type === 'chance' ? this.chanceDeck : this.communityChestDeck;
        // Card is already in discard pile, no need to return it
    }

    /**
     * Handle Go to Jail card
     * @param {Card} card - The card
     * @param {Player} player - The player
     */
    handleGoToJailCard(card, player) {
        console.log(`${player.name} drew Go to Jail card`);
        
        // Show notification
        this.showCardNotification(
            'Go to Jail!',
            `${player.name} must go directly to jail!`
        );
        
        // Send player to jail
        player.goToJail();
    }

    /**
     * Show card notification
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     */
    showCardNotification(title, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'card-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#8e44ad',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: '1000',
            maxWidth: '300px',
            animation: 'slideIn 0.3s ease-out'
        });

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * Return card to bottom of deck
     * @param {Card} card - The card to return
     */
    returnCardToDeck(card) {
        const deck = card.type === 'chance' ? this.chanceDeck : this.communityChestDeck;
        
        // Don't return Get Out of Jail Free cards
        if (card.effect !== 'get-out-of-jail') {
            deck.returnCard(card);
        }
    }

    /**
     * Handle card execution result
     * @param {Object} data - Execution data
     */
    handleCardExecuted(data) {
        const { card, player, result } = data;
        console.log(`Card executed: ${card.title} for ${player.name}`, result);
        
        this.emit('card:effect-completed', { card, player, result });
    }

    /**
     * Handle money changes
     * @param {Object} data - Money change data
     */
    handleMoneyChanged(data) {
        const { player, amount, reason } = data;
        console.log(`${player.name} money changed by $${amount}: ${reason}`);
        
        this.emit('player:money-updated', { player, amount, reason });
    }

    /**
     * Handle player movement
     * @param {Object} data - Movement data
     */
    handlePlayerMoved(data) {
        const { player } = data;
        console.log(`${player.name} moved to position ${player.position}`);
        
        this.emit('player:position-updated', { player });
    }

    /**
     * Get deck statistics
     * @returns {Object} Statistics for both decks
     */
    getDeckStats() {
        return {
            chance: this.chanceDeck.getStats(),
            communityChest: this.communityChestDeck.getStats()
        };
    }

    /**
     * Reset both decks
     */
    resetDecks() {
        this.chanceDeck.resetDeck();
        this.communityChestDeck.resetDeck();
        console.log('All card decks reset');
    }

    /**
     * Shuffle both decks
     */
    shuffleDecks() {
        this.chanceDeck.shuffle();
        this.communityChestDeck.shuffle();
        console.log('All card decks shuffled');
    }

    /**
     * Get specific deck
     * @param {string} type - 'chance' or 'community-chest'
     * @returns {CardDeck} The requested deck
     */
    getDeck(type) {
        return type === 'chance' ? this.chanceDeck : this.communityChestDeck;
    }

    /**
     * Check if a player has Get Out of Jail Free cards
     * @param {Player} player - The player
     * @returns {Object} Object with chance and community chest card counts
     */
    getPlayerJailCards(player) {
        return {
            chance: player.getOutOfJailFreeCards > 0,
            communityChest: player.getOutOfJailFreeCards > 0
        };
    }

    /**
     * Use a Get Out of Jail Free card
     * @param {Player} player - The player
     * @param {string} type - 'chance' or 'community-chest'
     * @returns {boolean} True if card was used
     */
    useJailCard(player, type) {
        if (player.getOutOfJailFreeCards > 0) {
            player.getOutOfJailFreeCards--;
            player.inJail = false;
            player.jailTurns = 0;
            
            this.emit('jail:card-used', { player, type });
            return true;
        }
        return false;
    }

    /**
     * Destroy the card manager
     */
    destroy() {
        this.cardUI.destroy();
        this.removeAllListeners();
        console.log('CardManager destroyed');
    }
}