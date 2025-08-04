/**
 * CardEffectService - Handles execution of card effects
 */
import { constants } from '../config/constants.js';
import { EventEmitter } from '../utils/EventEmitter.js';

export class CardEffectService extends EventEmitter {
    constructor(gameEngine) {
        super();
        this.gameEngine = gameEngine;
        this.board = gameEngine.board;
        this.playerManager = gameEngine.playerManager;
    }

    /**
     * Execute a card effect
     * @param {Card} card - The card to execute
     * @param {Player} player - The player drawing the card
     * @returns {Promise<Object>} Promise resolving to effect result
     */
    async executeCardEffect(card, player) {
        try {
            console.log(`Executing ${card.type} card: ${card.title}`);
            
            // Execute the card effect
            const result = card.execute(player, this.gameEngine);
            
            // Handle special cases that need additional processing
            if (result.playerMoved) {
                await this.handlePlayerMovement(player, result);
            }
            
            if (result.moneyChanged) {
                await this.handleMoneyChange(player, result);
            }
            
            // Emit events for game state updates
            this.emit('card:executed', { card, player, result });
            
            // Update UI
            await this.updateUI(player, result);
            
            return result;
            
        } catch (error) {
            console.error('Error executing card effect:', error);
            return {
                success: false,
                message: 'Error executing card effect',
                error: error.message
            };
        }
    }

    /**
     * Handle player movement after card effect
     * @param {Player} player - The player
     * @param {Object} result - The effect result
     */
    async handlePlayerMovement(player, result) {
        // Animate player movement
        await this.animatePlayerMovement(player);
        
        // Check if player passed GO
        if (result.amount > 0) {
            this.emit('player:passed-go', { player, amount: result.amount });
        }
        
        // Handle landing on new square
        const square = this.board.getSquare(player.position);
        await this.handleLanding(square, player);
    }

    /**
     * Handle money changes
     * @param {Player} player - The player
     * @param {Object} result - The effect result
     */
    async handleMoneyChange(player, result) {
        // Update player display
        this.emit('player:money-changed', { 
            player, 
            amount: result.amount,
            reason: result.message 
        });
        
        // Check for bankruptcy
        if (player.money < 0) {
            await this.handleBankruptcy(player);
        }
    }

    /**
     * Handle player landing on square after movement
     * @param {Object} square - The square landed on
     * @param {Player} player - The player
     */
    async handleLanding(square, player) {
        switch (square.type) {
            case 'property':
                await this.handlePropertyLanding(square, player);
                break;
            case 'railroad':
                await this.handleRailroadLanding(square, player);
                break;
            case 'utility':
                await this.handleUtilityLanding(square, player);
                break;
            case 'tax':
                await this.handleTaxLanding(square, player);
                break;
            case 'go-to-jail':
                await this.handleGoToJailLanding(player);
                break;
            case 'jail':
                // Just visiting
                break;
            default:
                // No special handling needed
                break;
        }
    }

    /**
     * Handle property landing
     * @param {Object} square - The property square
     * @param {Player} player - The player
     */
    async handlePropertyLanding(square, player) {
        const property = this.gameEngine.propertyService.getProperty(square.name);
        
        if (!property.owner) {
            // Property is unowned - offer to buy
            this.emit('property:unowned', { property, player });
        } else if (property.owner !== player.id) {
            // Property is owned - pay rent
            const rent = this.gameEngine.rentService.calculateRent(property, player);
            const owner = this.playerManager.getPlayer(property.owner);
            
            if (owner) {
                player.money -= rent;
                owner.money += rent;
                
                this.emit('rent:paid', { 
                    from: player, 
                    to: owner, 
                    amount: rent, 
                    property: property 
                });
            }
        }
    }

    /**
     * Handle railroad landing
     * @param {Object} square - The railroad square
     * @param {Player} player - The player
     */
    async handleRailroadLanding(square, player) {
        const railroad = this.gameEngine.propertyService.getProperty(square.name);
        
        if (!railroad.owner) {
            this.emit('property:unowned', { property: railroad, player });
        } else if (railroad.owner !== player.id) {
            const owner = this.playerManager.getPlayer(railroad.owner);
            const railroadsOwned = this.gameEngine.propertyService.getPlayerRailroads(railroad.owner).length;
            const rent = constants.RAILROADS.RENTS[railroadsOwned - 1];
            
            if (owner) {
                player.money -= rent;
                owner.money += rent;
                
                this.emit('rent:paid', { 
                    from: player, 
                    to: owner, 
                    amount: rent, 
                    property: railroad 
                });
            }
        }
    }

    /**
     * Handle utility landing
     * @param {Object} square - The utility square
     * @param {Player} player - The player
     */
    async handleUtilityLanding(square, player) {
        const utility = this.gameEngine.propertyService.getProperty(square.name);
        
        if (!utility.owner) {
            this.emit('property:unowned', { property: utility, player });
        } else if (utility.owner !== player.id) {
            const owner = this.playerManager.getPlayer(utility.owner);
            const utilitiesOwned = this.gameEngine.propertyService.getPlayerUtilities(utility.owner).length;
            
            if (owner) {
                // For card effects, we use fixed multipliers
                // For normal landing, we'd roll dice
                const multiplier = constants.UTILITIES.RENT_MULTIPLIERS[utilitiesOwned - 1];
                const amount = multiplier * 10; // Assume dice roll of 10 for card effects
                
                player.money -= amount;
                owner.money += amount;
                
                this.emit('rent:paid', { 
                    from: player, 
                    to: owner, 
                    amount: amount, 
                    property: utility 
                });
            }
        }
    }

    /**
     * Handle tax landing
     * @param {Object} square - The tax square
     * @param {Player} player - The player
     */
    async handleTaxLanding(square, player) {
        player.money -= square.amount;
        this.emit('tax:paid', { player, amount: square.amount, type: square.name });
    }

    /**
     * Handle go to jail landing
     * @param {Player} player - The player
     */
    async handleGoToJailLanding(player) {
        player.position = constants.BOARD.JAIL_POSITION;
        player.inJail = true;
        player.jailTurns = 0;
        
        this.emit('player:jailed', { player });
    }

    /**
     * Handle bankruptcy
     * @param {Player} player - The player
     */
    async handleBankruptcy(player) {
        this.emit('player:bankrupt', { player });
    }

    /**
     * Animate player movement
     * @param {Player} player - The player
     */
    async animatePlayerMovement(player) {
        return new Promise(resolve => {
            this.emit('player:animate-move', { player });
            
            // Wait for animation to complete
            setTimeout(() => {
                resolve();
            }, constants.UI.TOKEN_MOVE_DURATION);
        });
    }

    /**
     * Update UI after card effect
     * @param {Player} player - The player
     * @param {Object} result - The effect result
     */
    async updateUI(player, result) {
        // Update player display
        this.emit('ui:update-player', { player });
        
        // Update board display
        this.emit('ui:update-board');
        
        // Show effect result
        if (result.message) {
            this.emit('ui:show-message', { 
                message: result.message, 
                type: result.success ? 'success' : 'error' 
            });
        }
    }

    /**
     * Get effect description for UI
     * @param {Card} card - The card
     * @returns {string} Effect description
     */
    getEffectDescription(card) {
        switch (card.effect) {
            case 'move-to':
                return `Move to ${this.board.getSquare(card.target).name}`;
            case 'move-near':
                return `Move to nearest ${card.target}`;
            case 'move-back':
                return 'Move back 3 spaces';
            case 'money-from-bank':
                return `Receive $${card.amount} from bank`;
            case 'money-to-bank':
                return `Pay $${card.amount} to bank`;
            case 'money-from-players':
                return `Collect $${card.amount} from each player`;
            case 'money-to-players':
                return `Pay $${card.amount} to each player`;
            case 'get-out-of-jail':
                return 'Get Out of Jail Free card';
            case 'repairs':
                return `Pay for repairs: $${card.target.house} per house, $${card.target.hotel} per hotel`;
            case 'go-to-jail':
                return 'Go directly to Jail';
            default:
                return card.description;
        }
    }
}