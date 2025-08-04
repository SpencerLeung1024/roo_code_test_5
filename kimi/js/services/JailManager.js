/**
 * Jail Manager Service
 * Handles all jail-related game logic and state management
 */

import { constants } from '../config/constants.js';
import { debugLog } from '../config/constants.js';
import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * Jail Manager class for handling jail mechanics
 */
export class JailManager extends EventEmitter {
    constructor(gameEngine) {
        super();
        this.gameEngine = gameEngine;
        this.jailQueue = [];
    }

    /**
     * Initialize the jail manager
     */
    init() {
        this.setupEventListeners();
        debugLog('info', 'JailManager initialized');
    }

    /**
     * Setup event listeners for jail-related events
     */
    setupEventListeners() {
        // Listen for jail-related UI events
        document.addEventListener('jail:pay-fine', () => {
            this.handlePayFine();
        });

        document.addEventListener('jail:use-card', () => {
            this.handleUseCard();
        });

        document.addEventListener('jail:roll-doubles', () => {
            this.handleRollDoubles();
        });

        // Listen for player movement
        document.addEventListener('player:move', (event) => {
            this.handlePlayerMove(event.detail);
        });
    }

    /**
     * Send a player to jail
     * @param {Player} player - The player to send to jail
     * @param {string} reason - Reason for going to jail
     */
    sendToJail(player, reason = 'General rule violation') {
        if (!player || player.inJail) return false;

        debugLog('info', `Sending ${player.name} to jail: ${reason}`);

        // Update player state
        player.inJail = true;
        player.jailTurns = 0;
        player.position = constants.BOARD.JAIL_POSITION;

        // Update statistics
        player.stats.turnsInJail++;

        // Emit jail entry event
        this.emit('jail:entered', {
            player: player,
            reason: reason
        });

        // Show jail notification
        this.showJailNotification('Jail', `${player.name} is now in jail!`);

        return true;
    }

    /**
     * Release a player from jail
     * @param {Player} player - The player to release
     * @param {string} method - Method of release (pay, card, doubles)
     */
    releaseFromJail(player, method = 'unknown') {
        if (!player || !player.inJail) return false;

        debugLog('info', `Releasing ${player.name} from jail via ${method}`);

        // Update player state
        player.inJail = false;
        player.jailTurns = 0;

        // Emit jail exit event
        this.emit('jail:exited', {
            player: player,
            method: method
        });

        // Show release notification
        const messages = {
            pay: 'paid the fine',
            card: 'used a Get Out of Jail Free card',
            doubles: 'rolled doubles'
        };

        this.showJailNotification(
            'Free!',
            `${player.name} is out of jail (${messages[method] || method})`
        );

        return true;
    }

    /**
     * Handle jail turn for a player
     * @param {Player} player - The player whose turn it is
     */
    handleJailTurn(player) {
        if (!player || !player.inJail) return;

        debugLog('info', `Handling jail turn for ${player.name}`);

        // Check if player has Get Out of Jail Free cards
        const hasCards = player.getOutOfJailFreeCards > 0;

        // Show jail modal with options
        if (window.jailUI) {
            window.jailUI.showJailModal(player);
        }

        // Log jail status
        this.logJailStatus(player);
    }

    /**
     * Handle paying fine to get out of jail
     */
    handlePayFine() {
        const player = this.gameEngine.getCurrentPlayer();
        if (!player || !player.inJail) return;

        if (player.money < constants.JAIL.BAIL_AMOUNT) {
            this.showJailNotification('Error', 'Not enough money to pay fine!');
            return;
        }

        // Deduct money
        player.removeMoney(constants.JAIL.BAIL_AMOUNT, 'Jail fine');

        // Release player
        this.releaseFromJail(player, 'pay');

        // Hide jail modal
        if (window.jailUI) {
            window.jailUI.hideJailModal();
        }

        // Allow player to roll dice
        this.gameEngine.diceManager.setCanRoll(true);
    }

    /**
     * Handle using Get Out of Jail Free card
     */
    handleUseCard() {
        const player = this.gameEngine.getCurrentPlayer();
        if (!player || !player.inJail) return;

        if (player.getOutOfJailFreeCards <= 0) {
            this.showJailNotification('Error', 'No Get Out of Jail Free cards available!');
            return;
        }

        // Use card
        player.getOutOfJailFreeCards--;

        // Release player
        this.releaseFromJail(player, 'card');

        // Hide jail modal
        if (window.jailUI) {
            window.jailUI.hideJailModal();
        }

        // Allow player to roll dice
        this.gameEngine.diceManager.setCanRoll(true);
    }

    /**
     * Handle rolling doubles to get out of jail
     */
    handleRollDoubles() {
        const player = this.gameEngine.getCurrentPlayer();
        if (!player || !player.inJail) return;

        // Hide jail modal
        if (window.jailUI) {
            window.jailUI.hideJailModal();
        }

        // Allow dice rolling
        this.gameEngine.diceManager.setCanRoll(true);
    }

    /**
     * Handle player movement
     * @param {Object} moveData - Movement data
     */
    handlePlayerMove(moveData) {
        const { player, to } = moveData;

        // Check if player landed on Go to Jail
        if (to === constants.BOARD.GO_TO_JAIL_POSITION) {
            this.sendToJail(player, 'Landed on Go to Jail');
        }
    }

    /**
     * Check if player must pay forced fine
     * @param {Player} player - The player
     * @returns {boolean} True if forced payment is required
     */
    mustPayForcedFine(player) {
        return player.inJail && player.jailTurns >= constants.JAIL.MAX_TURNS_IN_JAIL;
    }

    /**
     * Force player to pay fine
     * @param {Player} player - The player
     */
    forcePayFine(player) {
        if (!this.mustPayForcedFine(player)) return;

        if (player.money < constants.JAIL.BAIL_AMOUNT) {
            // Handle bankruptcy
            player.declareBankrupt();
            return;
        }

        // Deduct money
        player.removeMoney(constants.JAIL.BAIL_AMOUNT, 'Jail fine (forced)');

        // Release player
        this.releaseFromJail(player, 'pay');

        this.showJailNotification(
            'Jail Fine',
            `${player.name} was forced to pay $50 to get out of jail`
        );
    }

    /**
     * Check if player can collect rent while in jail
     * @param {Player} player - The player
     * @returns {boolean} True if rent can be collected
     */
    canCollectRentInJail(player) {
        return true; // Standard Monopoly rules allow rent collection in jail
    }

    /**
     * Get jail status for a player
     * @param {Player} player - The player
     * @returns {Object} Jail status information
     */
    getJailStatus(player) {
        if (!player) return null;

        return {
            isInJail: player.inJail,
            jailTurns: player.jailTurns,
            maxTurns: constants.JAIL.MAX_TURNS_IN_JAIL,
            remainingTurns: constants.JAIL.MAX_TURNS_IN_JAIL - player.jailTurns,
            hasCards: player.getOutOfJailFreeCards > 0,
            cardCount: player.getOutOfJailFreeCards,
            canPayFine: player.money >= constants.JAIL.BAIL_AMOUNT
        };
    }

    /**
     * Log jail status for debugging
     * @param {Player} player - The player
     */
    logJailStatus(player) {
        const status = this.getJailStatus(player);
        debugLog('info', `Jail status for ${player.name}:`, status);
    }

    /**
     * Show jail notification
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     */
    showJailNotification(title, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'jail-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#e74c3c',
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
     * Reset jail manager state
     */
    reset() {
        this.jailQueue = [];
        debugLog('info', 'JailManager reset');
    }

    /**
     * Get jail statistics
     * @returns {Object} Jail statistics
     */
    getJailStats() {
        const players = this.gameEngine.playerManager.getActivePlayers();
        
        let totalJailTime = 0;
        let playersInJail = 0;
        let totalCards = 0;
        
        players.forEach(player => {
            totalJailTime += player.stats.turnsInJail;
            if (player.inJail) playersInJail++;
            totalCards += player.getOutOfJailFreeCards;
        });
        
        return {
            totalJailTime,
            playersInJail,
            totalCards,
            averageJailTime: totalJailTime / players.length,
            bailAmount: constants.JAIL.BAIL_AMOUNT,
            maxTurns: constants.JAIL.MAX_TURNS_IN_JAIL
        };
    }
}