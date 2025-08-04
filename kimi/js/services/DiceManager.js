/**
 * Dice Manager Service
 * Integrates dice rolling with player movement and game rules
 */

import { dice } from '../models/Dice.js';
import { DiceUI } from '../ui/DiceUI.js';
import { constants } from '../config/constants.js';
import { debugLog } from '../config/constants.js';

/**
 * Dice Manager class for handling dice-related game logic
 */
export class DiceManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.currentPlayer = null;
        this.isProcessingRoll = false;
        this.rollQueue = [];
        this.diceUI = new DiceUI();
        
        this.init();
    }

    /**
     * Initialize the dice manager
     */
    init() {
        this.diceUI.init();
        this.bindEvents();
        debugLog('info', 'DiceManager initialized');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Listen for dice rolled events
        document.addEventListener('dice:rolled', (event) => {
            this.handleDiceRolled(event.detail);
        });

        // Listen for turn start events
        document.addEventListener('turn:start', (event) => {
            console.log('DiceManager received turn:start event:', event.detail);
            this.handleTurnStart(event.detail);
        });

        // Listen for turn end events
        document.addEventListener('turn:end', (event) => {
            console.log('DiceManager received turn:end event:', event.detail);
            this.handleTurnEnd(event.detail);
        });
    }

    /**
     * Handle turn start
     * @param {Object} eventData - Turn start event data
     */
    handleTurnStart(eventData) {
        this.currentPlayer = eventData.player;
        dice.setCanRoll(true);
        this.diceUI.setEnabled(true);
        
        debugLog('info', `Turn started for ${this.currentPlayer.name}, dice enabled`);
    }

    /**
     * Set the current player directly
     * @param {Player} player - Current player
     */
    setCurrentPlayer(player) {
        this.currentPlayer = player;
        console.log('DiceManager current player set to:', player?.name);
    }

    /**
     * Handle turn end
     * @param {Object} eventData - Turn end event data
     */
    handleTurnEnd(eventData) {
        dice.setCanRoll(false);
        this.diceUI.setEnabled(false);
        
        debugLog('info', `Turn ended for ${eventData.player.name}, dice disabled`);
    }

    /**
     * Handle dice rolled event
     * @param {Object} rollResult - Dice roll result
     */
    async handleDiceRolled(rollResult) {
        if (!this.currentPlayer || this.isProcessingRoll) {
            debugLog('warn', 'Ignoring dice roll: no current player or already processing');
            return;
        }

        this.isProcessingRoll = true;
        
        try {
            // Update player statistics
            this.currentPlayer.stats.totalDiceRolls++;
            if (rollResult.isDoubles) {
                this.currentPlayer.stats.doublesRolled++;
            }

            // Check for 3 doubles jail rule
            if (rollResult.shouldGoToJail) {
                await this.handleThreeDoublesJail();
                return;
            }

            // Handle jail dice rolling
            if (this.currentPlayer.inJail) {
                await this.handleJailDiceRoll(rollResult);
                return;
            }

            // Move player based on dice total
            await this.movePlayer(rollResult.total);

            // Check if player can roll again (doubles)
            if (rollResult.isDoubles && !this.currentPlayer.inJail) {
                debugLog('info', `${this.currentPlayer.name} rolled doubles, can roll again`);
                setTimeout(() => {
                    dice.setCanRoll(true);
                    diceUI.setRollingEnabled(true);
                }, 1000);
            } else {
                // End turn if no doubles or already in jail
                setTimeout(() => {
                    this.gameManager.endTurn();
                }, 1000);
            }

        } catch (error) {
            debugLog('error', 'Error processing dice roll:', error);
        } finally {
            this.isProcessingRoll = false;
        }
    }

    /**
     * Handle three doubles jail rule
     */
    async handleThreeDoublesJail() {
        debugLog('info', `${this.currentPlayer.name} rolled 3 doubles, going to jail`);
        
        // Show jail notification
        this.showNotification(
            'Speeding!',
            `${this.currentPlayer.name} rolled doubles three times in a row and is going to jail!`
        );

        // Send player to jail
        this.currentPlayer.goToJail();
        
        // Reset doubles count
        dice.doublesCount = 0;
        
        // End turn
        setTimeout(() => {
            this.gameManager.endTurn();
        }, 2000);
    }

    /**
     * Handle dice roll when player is in jail
     * @param {Object} rollResult - Dice roll result
     */
    async handleJailDiceRoll(rollResult) {
        debugLog('info', `${this.currentPlayer.name} rolled in jail: ${rollResult.dice1} + ${rollResult.dice2} = ${rollResult.total}`);
        
        if (rollResult.isDoubles) {
            // Player rolled doubles - gets out of jail
            debugLog('info', `${this.currentPlayer.name} rolled doubles and is out of jail`);
            
            this.showNotification(
                'Lucky Roll!',
                `${this.currentPlayer.name} rolled doubles and is free from jail!`
            );
            
            // Release from jail
            this.currentPlayer.getOutOfJail(false);
            
            // Move player based on dice total
            await this.movePlayer(rollResult.total);
            
            // Check if player can roll again (doubles)
            setTimeout(() => {
                if (rollResult.isDoubles) {
                    dice.setCanRoll(true);
                    diceUI.setRollingEnabled(true);
                } else {
                    this.gameManager.endTurn();
                }
            }, 1000);
        } else {
            // Player stays in jail
            debugLog('info', `${this.currentPlayer.name} did not roll doubles, stays in jail`);
            
            this.showNotification(
                'Still in Jail',
                `${this.currentPlayer.name} did not roll doubles and remains in jail`
            );
            
            // Increment jail turns
            this.currentPlayer.jailTurns++;
            this.currentPlayer.stats.turnsInJail++;
            
            // Check if player must pay fine (3rd turn)
            if (this.currentPlayer.jailTurns >= constants.JAIL.MAX_TURNS_IN_JAIL) {
                debugLog('info', `${this.currentPlayer.name} must pay fine to get out of jail`);
                
                setTimeout(() => {
                    this.handleForcedJailExit();
                }, 2000);
            } else {
                // End turn
                setTimeout(() => {
                    this.gameManager.endTurn();
                }, 2000);
            }
        }
    }

    /**
     * Handle forced jail exit after 3 turns
     */
    async handleForcedJailExit() {
        if (!this.currentPlayer.inJail) return;

        if (this.currentPlayer.money >= constants.JAIL.BAIL_AMOUNT) {
            this.currentPlayer.removeMoney(constants.JAIL.BAIL_AMOUNT, 'Jail fine (forced)');
            this.currentPlayer.getOutOfJail(false);
            
            this.showNotification(
                'Jail Fine Paid',
                `${this.currentPlayer.name} paid $50 to get out of jail`
            );
        } else {
            // Handle bankruptcy
            this.showNotification(
                'Bankruptcy',
                `${this.currentPlayer.name} cannot afford the jail fine and must declare bankruptcy`
            );
            this.currentPlayer.declareBankrupt();
        }
        
        setTimeout(() => {
            this.gameManager.endTurn();
        }, 2000);
    }

    /**
     * Move player based on dice roll
     * @param {number} spaces - Number of spaces to move
     */
    async movePlayer(spaces) {
        if (!this.currentPlayer) return;

        const currentPosition = this.currentPlayer.getPosition();
        const boardSize = constants.BOARD.SIZE;
        const newPosition = (currentPosition + spaces) % boardSize;

        debugLog('info', `Moving ${this.currentPlayer.name} ${spaces} spaces from ${currentPosition} to ${newPosition}`);

        // Move player
        this.currentPlayer.moveTo(newPosition);

        // Dispatch player move event
        const moveEvent = new CustomEvent('player:move', {
            detail: {
                player: this.currentPlayer,
                from: currentPosition,
                to: newPosition,
                spaces: spaces,
                passedGo: newPosition < currentPosition && currentPosition !== 0
            }
        });
        document.dispatchEvent(moveEvent);

        // Handle landing on square
        await this.handleLanding(newPosition);
    }

    /**
     * Handle player landing on a square
     * @param {number} position - Board position
     */
    async handleLanding(position) {
        const square = constants.BOARD_SQUARES[position];
        if (!square) return;

        debugLog('info', `${this.currentPlayer.name} landed on ${square.name}`);

        // Handle different square types
        switch (square.type) {
            case 'property':
                await this.handlePropertyLanding(square);
                break;
            case 'railroad':
                await this.handleRailroadLanding(square);
                break;
            case 'utility':
                await this.handleUtilityLanding(square);
                break;
            case 'tax':
                await this.handleTaxLanding(square);
                break;
            case 'chance':
                await this.handleChanceLanding(square);
                break;
            case 'community-chest':
                await this.handleCommunityChestLanding(square);
                break;
            case 'go-to-jail':
                await this.handleGoToJailLanding(square);
                break;
            case 'jail':
                // Just visiting
                debugLog('info', `${this.currentPlayer.name} is just visiting jail`);
                break;
            default:
                debugLog('info', `${this.currentPlayer.name} landed on ${square.name}`);
        }
    }

    /**
     * Handle property landing
     * @param {Object} square - Property square data
     */
    async handlePropertyLanding(square) {
        // Dispatch property landed event for TurnActions to handle
        const event = new CustomEvent('property:landed', {
            detail: {
                player: this.currentPlayer,
                property: square
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Handle railroad landing
     * @param {Object} square - Railroad square data
     */
    async handleRailroadLanding(square) {
        const event = new CustomEvent('property:landed', {
            detail: {
                player: this.currentPlayer,
                property: square
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Handle utility landing
     * @param {Object} square - Utility square data
     */
    async handleUtilityLanding(square) {
        const event = new CustomEvent('property:landed', {
            detail: {
                player: this.currentPlayer,
                property: square
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Handle property landed (alias for handlePropertyLanding)
     * @param {Object} square - Property square data
     */
    async handlePropertyLanded(square) {
        await this.handlePropertyLanding(square);
    }

    /**
     * Handle tax landing
     * @param {Object} square - Tax square data
     */
    async handleTaxLanding(square) {
        const amount = square.amount || 0;
        
        this.showNotification(
            'Tax Time!',
            `${this.currentPlayer.name} must pay $${amount} for ${square.name}`
        );

        this.currentPlayer.removeMoney(amount, square.name);
    }

    /**
     * Handle chance landing
     * @param {Object} square - Chance square data
     */
    async handleChanceLanding(square) {
        const event = new CustomEvent('card:drawn', {
            detail: {
                player: this.currentPlayer,
                type: 'chance',
                square: square
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Handle community chest landing
     * @param {Object} square - Community chest square data
     */
    async handleCommunityChestLanding(square) {
        const event = new CustomEvent('card:drawn', {
            detail: {
                player: this.currentPlayer,
                type: 'community-chest',
                square: square
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Handle go to jail landing
     * @param {Object} square - Go to jail square data
     */
    async handleGoToJailLanding(square) {
        this.showNotification(
            'Go to Jail!',
            `${this.currentPlayer.name} must go directly to jail!`
        );

        this.currentPlayer.goToJail();
    }

    /**
     * Show notification to user
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     */
    showNotification(title, message) {
        // This would integrate with a notification system
        debugLog('info', `Notification: ${title} - ${message}`);
        
        // Simple alert for now - replace with proper notification system
        setTimeout(() => {
            alert(`${title}\n\n${message}`);
        }, 500);
    }

    /**
     * Roll the dice for the current player
     */
    rollDice() {
        console.log('DiceManager.rollDice() called');
        if (!this.canRollDice()) {
            console.log('Cannot roll dice:', {
                hasCurrentPlayer: !!this.currentPlayer,
                isProcessingRoll: this.isProcessingRoll,
                diceCanRoll: dice.canRoll,
                isBankrupt: this.currentPlayer?.isBankrupt
            });
            debugLog('warn', 'Cannot roll dice: conditions not met');
            return null;
        }

        console.log('Rolling dice...');
        const result = dice.roll();
        console.log('Dice rolled:', result);
        this.handleDiceRolled(result);
        return result;
    }

    /**
     * Force a dice roll (for testing or special events)
     * @param {number} dice1 - First die value
     * @param {number} dice2 - Second die value
     */
    forceRoll(dice1, dice2) {
        if (this.isProcessingRoll) {
            debugLog('warn', 'Cannot force roll: already processing');
            return;
        }

        const result = dice.simulateRoll(dice1, dice2);
        this.handleDiceRolled(result);
    }

    /**
     * Get current dice state
     * @returns {Object} Current dice state
     */
    getState() {
        return {
            ...dice.getState(),
            isProcessingRoll: this.isProcessingRoll,
            currentPlayer: this.currentPlayer?.id || null
        };
    }

    /**
     * Reset dice manager state
     */
    reset() {
        this.currentPlayer = null;
        this.isProcessingRoll = false;
        this.rollQueue = [];
        dice.reset();
        this.diceUI.reset();
        
        debugLog('info', 'DiceManager reset');
    }

    /**
     * Set whether dice can be rolled
     * @param {boolean} canRoll - Whether dice can be rolled
     */
    setCanRoll(canRoll) {
        dice.setCanRoll(canRoll);
    }

    /**
     * Check if it's valid to roll dice
     * @returns {boolean} Whether dice can be rolled
     */
    canRollDice() {
        return this.currentPlayer &&
               !this.isProcessingRoll &&
               dice.canRoll &&
               !this.currentPlayer.isBankrupt;
    }
}

// Create singleton instance
export let diceManager = null;

/**
 * Initialize dice manager with game manager
 * @param {Object} gameManager - Game manager instance
 */
export function initDiceManager(gameManager) {
    if (!diceManager) {
        diceManager = new DiceManager(gameManager);
    }
    return diceManager;
}